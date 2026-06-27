from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_db_and_tables
from routes.auth import router as auth_router
from routes.hosted_zones import router as hosted_zones_router
from routes.dns_records import router as dns_records_router
import models  # Import models package to ensure SQLModel tables are registered

app = FastAPI(title="AWS Route53 Clone API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.include_router(auth_router)
app.include_router(hosted_zones_router)
app.include_router(dns_records_router)

@app.get("/")
def read_root():
    return { "message": "Route53 Clone API", "version": "1.0.0" }

@app.get("/health")
def health_check():
    return { "status": "healthy" }
