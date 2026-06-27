from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid

class DNSRecord(SQLModel, table=True):
    __tablename__ = "dns_records"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    hosted_zone_id: str = Field(foreign_key="hosted_zones.id", index=True)
    name: str = Field(max_length=253)
    type: str  # A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA
    ttl: int = Field(default=300)
    value: str  # newline-separated for multiple values
    routing_policy: str = Field(default="Simple")
    comment: Optional[str] = Field(default=None, max_length=256)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

