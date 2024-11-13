from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

class MedicalHistory(BaseModel):
    condition: str
    diagnosis: datetime
    treatments: List[str]

class Assessment(BaseModel):
    date: datetime = Field(default_factory=datetime.now)
    practitioner: str
    findings: dict
    recommendations: List[str]

class PatientBase(BaseModel):
    patient_id: str
    demographics: dict
    medical_history: List[MedicalHistory]
    assessments: List[Assessment]

class PatientDB(PatientBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True