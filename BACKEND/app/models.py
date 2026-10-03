from sqlalchemy import Column, String, Integer, ForeignKey, Enum as SQLEnum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class RoleEnum(str, enum.Enum):
    STUDENT = "STUDENT"
    FACULTY = "FACULTY"

class StatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(RoleEnum), default=RoleEnum.STUDENT)
    department = Column(String, nullable=True)

    projects = relationship("Project", back_populates="owner")
    events = relationship("Event", back_populates="creator")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)
    department = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    github_link = Column(String, nullable=True)
    status = Column(SQLEnum(StatusEnum), default=StatusEnum.PENDING)
    student_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="projects")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    event_date = Column(String, nullable=False)
    venue = Column(String, nullable=False)
    faculty_id = Column(Integer, ForeignKey("users.id"))

    creator = relationship("User", back_populates="events")