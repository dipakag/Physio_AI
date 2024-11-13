from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from ....core.config import get_settings
from ....models.patient import PatientBase, PatientDB
from typing import List

router = APIRouter()
settings = get_settings()

async def get_database():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    try:
        yield client[settings.DATABASE_NAME]
    finally:
        client.close()

@router.post("/", response_model=PatientDB)
async def create_patient(
    patient: PatientBase,
    db: AsyncIOMotorClient = Depends(get_database)
):
    patient_dict = patient.dict(by_alias=True)
    result = await db.patients.insert_one(patient_dict)
    created_patient = await db.patients.find_one({"_id": result.inserted_id})
    return PatientDB(**created_patient)

@router.get("/{patient_id}", response_model=PatientDB)
async def get_patient(
    patient_id: str,
    db: AsyncIOMotorClient = Depends(get_database)
):
    patient = await db.patients.find_one({"patient_id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return PatientDB(**patient)

@router.get("/", response_model=List[PatientDB])
async def list_patients(
    skip: int = 0,
    limit: int = 10,
    db: AsyncIOMotorClient = Depends(get_database)
):
    patients = await db.patients.find().skip(skip).limit(limit).to_list(limit)
    return [PatientDB(**patient) for patient in patients]