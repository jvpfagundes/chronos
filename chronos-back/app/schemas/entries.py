from typing import Optional

from pydantic import BaseModel
from .base import DateTimeRangeSchema


class ProjectSchema(BaseModel):
    name: str



class EntriesSchema(DateTimeRangeSchema):
    title: str
    description: str
    datm_interval_start: Optional[str] = None
    datm_interval_end: Optional[str] = None
    date: str
    project_id: int