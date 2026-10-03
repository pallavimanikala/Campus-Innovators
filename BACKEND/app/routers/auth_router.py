from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.post("/login/student")
def login_student(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    
    # Extract role string cleanly (handles Enums, case, and whitespace)
    user_role = str(getattr(user.role, 'value', user.role)).strip().upper()
    
    if user_role != "STUDENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Admin and Faculty credentials must use the Faculty Portal."
        )
    
    access_token = auth.create_access_token(data={"sub": user.email, "role": user_role})
    return {"access_token": access_token, "token_type": "bearer", "role": user_role}


@router.post("/login/faculty")
def login_faculty(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    
    user_role = str(getattr(user.role, 'value', user.role)).strip().upper()
    
    if "FACULTY" not in user_role and "ADMIN" not in user_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Student credentials cannot access the Faculty Portal."
        )
    
    access_token = auth.create_access_token(data={"sub": user.email, "role": user_role})
    return {"access_token": access_token, "token_type": "bearer", "role": user_role}