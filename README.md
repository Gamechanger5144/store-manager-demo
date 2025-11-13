# store-manager-demo

A small Node.js + Express demo for managing stores and users with role-based access, event logging, and CSV bulk import.

## Features

- User authentication (JWT) and registration
- Role-based user types: main (2), admin (1), user (0)
- User management (create / read / update / delete) via REST endpoints and admin UI
- Event logging for important actions (login, register, user CRUD, store import)
- Admin-facing logs viewer with filters and CSV export (`public/logs.html`) (UI partially implemented)
- Bulk import of stores from CSV (upload via dashboard, sample CSV at `public/sample.csv`)
- Frontend pages (in `public/`) including login, dashboard, users management, and logs viewer

## Seeded accounts

When the app runs it ensures certain accounts exist (you can change credentials in DB or via the app):

- Main user (user_type = 2)
	- name: `Shubham`
	- email: `shubham.dhyani@singleinterface.com`
	- password: `resonance@123`
- Super admin (user_type = 1)
	- name: `super admin`
	- email: `Superadmin@singleinterface.com`
	- password: `Resonance@123`

User type mapping:

- `2` = main user (highest privilege for this demo)
- `1` = admin
- `0` = regular user

## Dependencies

This project uses the following npm packages (as listed in `package.json`):

- `express` — web framework
- `dotenv` — loads environment variables from `.env`
- `mysql2` — MySQL client used by the app
- `bcryptjs` — password hashing
- `jsonwebtoken` — JWT generation / verification
- `multer` — file upload handling (used for CSV uploads)
- `csv-parse` — CSV parsing for bulk import
- `body-parser` — parsing request bodies
- `mongoose` — included in dependencies (not actively used if you use MySQL)

Why these matter:

- `multer` + `csv-parse` implement the bulk import flow: upload CSV -> parse rows -> upsert stores
- `jsonwebtoken` + `bcryptjs` implement secure login and protected routes

If you add/remove features that require new packages, update `package.json` and run `npm install`.

## Quick start

1. Install dependencies

```bash
npm install
```

2. Provide environment variables in a `.env` file at the project root. Typical variables used by the app:

```text
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=store_manager_demo
JWT_SECRET=your_jwt_secret
PORT=3000
```

3. Start the server

```bash
npm start
```

4. Open the UI in your browser (default):

- `http://localhost:3000/` (or port set in `PORT` / default 3000)

Note: If you want to run without a port in the URL (bind to port 80) you'll need appropriate OS permissions or a reverse proxy.

## Important endpoints (examples)

- POST `/api/auth/login` — login, returns JWT
- POST `/api/auth/register` — register a new user
- GET `/api/users` — list users (admin only)
- POST `/api/users` — create user (admin only)
- PUT `/api/users/:id` — update user (admin only)
- DELETE `/api/users/:id` — delete user (admin only)
- POST `/api/stores/import` — bulk CSV import for stores (multipart/form-data, file field name: `file`)
- GET `/api/events` — list event logs with filters (admin/main)

Frontend pages (under `public/`):

- `login.html` — login page
- `storeDashboard.html` — main dashboard and bulk import UI
- `users.html` — user management UI
- `logs.html` — logs viewer (admin/main)

## CSV bulk import

- A sample CSV template is available at `public/sample.csv`.
- The import expects columns like: `code,designation,manager,email,mobile,storeType` (see sample for exact layout).
- The upload endpoint uses `multer` to accept the file and `csv-parse` to read rows; rows are validated and then inserted/updated into the `stores` table.

## Event logging

Actions such as login, registration, and user CRUD create entries in the `events` table. The logs UI allows filtering by action, user, and date range and supports CSV export.

## Troubleshooting

- If the server fails to start with a "Cannot find module" error, run `npm install` to ensure dependencies are present. Example for missing modules seen during development:

```bash
npm install multer csv-parse
```

- If database connections fail, confirm your `.env` credentials and that the MySQL server is reachable. Check `src/db/connection.js` for connection details.

- Node.js: this project was developed/tested with Node.js v18.x. Newer versions should work but confirm compatibility with native modules.

## Development notes & next steps

- Logs viewing & export UI is implemented in `public/logs.html` but you may want to harden access controls.
- Additional improvements that can be added:
	- Excel (XLSX) import support
	- More robust CSV validation and error reporting per-row
	- Unit/integration tests for import and event logging
	- Role-based UI filtering and permissions hardening

## Contributing

Feel free to open issues or PRs. Keep changes minimal and add tests where appropriate.

## License

MIT-style (see `package.json`).
