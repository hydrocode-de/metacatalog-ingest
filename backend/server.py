from typing import List, Optional, Literal, Annotated
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from metacatalog import api

import polars as pl

import models
import db_install

# create the Settings class
class Settings(BaseSettings):
    uri: str = Field("postgresql://postgres:postgres@localhost:5432/metacatalog", alias='METACATALOG_URI')
    base_path: Path = Path(__file__).resolve().parent

    # uvicorn settings
    host: str = '127.0.0.1'
    port: int = 8000
    reload: bool = True

# load settings from possible .env file and instatiate the settings
load_dotenv()
settings = Settings()


# before we create the connection, we check the database
if not db_install.is_installed():
    print('Database tables not installed, installing now...')
    db_install.install_tables()

# create a metacatalog session
session = api.connect_database(settings.uri)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your desired origins
    allow_methods=["*"],  # Update with your desired HTTP methods
    allow_headers=["*"],  # Update with your desired headers
)

# main backend routes
@app.get("/api/licenses", response_model=List[models.License])
def get_licenses():
    # get all licenses
    licenses = api.find_license(session)
    return [license.to_dict() for license in licenses]

@app.get("/api/variables", response_model=List[models.Variable])
def get_variables():
    # get all variables
    variables = api.find_variable(session)
    return [variable.to_dict() for variable in variables]

@app.get("/api/keywords", response_model=List[models.Keyword])
def get_keywords(name: Optional[str] = None):
    # get all keywords
    keywords = api.find_keyword(session, value=f"%{name.upper()}%" if name else None)
    return [keyword.to_dict() for keyword in keywords]

@app.get("/api/keyword/{uuid}", response_model=models.Keyword)
def get_keyword(uuid: str):
    # get a specific keyword
    keyword = api.find_keyword(session, uuid=uuid, return_iterator=True).first()
    if keyword is not None:
        return keyword.to_dict()
    else:
        return None
    
@app.get("/api/authors", response_model=List[models.Author])
def get_authors():
    # get all authors
    authors = [{**author.to_dict(), 'is_organisation': False} for author in api.find_person(session)]

    # get all organisations
    organizations = [{**org.to_dict(), 'is_organisation': True} for org in api.find_organisation(session)]

    return [entity for entity in [*authors, *organizations]]

@app.put("/api/author", response_model=models.Author)
def create_author(data: models.Author):
    # check if this is an organization
    if data.is_organisation:
        new_author = api.add_organisation(session, **{k: v for k, v in data.model_dump().items() if k not in ('id', 'uuid', 'is_organisation')})
    else:
        new_author = api.add_person(session, **{k: v for k, v in data.model_dump().items() if k not in ('id', 'uuid', 'is_organisation')})
    return new_author.to_dict()

    
# some helper functions to do stuff
@app.get("/api/datasets/exists")
def title_exists(title: str) -> bool:
    # check if the given title exists
    entry = api.find_entry(session, title=title, return_iterator=True).first()

    return entry is not None

# data-file previews
class ColumnPreview(BaseModel):
    name: str
    data_type: Literal['number'] | Literal['string'] | Literal['datetime']

class DataPreview(BaseModel):
    num_rows: int
    columns: List[ColumnPreview]

@app.post("/api/data/preview", response_model=DataPreview)
async def preview_data(file: UploadFile):
    # TODO: add a check for the file type
    try:
        # Read the uploaded file
        df = pl.read_csv(file.file, try_parse_dates=True)
        
        # Get column names and data types
        column_names = df.columns
        column_types = ['datetime' if _.is_temporal() else 'number' if _.is_numeric() else 'string' for _ in df.dtypes]
        
        # Get number of rows
        num_rows = len(df)
        
        return {
            'columns': [{'name': name, 'data_type': data_type} for name, data_type in zip(column_names, column_types)],
            'num_rows': num_rows,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_data(file: UploadFile, metadata: Annotated[str, Form()]):
    # try to read the JSON
    try:
        meta = models.Metadata.model_validate_json(metadata)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

    # use metacatalog to add the metadata
    try:
        entry = api.add_entry(
            session=session,
            title=meta.title,
            abstract=meta.abstract,
            author=meta.firstAuthor.id,
            location=meta.location.wkt if meta.location is not None else None,
            variable=meta.variable.id,
            external_id=meta.external_id,
            license=meta.license.id,
            embargo=meta.embargo,
            is_partial=False
        )
    except Exception as e:
        return {'status': 'error', 'message': f"[API.add_entry]: Entry not created. Details: {str(e)}"}
    
    # associate the co-authors
    try:
        if meta.coAuthors is not None and len(meta.coAuthors) > 0:
            api.add_persons_to_entries(
                session=session,
                entries=entry.id,
                persons=[author.id for author in meta.coAuthors],
                roles=['coAuthor' for _ in meta.coAuthors],
                order=[i + 2 for i in range(len(meta.coAuthors))]
            )
    except Exception as e:
        return {'status': 'error', 'message': f"[API.add_persons_to_entries]: Co-Authors not added. Details: {str(e)}"}

    # associate the keywords if any additional are given
    try:
        if len(meta.keywords) > 0:
            api.add_keywords_to_entries(session=session, entries=entry.id, keywords=[keyword.id for keyword in meta.keywords], )
    except Exception as e:
        return {'status': 'error', 'message': f"[API.add_keywords_to_entries]: Keywords not added. Details: {str(e)}"}
        
    # associate details to the entry if any are given
    try:
        if len(meta.details) > 0:
            api.add_details_to_entries(
                session=session, 
                entries=entry.id, 
                details=[dict(key=detail.name, value=detail.value) for detail in meta.details]  # TODO: here, more than string is possible
            )
    except Exception as e:
        return {'status': 'error', 'message': f"[API.add_details_to_entries]: Details not added. Details: {str(e)}"}
    
    # create the data source
    if meta.dataSource is not None:
        try:
            # build the tablename from the filename
            tablename = '_'.join([chunk for chunk in file.filename.split('.')[:-1]])
            ds = entry.create_datasource(
                path=tablename, # TODO: this is not yet correct
                type=meta.dataSource.type,
                datatype='timeseries', # TODO: this is just a shortcut
                variable_names=meta.dataSource.variable_names,
                commit=True
            )
        except Exception as e:
            return {'status': 'error', 'message': f"[API.create_datasource]: DataSource not created. Details: {str(e)}"}

        # add the scales
        try:
            if meta.dataSource.temporal_scale is not None:
                ds.create_scale(
                    scale_dimension='temporal',
                    resolution=f"{meta.dataSource.temporal_scale.resolution}{meta.dataSource.temporal_scale.resolution_unit}" if meta.dataSource.temporal_scale.resolution is not None else "",
                    extent=[
                        meta.dataSource.temporal_scale.observation_start,
                        meta.dataSource.temporal_scale.observation_end
                    ],
                    support=1.0,
                    dimension_names = meta.dataSource.temporal_scale.dimension_names,
                    commit=True
                )
            if meta.dataSource.spatial_scale is not None:
                ds.create_scale(
                    scale_dimension='spatial',
                    resolution=meta.dataSource.spatial_scale.resolution,
                    extent=meta.dataSource.spatial_scale.extent,
                    support=1.0,
                    dimension_names = meta.dataSource.spatial_scale.dimension_names,
                    commit=True
                )
        except Exception as e:
            return {'status': 'error', 'message': f"[API.create_scale]: Scales not created. Details: {str(e)}"}

        # TODO: some kind of profiling here

        # finally handle the upload of the data if it is a CSV file
        # TODO: there has to be some kind of file-handler here
        try:
            df = pl.read_csv(file.file, try_parse_dates=True)
            df.write_database(f'data."{ds.path}"', settings.uri, if_table_exists='append')
        except Exception as e:
            return {'status': 'error', 'message': f"[pl.read_csv]: Data not uploaded. Details: {str(e)}"}

    # TODO: add error boundaries here and return more meaningful messages
    return {'status': 'success', 'message': f"Created new Entry <ID={entry.id}>"}


# Mount the static files directory
app.mount("/", StaticFiles(directory= settings.base_path / 'static', html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", reload=settings.reload, host=settings.host, port=settings.port)
