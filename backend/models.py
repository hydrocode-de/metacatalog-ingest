from typing import List, Optional
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


class Metadata(BaseModel):
    id: int
    uuid: str