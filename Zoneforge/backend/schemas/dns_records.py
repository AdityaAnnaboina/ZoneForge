from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime

VALID_RECORD_TYPES = ["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"]
VALID_ROUTING_POLICIES = ["Simple", "Weighted", "Latency", "Failover", "Geolocation", "Multivalue"]

class DNSRecordCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=253)
    type: str
    ttl: int = Field(300, ge=0, le=2147483647)
    value: str = Field(..., min_length=1)
    routing_policy: str = Field("Simple")
    comment: Optional[str] = Field(None, max_length=256)

    @field_validator('type')
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in VALID_RECORD_TYPES:
            raise ValueError(f'type must be one of {VALID_RECORD_TYPES}')
        return v

    @field_validator('routing_policy')
    @classmethod
    def validate_routing_policy(cls, v: str) -> str:
        if v not in VALID_ROUTING_POLICIES:
            raise ValueError(f'routing_policy must be one of {VALID_ROUTING_POLICIES}')
        return v

class DNSRecordUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=253)
    ttl: Optional[int] = Field(None, ge=0, le=2147483647)
    value: Optional[str] = Field(None, min_length=1)
    routing_policy: Optional[str] = Field(None)
    comment: Optional[str] = Field(None, max_length=256)

    @field_validator('routing_policy')
    @classmethod
    def validate_routing_policy(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_ROUTING_POLICIES:
            raise ValueError(f'routing_policy must be one of {VALID_ROUTING_POLICIES}')
        return v

class DNSRecordResponse(BaseModel):
    id: str
    hosted_zone_id: str
    name: str
    type: str
    ttl: int
    value: str
    routing_policy: str
    comment: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaginatedDNSRecords(BaseModel):
    items: List[DNSRecordResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

