from typing import List, Optional, Literal, Annotated
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from metacatalog import api

import polars as pl

import models

load_dotenv()

# figure out the paths
BASE = Path(__file__).resolve().parent
URI = os.getenv('METACATALOG_URI', 'postgresql://postgres:postgres@localhost:5432/metacatalog')

# create a metacatalog session
session = api.connect_database(URI)

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

# @app.post("/api/license", response_model=models.License)
# def create_license(data: models.License | str | int):
#     # check the type of the data
#     if isinstance(data, str):
#         license = api.find_license(session, short_title=data, return_iterator=True).first()
#         if license is None:
#             license = api.find_license(session, title=data, return_iterator=True).first()
#     elif isinstance(data, int):
#         license = api.find_license(session, id=data, return_iterator=True).first()
#     else:
#         license = api.add_license(session, **data)
    
#     # check the type
#     if license is not None:
#         return license.to_dict()
#     else:
#         raise HTTPException(status_code=404, detail=f"License with id / short_title {data} not found")

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
    #api.add_entry(session, )
    # development -> print
    print(meta)

    # upload the data using polars
    df = pl.read_csv(file.file, try_parse_dates=True)
    print(df)

    import time
    time.sleep(3)
    return {'message': 'success'}


# Mount the static files directory
app.mount("/", StaticFiles(directory= BASE / 'static', html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", reload=True)
