from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth_router, project_router, event_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Campus Innovators API", version="1.0")

# Explicit origins required when allow_credentials=True
origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(project_router.router)
app.include_router(event_router.router)

@app.get("/")
def root():
    return {"status": "Online", "system": "Campus Innovators API Backend"}