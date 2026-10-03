from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Union
from app.models import RoleEnum, StatusEnum

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: RoleEnum
    department: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: RoleEnum
    department: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ProjectCreate(BaseModel):
    title: str
    description: str
    category: Optional[str] = "Startup"  # Default to "Startup" if not provided
    department: str
    year: int
    github_link: Optional[str] = None

class ProjectResponse(ProjectCreate):
    id: int
    status: Union[StatusEnum, str]  # Allows both Enum and plain string serialization from DB
    student_id: int
    
    class Config:
        from_attributes = True
        use_enum_values = True  # Automatically converts Enum types to plain JSON strings

class EventCreate(BaseModel):
    title: str
    description: str
    event_date: str
    venue: str

class EventResponse(EventCreate):
    id: int
    faculty_id: int
    class Config:
        from_attributes = True