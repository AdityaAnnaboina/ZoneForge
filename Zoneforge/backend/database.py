from sqlmodel import SQLModel, create_engine, Session, select
from typing import Generator
from datetime import datetime
import uuid
from passlib.context import CryptContext

from models.user import User
from models.hosted_zone import HostedZone
from models.dns_record import DNSRecord

sqlite_url = "sqlite:///./route53.db"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args, echo=False)

def create_db_and_tables():
    # 1. Creates all tables via SQLModel.metadata.create_all
    SQLModel.metadata.create_all(engine)
    
    # 2. Seeds the database only if users table is empty
    with Session(engine) as session:
        users_exist = session.exec(select(User)).first() is not None
        if not users_exist:
            # Create admin user
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)
            hashed_pw = pwd_context.hash("admin123")
            admin_user = User(
                username="admin",
                password_hash=hashed_pw,
                created_at=datetime.utcnow()
            )
            session.add(admin_user)
            
            # Create 3 sample hosted zones
            zone1_id = str(uuid.uuid4())
            zone2_id = str(uuid.uuid4())
            zone3_id = str(uuid.uuid4())
            
            zone1 = HostedZone(
                id=zone1_id,
                name="example.com.",
                type="Public",
                comment="Primary domain",
                record_count=0,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            zone2 = HostedZone(
                id=zone2_id,
                name="internal.corp.",
                type="Private",
                comment="Internal network",
                record_count=0,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            zone3 = HostedZone(
                id=zone3_id,
                name="staging.example.com.",
                type="Public",
                comment="Staging environment",
                record_count=0,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            session.add(zone1)
            session.add(zone2)
            session.add(zone3)
            
            # Create 5 sample DNS records in example.com.
            dns_records = [
                DNSRecord(
                    id=str(uuid.uuid4()),
                    hosted_zone_id=zone1_id,
                    name="@",
                    type="A",
                    ttl=300,
                    value="192.168.1.1",
                    routing_policy="Simple",
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                ),
                DNSRecord(
                    id=str(uuid.uuid4()),
                    hosted_zone_id=zone1_id,
                    name="www",
                    type="CNAME",
                    ttl=300,
                    value="example.com.",
                    routing_policy="Simple",
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                ),
                DNSRecord(
                    id=str(uuid.uuid4()),
                    hosted_zone_id=zone1_id,
                    name="@",
                    type="MX",
                    ttl=3600,
                    value="10 mail.example.com.",
                    routing_policy="Simple",
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                ),
                DNSRecord(
                    id=str(uuid.uuid4()),
                    hosted_zone_id=zone1_id,
                    name="@",
                    type="TXT",
                    ttl=300,
                    value="v=spf1 include:example.com ~all",
                    routing_policy="Simple",
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                ),
                DNSRecord(
                    id=str(uuid.uuid4()),
                    hosted_zone_id=zone1_id,
                    name="@",
                    type="NS",
                    ttl=172800,
                    value="ns1.example.com.",
                    routing_policy="Simple",
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
            ]
            
            for record in dns_records:
                session.add(record)
                
            # Update record_count on example.com. to 5 after seeding
            zone1.record_count = 5
            
            session.commit()

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

