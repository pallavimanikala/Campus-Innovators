const API_BASE = "http://localhost:8000/api/v1";

/* ==========================================================================
   GLOBAL FUNCTIONS (Accessible by inline HTML onclick/onsubmit handlers)
   ========================================================================== */

/**
 * Handles faculty login authentication and redirects directly to Dashboard
 */
async function handleFacultyLogin(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const usernameInput = document.getElementById('faculty-username');
    const passwordInput = document.getElementById('faculty-password');
    const errorDisplay = document.getElementById('faculty-login-error');

    const email = usernameInput?.value.trim() || '';
    const password = passwordInput?.value || '';

    if (errorDisplay) {
        errorDisplay.classList.add('d-none');
        errorDisplay.textContent = '';
    }

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const backendHost = window.location.hostname === '127.0.0.1' ? '127.0.0.1' : 'localhost';
    const loginUrl = `http://${backendHost}:8000/api/v1/auth/login/faculty`;

    try {
        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem('access_token', data.access_token);
            sessionStorage.setItem('isFacultyLoggedIn', 'true');
            window.location.href = 'faculty-dashboard.html';
        } else {
            if (errorDisplay) {
                errorDisplay.textContent = data.detail || 'Invalid email or password.';
                errorDisplay.classList.remove('d-none');
            }
        }
    } catch (err) {
        console.error('Login Fetch Error:', err);
        if (errorDisplay) {
            errorDisplay.textContent = `Network Error: Could not connect to backend. Ensure Docker is running.`;
            errorDisplay.classList.remove('d-none');
        }
    }
}
/**
 * Fetches and displays submitted ideas on Faculty Dashboard
 */
async function loadSubmittedIdeas() {
    const dashboardList = document.getElementById('faculty-dashboard-list');
    const loadingMsg = document.getElementById('dashboard-loading');
    const emptyMsg = document.getElementById('no-submissions-message');

    if (!dashboardList) return;

    if (loadingMsg) loadingMsg.classList.remove('d-none');
    if (emptyMsg) emptyMsg.classList.add('d-none');

    const token = sessionStorage.getItem('access_token');

    try {
        const response = await fetch(`${API_BASE}/projects`, {
            method: 'GET',
            headers: token ? {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            } : { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Server status ${response.status}`);
        }

        const data = await response.json();
        const projects = Array.isArray(data) ? data : (data.projects || []);

        if (loadingMsg) loadingMsg.classList.add('d-none');

        if (!projects || projects.length === 0) {
            if (emptyMsg) emptyMsg.classList.remove('d-none');
            dashboardList.innerHTML = '';
            return;
        }

        dashboardList.innerHTML = projects.map(idea => `
            <div class="card mb-3 shadow-sm border-0 rounded-3">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                        <h5 class="card-title text-primary fw-bold mb-0">${idea.title || 'Untitled Submission'}</h5>
                        <span class="badge ${idea.status === 'APPROVED' ? 'bg-success' : idea.status === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'} px-3 py-2 rounded-pill">
                            ${idea.status || 'PENDING'}
                        </span>
                    </div>
                    
                    <p class="card-text text-secondary mb-3" style="white-space: pre-line;">${idea.description || 'No description provided.'}</p>
                    
                    <p class="text-muted small mb-3">
                        <i class="bi bi-building me-1"></i>Dept: <strong>${idea.department || 'N/A'}</strong> | 
                        <i class="bi bi-mortarboard me-1"></i>Year: <strong>${idea.year || 'N/A'}</strong>
                    </p>

                    <div class="d-flex gap-2 justify-content-start align-items-center">
                        <button class="btn btn-sm btn-success px-3 rounded-pill" onclick="updateIdeaStatus(${idea.id}, 'APPROVED')">
                            <i class="bi bi-check-circle me-1"></i>Approve
                        </button>
                        <button class="btn btn-sm btn-danger px-3 rounded-pill" onclick="updateIdeaStatus(${idea.id}, 'REJECTED')">
                            <i class="bi bi-x-circle me-1"></i>Reject
                        </button>
                        <button class="btn btn-sm btn-danger px-3 rounded-pill" onclick="deleteProject(${idea.id})">
        <i class="bi bi-trash me-1"></i>Delete
    </button>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error("Failed to load dashboard items:", err);
        if (loadingMsg) loadingMsg.classList.add('d-none');
        dashboardList.innerHTML = `<div class="alert alert-danger text-center">Failed to load submissions from database. Ensure Docker backend container is running.</div>`;
    }
}

/**
 * Updates status (APPROVED/REJECTED) for a submitted project
 */
async function updateIdeaStatus(projectId, newStatus) {
    const token = sessionStorage.getItem('access_token');
    try {
        const response = await fetch(`${API_BASE}/projects/${projectId}/status?status=${newStatus}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            loadSubmittedIdeas();
        } else {
            alert('Failed to update project status.');
        }
    } catch (err) {
        console.error('Status update error:', err);
        alert('Network error updating status.');
    }
}

// Attach globally
window.handleFacultyLogin = handleFacultyLogin;
window.loadSubmittedIdeas = loadSubmittedIdeas;
window.updateIdeaStatus = updateIdeaStatus;

/**
 * Deletes a project/idea by ID from PostgreSQL
 */
async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        return;
    }

    const token = sessionStorage.getItem('access_token');

    try {
        const response = await fetch(`${API_BASE}/projects/${projectId}`, {
            method: 'DELETE',
            headers: token ? {
                'Authorization': `Bearer ${token}`
            } : {}
        });

        if (response.ok || response.status === 204) {
            alert('Project deleted successfully!');
            
            // Auto-refresh whichever view is active
            if (document.getElementById('faculty-dashboard-list')) {
                loadSubmittedIdeas();
            }
            if (document.getElementById('project-display-area')) {
                loadApprovedProjects();
            }
        } else {
            const err = await response.json();
            alert('Delete failed: ' + (err.detail || 'Server error'));
        }
    } catch (err) {
        console.error('Delete error:', err);
        alert('Network error while attempting to delete.');
    }
}

window.deleteProject = deleteProject;

/**
 * Loads Upcoming / Active events for live-events.html
 */
async function loadLiveEvents() {
    const eventsContainer = document.getElementById('live-events-container');
    const loadingMsg = document.getElementById('events-loading');
    const noEventsMsg = document.getElementById('no-events-message');

    if (!eventsContainer) return;

    if (loadingMsg) loadingMsg.classList.remove('d-none');
    if (noEventsMsg) noEventsMsg.classList.add('d-none');

    try {
        const response = await fetch(`${API_BASE}/events?event_type=live`);
        const events = await response.json();

        if (loadingMsg) loadingMsg.classList.add('d-none');

        if (!events || events.length === 0) {
            if (noEventsMsg) noEventsMsg.classList.remove('d-none');
            eventsContainer.innerHTML = '';
            return;
        }

        eventsContainer.innerHTML = events.map(e => `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="badge bg-primary px-3 py-2"><i class="bi bi-geo-alt-fill me-1"></i>${e.venue}</span>
                            <span class="badge bg-success text-white border"><i class="bi bi-calendar-event me-1"></i>${e.event_date}</span>
                        </div>
                        <h5 class="card-title fw-bold text-dark mb-2">${e.title}</h5>
                        <p class="card-text text-muted">${e.description}</p>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error fetching live events:', err);
        if (loadingMsg) loadingMsg.classList.add('d-none');
    }
}

/**
 * Loads Past / Completed events for past-events.html
 */
async function loadPastEvents() {
    const pastContainer = document.getElementById('past-events-container');
    const loadingMsg = document.getElementById('past-events-loading');
    const noPastMsg = document.getElementById('no-past-events-message');

    if (!pastContainer) return;

    // 1. Show loading indicator and hide empty state
    if (loadingMsg) loadingMsg.classList.remove('d-none');
    if (noPastMsg) noPastMsg.classList.add('d-none');

    try {
        const response = await fetch(`${API_BASE}/events?event_type=past`);
        const events = await response.json();

        // 2. Hide loading spinner
        if (loadingMsg) loadingMsg.classList.add('d-none');

        // 3. Handle empty results
        if (!events || events.length === 0) {
            if (noPastMsg) noPastMsg.classList.remove('d-none');
            pastContainer.innerHTML = '';
            return;
        }

        // 4. Render past event cards
        pastContainer.innerHTML = events.map(e => `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm border-0 opacity-85">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="badge bg-secondary px-3 py-2">
                                <i class="bi bi-geo-alt-fill me-1"></i>${e.venue}
                            </span>
                            <span class="badge bg-dark text-white">
                                <i class="bi bi-check-circle me-1"></i>Completed (${e.event_date})
                            </span>
                        </div>
                        <h5 class="card-title fw-bold text-dark mb-2">${e.title}</h5>
                        <p class="card-text text-muted">${e.description}</p>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error fetching past events:', err);
        if (loadingMsg) loadingMsg.classList.add('d-none');
        if (noPastMsg) noPastMsg.classList.remove('d-none');
    }
}

// Global scope registration
window.loadLiveEvents = typeof loadLiveEvents !== 'undefined' ? loadLiveEvents : window.loadLiveEvents;
window.loadPastEvents = loadPastEvents;

// Auto-trigger functions based on active DOM elements
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('live-events-container')) {
        loadLiveEvents();
    }
    if (document.getElementById('past-events-container')) {
        loadPastEvents();
    }
});

/* ==========================================================================
   DOM INITIALIZATION & EVENT ATTACHMENTS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {

    // 1. Update active navbar state
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        const linkHref = link.getAttribute('href');
        if (!linkHref) return;
        if (linkHref.split('/').pop() === currentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });

    // 2. Update Footer Year
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // 3. Attach Student Login Form Event Listener
    const studentLoginForm = document.getElementById('student-login-form');
    if (studentLoginForm) {
        studentLoginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const emailInput = studentLoginForm.querySelector('#student-username');
            const passwordInput = studentLoginForm.querySelector('#student-password');
            const errorDisplay = document.getElementById('student-login-error');

            if (errorDisplay) errorDisplay.classList.add('d-none');

            const formData = new URLSearchParams();
            formData.append('username', emailInput?.value.trim() || '');
            formData.append('password', passwordInput?.value || '');

            try {
                const response = await fetch(`${API_BASE}/auth/login/student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData
});

                const data = await response.json();

                if (response.ok) {
                    sessionStorage.setItem('access_token', data.access_token);
                    sessionStorage.setItem('isStudentLoggedIn', 'true');
                    alert('Student Login Successful!');
                    window.location.href = 'submit-idea-form.html';
                } else {
                    if (errorDisplay) {
                        errorDisplay.textContent = data.detail || 'Invalid email or password.';
                        errorDisplay.classList.remove('d-none');
                    }
                }
            } catch (err) {
                console.error('Login error:', err);
                alert('Cannot connect to backend server. Ensure Docker container is running.');
            }
        });
    }

    // 4. Attach Idea Submission Form Event Listener
    const ideaForm = document.getElementById('idea-submission-form');
    if (ideaForm) {
        ideaForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            ideaForm.classList.add('was-validated');

            if (!ideaForm.checkValidity()) return;

            const token = sessionStorage.getItem('access_token');
            if (!token) {
                alert('Please log in first to submit an idea.');
                window.location.href = 'submit-idea-login.html';
                return;
            }

            const projectData = {
                title: ideaForm.querySelector('#project-title')?.value || '',
                description: ideaForm.querySelector('#project-abstract')?.value || '',
                category: ideaForm.querySelector('#project-category')?.value || 'General',
                department: ideaForm.querySelector('#department')?.value || 'CSE',
                year: parseInt(ideaForm.querySelector('#year')?.value || new Date().getFullYear()),
                github_link: ideaForm.querySelector('#github-link')?.value || null
            };

            try {
                const response = await fetch(`${API_BASE}/projects`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(projectData)
                });

                if (response.ok) {
                    alert('Idea Submitted Successfully!');
                    ideaForm.reset();
                    ideaForm.classList.remove('was-validated');
                } else {
                    const err = await response.json();
                    alert('Submission Error: ' + (err.detail || 'Could not save project.'));
                }
            } catch (error) {
                console.error('Submission failed:', error);
                alert('Server error. Is the Docker backend running?');
            }
        });
    }

    // 5. Attach Event Creation Form Listener
    const eventForm = document.getElementById('post-event-form');
    if (eventForm) {
        eventForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const token = sessionStorage.getItem('access_token');
            if (!token) {
                alert("Authorization token missing. Please log in as faculty first.");
                window.location.href = 'faculty-login.html';
                return;
            }

            const eventData = {
                title: eventForm.querySelector('#event-title')?.value || '',
                description: eventForm.querySelector('#event-description')?.value || '',
                event_date: eventForm.querySelector('#event-date')?.value || new Date().toISOString().split('T')[0],
                venue: eventForm.querySelector('#event-location')?.value || 'Main Auditorium'
            };

            try {
                const response = await fetch(`${API_BASE}/events`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(eventData)
                });

                if (response.ok) {
                    alert('Event posted successfully!');
                    eventForm.reset();
                    window.location.href = 'live-events.html';
                } else {
                    const err = await response.json();
                    alert('Failed to post event: ' + (err.detail || 'Unauthorized or server error.'));
                }
            } catch (err) {
                console.error('Error posting event:', err);
                alert('Server error. Ensure backend is running.');
            }
        });
    }

    // 6. Auto-load Dashboard if list container exists
    if (document.getElementById('faculty-dashboard-list')) {
        loadSubmittedIdeas();
    }

    // 7. Auto-load Live Events if container exists
    if (document.getElementById('live-events-container')) {
        (async function loadLiveEvents() {
            const eventsContainer = document.getElementById('live-events-container');
            const loadingMsg = document.getElementById('events-loading');
            const noEventsMsg = document.getElementById('no-events-message');

            if (loadingMsg) loadingMsg.classList.remove('d-none');
            if (noEventsMsg) noEventsMsg.classList.add('d-none');

            try {
                const response = await fetch(`${API_BASE}/events`);
                const events = await response.json();

                if (loadingMsg) loadingMsg.classList.add('d-none');

                if (!events || events.length === 0) {
                    if (noEventsMsg) noEventsMsg.classList.remove('d-none');
                    return;
                }

                eventsContainer.innerHTML = events.map(e => `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 shadow-sm border-0">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <span class="badge bg-primary px-3 py-2"><i class="bi bi-geo-alt-fill me-1"></i>${e.venue}</span>
                                    <span class="badge bg-light text-dark border"><i class="bi bi-calendar-event me-1"></i>${e.event_date}</span>
                                </div>
                                <h5 class="card-title fw-bold text-dark mb-2">${e.title}</h5>
                                <p class="card-text text-muted">${e.description}</p>
                            </div>
                        </div>
                    </div>
                `).join('');
            } catch (err) {
                console.error('Error fetching live events:', err);
                if (loadingMsg) loadingMsg.classList.add('d-none');
                if (noEventsMsg) {
                    noEventsMsg.innerHTML = `<i class="bi bi-exclamation-triangle display-4 d-block mb-3 text-danger"></i>Unable to connect to backend server.`;
                    noEventsMsg.classList.remove('d-none');
                }
            }
        })();
    }
});