from typing import List, Literal, Optional
from pydantic import BaseModel


class License(BaseModel):
    id: int
    short_title: str
    title: str
    by_attribution: Optional[bool] = None
    share_alike: Optional[bool] = None
    commercial_use: Optional[bool] = None
    summary: str
    link: str

class Unit(BaseModel):
    id: int
    name: str
    symbol: str

class Thesaurus(BaseModel):
    id: int
    uuid: str
    name: str
    title: str
    organisation: str
    url: str
    description: str


class Keyword(BaseModel):
    id: int
    uuid: str
    value: str
    path: str
    children: List[str]
    thesaurusName: Thesaurus


class Variable(BaseModel):
    id: int
    name: str
    symbol: str
    unit: Unit
    column_names: List[str]
    keyword: Optional[Keyword] = None


class Author(BaseModel):
    id: Optional[int] = None
    uuid: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_organisation: Optional[bool] = None
    affiliation: Optional[str] = None
    attribution: Optional[str] = None
    organisation_name: Optional[str] = None
    organisation_abbrev: Optional[str] = None


class Detail(BaseModel):
    id: Optional[int] = None 
    name: Optional[str] = None
    value: Optional[str | float | bool | dict] = None
    type: Optional[Literal['string']] = None


class TemporalScale(BaseModel):
    id: Optional[int] = None
    dimension_names: List[str] = []
    observation_start: Optional[str] = None
    observation_end: Optional[str] = None
    resolution: Optional[int] = None
    resolution_unit: Optional[str] = None

    
class SpatialScale(BaseModel):
    id: Optional[int] = None
    dimension_names: List[str] = []
    extent: Optional[str] = None
    resolution: Optional[int] = None


class DataSource(BaseModel):
    id: Optional[int] = None
    type: Optional[Literal['internal', 'netCDF']] = None
    variable_names: List[str] = []
    temporal_scale: Optional[TemporalScale] = None
    spatial_scale: Optional[SpatialScale] = None


class Location(BaseModel):
    longitude: Optional[float] = None
    latitude: Optional[float] = None

    @property
    def wkt(self):
        return f'POINT ({self.longitude} {self.latitude})'

class Metadata(BaseModel):
    id: Optional[int] = None
    uuid: Optional[str] = None
    title: Optional[str] = None
    abstract: Optional[str] = None
    external_id: Optional[str] = None
    embargo: bool = False
    location: Optional[Location] = None
    firstAuthor: Optional[Author] = None
    coAuthors: List[Author] = []
    license_id: Optional[int] = None
    license: Optional[License] = None
    variable_id: Optional[int] = None
    variable: Optional[Variable] = None
    keywords: List[Keyword] = []
    details: List[Detail] = []
    dataSource: Optional[DataSource] = None
    