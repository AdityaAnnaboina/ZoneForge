from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime

class HostedZoneCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=253)
    type: str = Field("Public")
    comment: Optional[str] = Field(None, max_length=256)

    @field_validator('type')
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ("Public", "Private"):
            raise ValueError('type must be Public or Private')
        return v

class HostedZoneUpdate(BaseModel):
    type: Optional[str] = Field(None)
    comment: Optional[str] = Field(None, max_length=256)

    @field_validator('type')
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("Public", "Private"):
            raise ValueError('type must be Public or Private')
        return v

class HostedZoneResponse(BaseModel):
    id: str
    name: str
    type: str
    comment: Optional[str]
    record_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaginatedHostedZones(BaseModel):
    items: List[HostedZoneResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

