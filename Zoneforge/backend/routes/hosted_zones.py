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
from schemas.hosted_zones import HostedZoneCreate, HostedZoneUpdate, HostedZoneResponse, PaginatedHostedZones
from dependencies import get_current_user

router = APIRouter(tags=["Hosted Zones"])

@router.get("/api/hosted-zones", response_model=PaginatedHostedZones)
def list_hosted_zones(
    search: str = "",
    type_filter: str = "",
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    try:
        # Build SQLModel select query
        query = select(HostedZone)
        count_query = select(func.count(HostedZone.id))
        
        # Apply filters
        if search:
            query = query.where(HostedZone.name.ilike(f"%{search}%"))
            count_query = count_query.where(HostedZone.name.ilike(f"%{search}%"))
        
        if type_filter:
            query = query.where(HostedZone.type == type_filter)
            count_query = count_query.where(HostedZone.type == type_filter)
            
        # Count total matching records
        total = db.exec(count_query).one()
        
        # ORDER BY created_at DESC
        query = query.order_by(HostedZone.created_at.desc())
        
        # Apply offset and limit
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)
        
        items = db.exec(query).all()
        
        total_pages = ceil(total / page_size) if total > 0 and page_size > 0 else 0
        
        return PaginatedHostedZones(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/api/hosted-zones/{zone_id}", response_model=HostedZoneResponse)
def get_hosted_zone(
    zone_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    try:
        zone = db.exec(select(HostedZone).where(HostedZone.id == zone_id)).first()
        if not zone:
            raise HTTPException(status_code=404, detail="Hosted zone not found")
        return zone
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/api/hosted-zones", response_model=HostedZoneResponse, status_code=status.HTTP_201_CREATED)
def create_hosted_zone(
    zone_in: HostedZoneCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    try:
        name = zone_in.name
        if not name.endswith("."):
            name += "."
            
        # Check if zone with same name already exists
        existing = db.exec(select(HostedZone).where(HostedZone.name == name)).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Hosted zone with this name already exists"
            )
            
        zone_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        zone = HostedZone(
            id=zone_id,
            name=name,
            type=zone_in.type,
            comment=zone_in.comment,
            record_count=0,
            created_at=now,
            updated_at=now
        )
        db.add(zone)
        db.commit()
        db.refresh(zone)
        return zone
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.put("/api/hosted-zones/{zone_id}", response_model=HostedZoneResponse)
def update_hosted_zone(
    zone_id: str,
    zone_in: HostedZoneUpdate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    try:
        zone = db.exec(select(HostedZone).where(HostedZone.id == zone_id)).first()
        if not zone:
            raise HTTPException(status_code=404, detail="Hosted zone not found")
            
        # Update only provided fields (skip None values)
        if zone_in.type is not None:
            zone.type = zone_in.type
        if zone_in.comment is not None:
            zone.comment = zone_in.comment
            
        zone.updated_at = datetime.utcnow()
        db.add(zone)
        db.commit()
        db.refresh(zone)
        return zone
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.delete("/api/hosted-zones/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hosted_zone(
    zone_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    try:
        zone = db.exec(select(HostedZone).where(HostedZone.id == zone_id)).first()
        if not zone:
            raise HTTPException(status_code=404, detail="Hosted zone not found")
            
        # Delete all DNSRecord rows WHERE hosted_zone_id = zone_id
        records = db.exec(select(DNSRecord).where(DNSRecord.hosted_zone_id == zone_id)).all()
        for record in records:
            db.delete(record)
            
        # Delete the HostedZone
        db.delete(zone)
        db.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

