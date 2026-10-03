router_code = """from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/v1/projects", tags=["Projects"])

@router.get("", response_model=List[schemas.ProjectResponse])
def get_projects(status: Optional[str] = None, department: Optional[str] = None, year: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Project)
    if status:
        query = query.filter(models.Project.status == status)
    if department:
        query = query.filter(models.Project.department == department)
    if year:
        query = query.filter(models.Project.year == year)
    return query.all()

@router.post("", status_code=status.HTTP_201_CREATED, response_model=schemas.ProjectResponse)
def create_project(project_data: schemas.ProjectCreate, db: Session = Depends(get_db)):
    new_project = models.Project(
        title=project_data.title,
        category=getattr(project_data, 'category', 'Startup') or 'Startup',
        department=project_data.department,
        year=project_data.year,
        description=project_data.description,
        github_link=project_data.github_link,
        status="PENDING",
        student_id=1
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@router.patch("/{project_id}/status")
def update_project_status(project_id: int, status: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    user_role = str(current_user.role).upper()
    if "FACULTY" not in user_role and "ADMIN" not in user_role:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Faculty or Admin authorization required")
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    project.status = status
    db.commit()
    return {"message": f"Project status updated to {status}"}
"""

with open("app/routers/projects.py", "w") as f:
    f.write(router_code)

print("Successfully updated app/routers/projects.py inside Docker!")