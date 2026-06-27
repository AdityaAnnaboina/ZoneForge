from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlmodel import Session, select
from sqlalchemy import func
from math import ceil
from datetime import datetime
import uuid

from database import get_session
from models.user import User
from models.hosted_zone import HostedZone
from models.dns_record import DNSRecord
from schemas.dns_records import DNSRecordCreate, DNSRecordResponse, DNSRecordUpdate, PaginatedDNSRecords
from dependencies import get_current_user

router = APIRouter(tags=["DNS Records"])

@router.get("/api/hosted-zones/{zone_id}/records", response_model=PaginatedDNSRecords)
def list_dns_records(
    zone_id: str,
    search: str = "",
    type_filter: str = "",
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    try:
        # Verify zone exists
        zone = db.exec(select(HostedZone).where(HostedZone.id == zone_id)).first()
        if not zone:
            raise HTTPException(status_code=404, detail="Hosted zone not found")
            
        # Build query
        query = select(DNSRecord).where(DNSRecord.hosted_zone_id == zone_id)
        count_query = select(func.count(DNSRecord.id)).where(DNSRecord.hosted_zone_id == zone_id)
        
        if search:
            query = query.where(DNSRecord.name.ilike(f"%{search}%"))
            count_query = count_query.where(DNSRecord.name.ilike(f"%{search}%"))
            
        if type_filter:
            query = query.where(DNSRecord.type == type_filter)
            count_query = count_query.where(DNSRecord.type == type_filter)
            
        total = db.exec(count_query).one()
        
        # ORDER BY created_at DESC
        query = query.order_by(DNSRecord.created_at.desc())
        
        # Paginate
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)
        items = db.exec(query).all()
        
        total_pages = ceil(total / page_size) if total > 0 and page_size > 0 else 0
        
        return PaginatedDNSRecords(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/api/hosted-zones/{zone_id}/records/{record_id}", response_model=DNSRecordResponse)
def get_dns_record(
    zone_id: str,
    record_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    try:
        # Verify zone exists
        zone = db.exec(select(HostedZone).where(HostedZone.id == zone_id)).first()
        if not zone:
            raise HTTPException(status_code=404, detail="Hosted zone not found")
            
        # Get DNS record
        record = db.exec(select(DNSRecord).where(DNSRecord.id == record_id, DNSRecord.hosted_zone_id == zone_id)).first()
        if not record:
            raise HTTPException(status_code=404, detail="DNS record not found")
            
        return record
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/api/hosted-zones/{zone_id}/records", response_model=DNSRecordResponse, status_code=status.HTTP_201_CREATED)
def create_dns_record(
    zone_id: str,
    record_in: DNSRecordCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    try:
        # Verify zone exists
        zone = db.exec(select(HostedZone).where(HostedZone.id == zone_id)).first()
        if not zone:
            raise HTTPException(status_code=404, detail="Hosted zone not found")
            
        now = datetime.utcnow()
        record = DNSRecord(
            id=str(uuid.uuid4()),
            hosted_zone_id=zone_id,
            name=record_in.name,
            type=record_in.type,
            ttl=record_in.ttl,
            value=record_in.value,
            routing_policy=record_in.routing_policy,
            comment=record_in.comment,
            created_at=now,
            updated_at=now
        )
        db.add(record)
        
        # Increment record count on the hosted zone
        zone.record_count += 1
        zone.updated_at = now
        db.add(zone)
        
        db.commit()
        db.refresh(record)
        return record
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.put("/api/hosted-zones/{zone_id}/records/{record_id}", response_model=DNSRecordResponse)
def update_dns_record(
    zone_id: str,
    record_id: str,
    record_in: DNSRecordUpdate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    try:
        # Verify zone and record exist
        zone = db.exec(select(HostedZone).where(HostedZone.id == zone_id)).first()
        if not zone:
            raise HTTPException(status_code=404, detail="Hosted zone not found")
            
        record = db.exec(select(DNSRecord).where(DNSRecord.id == record_id, DNSRecord.hosted_zone_id == zone_id)).first()
        if not record:
            raise HTTPException(status_code=404, detail="DNS record not found")
            
        # Update only provided fields (skip None values). type is ignored as it is not in DNSRecordUpdate schema.
        if record_in.name is not None:
            record.name = record_in.name
        if record_in.ttl is not None:
            record.ttl = record_in.ttl
        if record_in.value is not None:
            record.value = record_in.value
        if record_in.routing_policy is not None:
            record.routing_policy = record_in.routing_policy
        if record_in.comment is not None:
            record.comment = record_in.comment
            
        record.updated_at = datetime.utcnow()
        db.add(record)
        db.commit()
        db.refresh(record)
        return record
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.delete("/api/hosted-zones/{zone_id}/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dns_record(
    zone_id: str,
    record_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    try:
        # Verify zone and record exist
        zone = db.exec(select(HostedZone).where(HostedZone.id == zone_id)).first()
        if not zone:
            raise HTTPException(status_code=404, detail="Hosted zone not found")
            
        record = db.exec(select(DNSRecord).where(DNSRecord.id == record_id, DNSRecord.hosted_zone_id == zone_id)).first()
        if not record:
            raise HTTPException(status_code=404, detail="DNS record not found")
            
        db.delete(record)
        
        # Decrement record count
        zone.record_count = max(0, zone.record_count - 1)
        zone.updated_at = datetime.utcnow()
        db.add(zone)
        
        db.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

