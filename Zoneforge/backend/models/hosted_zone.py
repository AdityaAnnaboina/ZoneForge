from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

class HostedZone(SQLModel, table=True):
    __tablename__ = "hosted_zones"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str = Field(index=True, max_length=253)
    type: str = Field(default="Public")
    comment: Optional[str] = Field(default=None, max_length=256)
    record_count: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
