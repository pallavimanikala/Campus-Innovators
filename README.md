# Campus Innovators - Full-Stack Academic & Event Platform

Campus Innovators is a comprehensive full-stack web application designed for academic institutions to streamline student project submissions, faculty evaluations, startup incubations, and automated campus event management.

## 🚀 Key Features
* **Role-Based Access Control (RBAC):** Secure authentication workflows separating Student portals, Faculty reviews, and Administrator privileges using JSON Web Tokens (JWT).
* **Project & Idea Management:** Students can submit project proposals, while faculty can review, approve, reject, or delete submissions with real-time status tracking.
* **Automated Event Routing:** Dynamic event scheduling that automatically distinguishes between upcoming **Live Events** and archived **Past Events** based on real-time database comparisons.
* **Startup Incubation Portal:** Highlights approved projects ready for startup development and collaboration.

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5, Bootstrap Icons
* **Backend:** Python, FastAPI, SQLAlchemy ORM
* **Database:** PostgreSQL
* **Containerization:** Docker & Docker Compose

## 📂 Project Structure
\\\	ext
CAMPUS-INNOVATORS-FULLSTACK/
├── BACKEND/
│   ├── app/
│   │   ├── routers/       # API endpoints (auth, projects, events)
│   │   ├── auth.py        # JWT authentication & security utils
│   │   ├── database.py    # SQLAlchemy session setup
│   │   ├── models.py      # Database models (User, Project, Event)
│   │   ├── schemas.py     # Pydantic validation schemas
│   │   └── main.py        # FastAPI application entry point
│   ├── Dockerfile
│   └── requirements.txt
├── FRONTEND/
│   ├── index.html
│   ├── live-events.html
│   ├── past-events.html
│   ├── faculty-dashboard.html
│   ├── submit-idea-form.html
│   ├── script.js          # Global API integration logic
│   └── style.css
└── docker-compose.yml     # Multi-container orchestration (FastAPI + PostgreSQL)
\\\

## ⚙️ Getting Started & Installation
### Prerequisites
* [Docker Desktop](https://www.docker.com/) installed and running.
* Git installed.

### 1. Clone the Repository
\\\ash
git clone https://github.com/pallavimanikala/Campus-Innovators.git
cd CAMPUS-INNOVATORS-FULLSTACK
\\\

### 2. Run with Docker Compose
Start both the PostgreSQL database and FastAPI backend containers in the background:
\\\ash
docker-compose up -d
\\\

### 3. Verify Container Status
Ensure both services are running smoothly:
\\\ash
docker ps
\\\

### 4. Launch the Frontend
* Open the FRONTEND folder in your code editor (e.g., VS Code).
* Use **Live Server** to run index.html on port 5500.

## 👤 Author
**Manikala Pallavi**  
* GitHub: [@pallavimanikala](https://github.com/pallavimanikala)
