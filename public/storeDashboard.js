// JS moved from dashboard.html
window.addEventListener('load', () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Set user name
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = user.name || 'User';

    // Show "Manage Users" button only for admins
    if (user.is_admin) {
        const btn = document.getElementById('manageUsersBtn');
        if (btn) btn.style.display = 'block';
    }

    // Show "View Logs" only for main user (user_type === 2)
    if (user.user_type === 2) {
        const btn = document.getElementById('viewLogsBtn');
        if (btn) btn.style.display = 'block';
    }
});

function goToUsers() { window.location.href = '/users.html'; }
function goToLogs() { window.location.href = '/logs.html'; }

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// Add auth token to all API calls
async function apiCall(url, options = {}) {
    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return fetch(url, {
        ...options,
        headers,
    });
}

// CSV import handling
document.addEventListener('DOMContentLoaded', () => {
    const importForm = document.getElementById('importForm');
    if (!importForm) return;

    importForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const fileInput = document.getElementById('importFile');
        const resultDiv = document.getElementById('importResult');
        if (resultDiv) resultDiv.textContent = '';
        if (!fileInput.files.length) {
            if (resultDiv) resultDiv.textContent = 'Please select a CSV file.';
            return;
        }
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch('/api/stores/import', {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                let msg = `Import complete. Updated: ${data.results.filter(r=>r.action==='updated').length}, Created: ${data.results.filter(r=>r.action==='created').length}`;
                if (data.errors.length) msg += `. Errors: ${data.errors.length}`;
                if (resultDiv) resultDiv.textContent = msg;
                if (typeof loadStores === 'function') loadStores();
            } else {
                if (resultDiv) resultDiv.textContent = data.message || 'Import failed.';
            }
        } catch (err) {
            if (resultDiv) resultDiv.textContent = 'Error importing: ' + err.message;
        }
    });
});
