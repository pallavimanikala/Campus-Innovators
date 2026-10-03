from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/v1/events", tags=["Events"])

@router.get("", response_model=List[schemas.EventResponse])
def get_events(
    event_type: Optional[str] = "live", 
    db: Session = Depends(get_db)
):
    # Convert date to string to match VARCHAR column type in PostgreSQL
    today_str = date.today().strftime("%Y-%m-%d")
    
    if event_type == "past":
        return db.query(models.Event).filter(
            models.Event.event_date < today_str
        ).order_by(models.Event.event_date.desc()).all()
    else:
        return db.query(models.Event).filter(
            models.Event.event_date >= today_str
        ).order_by(models.Event.event_date.asc()).all()

@router.post("", status_code=status.HTTP_201_CREATED, response_model=schemas.EventResponse)
def create_event(
    event_data: schemas.EventCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    user_role = str(getattr(current_user.role, 'value', current_user.role)).upper()
    if "FACULTY" not in user_role and "ADMIN" not in user_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Faculty or Admin authorization required to post events"
        )

    new_event = models.Event(
        title=event_data.title,
        description=event_data.description,
        event_date=str(event_data.event_date),
        venue=event_data.venue
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event