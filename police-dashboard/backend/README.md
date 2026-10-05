# Django backend

Create the project environment and install dependencies with:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set the PostgreSQL password for the `crime_reporting_db` database. In PowerShell, load the values into the current terminal session, then run:

```powershell
$env:DB_PASSWORD = 'your-postgres-password'
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

From the project root, run both the frontend and backend with `npm run dev:all`.

The API uses the `crime_reporting_db` PostgreSQL database by default. Reports are stored in the `reports_report` table. Supporting submissions and attachments are stored in `reports_reportsubmission` and `reports_reportattachment`; additional-information requests use `reports_additionalinformationrequest`.

Set `ADMIN_LOGIN_NAME` and `ADMIN_LOGIN_PASSWORD` in `.env` before deployment. Dashboard login is handled by the Django session API at `/api/auth/dashboard/`; officer passwords are stored as hashes and are never returned by the API. Citizen tracking remains public only for a supplied tracking number or report ID and returns a restricted status/request payload.

After changing the backend environment, apply all migrations with:

```powershell
.\.venv\Scripts\python.exe manage.py migrate
```
