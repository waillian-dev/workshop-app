# Workshop Management App - Feature Specification

## 1. Overview

The Workshop Management App is a web application for managing a single-day, single-track workshop event. It supports attendee registration, session scheduling, QR-based self-attendance, and certificate generation as downloadable PDFs.

The application has two user roles:

- **Admin**: manages sessions, attendees, attendance, and certificates.
- **Attendee**: registers for the workshop, views sessions, checks in using a QR code, and downloads a certificate after attending.

## 2. Tech Stack

### Frontend

- React
- Vite
- React Router
- JWT-based authentication state
- QR code display/scanning flow through browser-accessible links

### Backend

- Express
- SQLite
- JWT authentication
- Password hashing
- Server-side PDF generation

### Database

- SQLite database file stored locally for development.
- Seeded admin account and seed sessions.

## 3. Event Model

This app is designed for:

- One workshop event
- One event day
- One track
- Multiple sessions on the same day
- Event-level attendance, not per-session attendance

Attendees do not enroll in individual sessions. Once registered, they are considered registered for the workshop.

## 4. User Roles and Permissions

## 4.1 Admin

Admins can:

- Log in using seeded admin credentials.
- View an admin dashboard.
- Create, update, delete, and view sessions.
- View registered attendees.
- View attendance records.
- Display or regenerate the QR attendance code.
- View certificate eligibility.
- Download attendee certificate PDFs.

Admins cannot:

- Register through the public attendee registration form.
- Mark attendance on behalf of themselves through the attendee QR flow unless they also have an attendee account.

## 4.2 Attendee

Attendees can:

- Register for the workshop.
- Log in.
- View their profile.
- View the workshop schedule.
- Check in using the QR attendance link.
- View their attendance status.
- Download their certificate after becoming eligible.

Attendees cannot:

- Access admin pages.
- Create or edit sessions.
- View other attendee records.
- Download another attendee's certificate.

## 5. Authentication

## 5.1 Registration

Public users can create attendee accounts.

Required fields:

- Full name
- Email
- Password

Optional fields:

- Organization
- Phone number

Rules:

- Email must be unique.
- Password must be hashed before being stored.
- Public registration always creates users with the `attendee` role.
- Admin users must only be created through seed data or trusted backend processes.

## 5.2 Login

Users log in with:

- Email
- Password

On successful login, the backend returns:

- JWT access token
- User profile
- User role

The frontend stores the token and attaches it to protected API requests using:

```http
Authorization: Bearer <token>
```

## 5.3 Authorization

Protected API routes must verify:

- Token exists.
- Token is valid.
- User still exists.
- User has the required role for the requested action.

Expected responses:

- `401 Unauthorized` for missing or invalid authentication.
- `403 Forbidden` for authenticated users with the wrong role.

## 6. Seed Data

The backend must seed initial data when the app starts and required records do not exist.

## 6.1 Seed Admin

Seed one admin user.

Recommended local default:

- Name: Workshop Admin
- Email: `admin@example.com`
- Password: `admin123`
- Role: `admin`

The password should still be stored as a hash.

## 6.2 Seed Sessions

Seed several sessions for the single workshop day.

Example sessions:

- Opening and Welcome
- Main Workshop Session
- Break
- Hands-on Practice
- Q&A and Closing

Each session should include:

- Title
- Description
- Speaker
- Start time
- End time
- Optional location

## 7. Session Management

Sessions represent the event schedule.

## 7.1 Session Fields

Each session should store:

- ID
- Title
- Description
- Speaker
- Start time
- End time
- Location
- Created timestamp
- Updated timestamp

## 7.2 Admin Session Features

Admins can:

- View all sessions.
- Create a session.
- Edit a session.
- Delete a session.

Validation:

- Title is required.
- Speaker is required.
- Start time is required.
- End time is required.
- End time must be after start time.
- Sessions should not overlap by default.

## 7.3 Attendee Session Features

Attendees can:

- View all sessions ordered by start time.
- See session title, speaker, time range, description, and location.

Attendees cannot modify sessions.

## 8. Registration Management

For this app, attendee account creation is the same as workshop registration.

Admin registration view should include:

- Attendee name
- Email
- Organization
- Phone
- Registration date
- Attendance status
- Certificate eligibility

Admins should be able to search or filter attendees by:

- Name
- Email
- Attendance status
- Certificate status

## 9. Attendance

Attendance is event-level and marked through QR-based self-check-in.

## 9.1 Attendance Flow

1. Admin opens the attendance QR page.
2. App displays a QR code containing a secure attendance URL.
3. Attendee scans the QR code with their device.
4. Attendee is directed to the frontend attendance check-in page.
5. If not logged in, attendee is asked to log in first.
6. Frontend submits the QR token to the backend.
7. Backend validates the attendee JWT and QR token.
8. Backend creates an attendance record.
9. Attendee sees a confirmation message.

## 9.2 QR Code Behavior

The QR code should encode a URL like:

```text
/attendance/check-in?token=<attendanceToken>
```

The attendance token must:

- Be difficult to guess.
- Be stored in the database.
- Have an active/inactive status.
- Optionally have an expiration timestamp.

For version 1, one active QR token for the event is enough.

## 9.3 Attendance Rules

- Only authenticated attendees can check in.
- Admin users cannot use attendee check-in unless they have an attendee account.
- Each attendee can have only one attendance record.
- Re-scanning the QR code should not create duplicate records.
- If an attendee already checked in, the app should show an "already checked in" state.
- Invalid, inactive, or expired QR tokens should be rejected.

## 10. Certification

Certificates are generated as PDF files for eligible attendees.

## 10.1 Eligibility

An attendee is eligible for a certificate when:

- They are registered as an attendee.
- They have a valid attendance record.

## 10.2 Certificate Content

The PDF certificate should include:

- Workshop title
- Attendee full name
- Completion statement
- Event date
- Certificate issue date
- Unique certificate code
- Organizer name or signature text

Example completion statement:

```text
This certifies that [Attendee Name] has successfully attended the workshop.
```

## 10.3 Certificate Behavior

Attendees can:

- View certificate eligibility status.
- Download their certificate PDF once eligible.

Admins can:

- View eligible attendees.
- Download certificates for eligible attendees.

Rules:

- Certificates should be generated server-side.
- Certificate code should be stable once created.
- Downloading a certificate should not create duplicate certificate records.
- Ineligible attendees should receive a clear message explaining that attendance is required.

## 11. Suggested Database Schema

## 11.1 `users`

Stores admin and attendee accounts.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | integer | Primary key |
| `name` | text | Required |
| `email` | text | Required, unique |
| `password_hash` | text | Required |
| `role` | text | `admin` or `attendee` |
| `organization` | text | Optional |
| `phone` | text | Optional |
| `created_at` | text | Timestamp |
| `updated_at` | text | Timestamp |

## 11.2 `sessions`

Stores workshop sessions.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | integer | Primary key |
| `title` | text | Required |
| `description` | text | Optional |
| `speaker` | text | Required |
| `start_time` | text | Required |
| `end_time` | text | Required |
| `location` | text | Optional |
| `created_at` | text | Timestamp |
| `updated_at` | text | Timestamp |

## 11.3 `attendance`

Stores attendee check-ins.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | integer | Primary key |
| `user_id` | integer | References `users.id` |
| `checked_in_at` | text | Timestamp |
| `method` | text | Default `qr` |
| `created_at` | text | Timestamp |

Constraints:

- `user_id` should be unique to prevent duplicate attendance.

## 11.4 `attendance_tokens`

Stores QR attendance tokens.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | integer | Primary key |
| `token` | text | Required, unique |
| `active` | integer | `1` active, `0` inactive |
| `expires_at` | text | Optional timestamp |
| `created_at` | text | Timestamp |

## 11.5 `certificates`

Stores issued certificate metadata.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | integer | Primary key |
| `user_id` | integer | References `users.id`, unique |
| `certificate_code` | text | Required, unique |
| `issued_at` | text | Timestamp |
| `created_at` | text | Timestamp |

## 12. API Specification

## 12.1 Auth APIs

### `POST /api/auth/register`

Registers a new attendee.

Request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "organization": "Example Org",
  "phone": "09123456789"
}
```

Response:

```json
{
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "attendee"
  },
  "token": "jwt-token"
}
```

### `POST /api/auth/login`

Authenticates an existing user.

Request body:

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Response:

```json
{
  "user": {
    "id": 1,
    "name": "Workshop Admin",
    "email": "admin@example.com",
    "role": "admin"
  },
  "token": "jwt-token"
}
```

### `GET /api/auth/me`

Returns the current authenticated user.

Requires authentication.

## 12.2 Session APIs

### `GET /api/sessions`

Returns all sessions ordered by start time.

### `POST /api/sessions`

Creates a session.

Requires admin role.

### `PUT /api/sessions/:id`

Updates a session.

Requires admin role.

### `DELETE /api/sessions/:id`

Deletes a session.

Requires admin role.

## 12.3 Attendance APIs

### `GET /api/admin/attendance-token`

Returns the active QR attendance token and check-in URL.

Requires admin role.

Response:

```json
{
  "token": "secure-token",
  "checkInUrl": "/attendance/check-in?token=secure-token"
}
```

### `POST /api/attendance/check-in`

Marks attendance for the current attendee.

Requires attendee role.

Request body:

```json
{
  "token": "secure-token"
}
```

Response for first check-in:

```json
{
  "status": "checked_in",
  "message": "Attendance recorded successfully.",
  "checkedInAt": "2026-07-08T09:00:00.000Z"
}
```

Response for repeated check-in:

```json
{
  "status": "already_checked_in",
  "message": "You have already checked in.",
  "checkedInAt": "2026-07-08T09:00:00.000Z"
}
```

### `GET /api/attendance/me`

Returns current attendee attendance status.

Requires attendee role.

### `GET /api/admin/attendance`

Returns attendance records.

Requires admin role.

## 12.4 Certificate APIs

### `GET /api/certificates/me`

Returns certificate eligibility for the current attendee.

Requires attendee role.

Response:

```json
{
  "eligible": true,
  "certificateCode": "CERT-2026-0001",
  "issuedAt": "2026-07-08T10:00:00.000Z"
}
```

### `GET /api/certificates/me/download`

Downloads the current attendee's certificate PDF.

Requires attendee role and certificate eligibility.

### `GET /api/admin/certificates`

Returns attendee certificate eligibility and issued certificate records.

Requires admin role.

### `GET /api/admin/certificates/:userId/download`

Downloads a certificate PDF for an eligible attendee.

Requires admin role.

## 13. Frontend Pages

## 13.1 Public Pages

### Login Page

Allows admin and attendee users to log in.

Includes:

- Email field
- Password field
- Submit button
- Link to attendee registration

### Registration Page

Allows public users to register as attendees.

Includes:

- Full name
- Email
- Password
- Organization
- Phone
- Submit button

### Optional Public Schedule Page

Shows the workshop schedule without requiring login.

## 13.2 Attendee Pages

### Attendee Dashboard

Shows:

- Attendee name
- Registration status
- Attendance status
- Certificate eligibility
- Quick links to schedule and certificate download

### Schedule Page

Shows all workshop sessions ordered by time.

### Attendance Check-In Page

Handles QR check-in result states:

- Login required
- Checking in
- Successfully checked in
- Already checked in
- Invalid token
- Expired token
- Server error

### Certificate Page

Shows:

- Eligibility status
- Certificate code if issued
- Download button if eligible
- Message explaining attendance requirement if not eligible

## 13.3 Admin Pages

### Admin Dashboard

Shows summary metrics:

- Total attendees
- Total checked in
- Total certificates issued
- Total sessions

### Session Management Page

Allows admins to:

- View sessions
- Add session
- Edit session
- Delete session

### Registration Management Page

Shows attendee list with:

- Name
- Email
- Organization
- Phone
- Registration date
- Attendance status
- Certificate status

### Attendance QR Page

Shows:

- QR code for self-attendance
- Check-in URL
- Token status
- Optional regenerate button

### Attendance Records Page

Shows:

- Attendee name
- Email
- Check-in time
- Check-in method

### Certificate Management Page

Shows:

- Attendee name
- Email
- Attendance status
- Eligibility status
- Certificate code
- Download action

## 14. User Flows

## 14.1 Attendee Registration and Attendance Flow

1. Attendee registers an account.
2. Attendee logs in.
3. Attendee views the schedule.
4. During the event, attendee scans the QR code.
5. App records attendance.
6. Attendee becomes eligible for a certificate.
7. Attendee downloads PDF certificate.

## 14.2 Admin Event Setup Flow

1. Admin logs in with seeded credentials.
2. Admin reviews seeded sessions.
3. Admin updates session details if needed.
4. Admin opens the QR attendance page.
5. Admin displays the QR code during the workshop.
6. Admin monitors attendance.
7. Admin reviews certificate eligibility.

## 15. Error and Empty States

The app should handle:

- No sessions available.
- No attendees registered.
- No attendance records yet.
- Invalid login credentials.
- Duplicate registration email.
- Expired authentication token.
- Unauthorized admin access attempt.
- Invalid or expired attendance QR token.
- Certificate not available because attendance is missing.
- PDF generation failure.

## 16. Security Requirements

- Hash all passwords.
- Never return password hashes from the API.
- Use JWT secret from environment variables.
- Protect admin routes with role checks.
- Protect attendee certificate downloads by user identity.
- Use random, hard-to-guess attendance tokens.
- Validate all request bodies.
- Avoid exposing internal server errors to users.

## 17. Environment Variables

Recommended variables:

```text
PORT=3000
DATABASE_URL=./data/workshop.sqlite
JWT_SECRET=replace-with-secure-secret
ADMIN_NAME=Workshop Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
EVENT_TITLE=Workshop Event
EVENT_DATE=2026-07-08
```

## 18. Acceptance Criteria

The feature is complete when:

- The app starts with a seeded admin and seeded sessions.
- Admin can log in.
- Attendee can register and log in.
- Admin can manage sessions.
- Attendee can view sessions.
- Admin can display a QR code for attendance.
- Attendee can check in using the QR link.
- Duplicate attendance is prevented.
- Admin can view attendance records.
- Attendee can see certificate eligibility.
- Eligible attendee can download a PDF certificate.
- Ineligible attendee cannot download a certificate.
- Admin can view and download eligible attendee certificates.
- Role-based access is enforced across frontend and backend.
- Multi-language support (English and Myanmar) is active across all pages and persists in localStorage.

## 19. Multi-language Support (en/mm)

The application supports dynamic multi-language translation between English (`en`) and Myanmar / Burmese (`mm`).

### Features
- **Language Switcher**: Toggle selector buttons (EN / MM) located in the sidebar footer.
- **Persistence**: Selected language choice is saved in browser `localStorage` under `workshop_lang` and automatically loaded on subsequent visits.
- **Translation Scope**: All UI pages, navigation links, alerts, form inputs, status badges, details modals, and confirmation dialogs are translated.
- **Instant Translation**: Switching languages takes effect immediately across all active pages without requiring a page reload.

## 20. Out of Scope for Version 1

- Multi-day events
- Multi-track schedules
- Per-session attendance
- Payment or ticketing
- Email notifications
- Public certificate verification page
- Advanced analytics
- Bulk attendee import
- Manual attendance editing
- Live QR rotation
- Refresh tokens
- Password reset

## 21. Recommended Implementation Milestones

### Milestone 1: Project Setup

- Create React Vite frontend.
- Create Express backend.
- Configure SQLite.
- Configure shared development scripts.

### Milestone 2: Auth and Seed Data

- Add user table.
- Add password hashing.
- Add JWT login/register.
- Seed admin user.

### Milestone 3: Sessions

- Add sessions table.
- Seed sessions.
- Build admin session management.
- Build attendee schedule view.

### Milestone 4: Attendance

- Add attendance and attendance token tables.
- Build admin QR page.
- Build attendee check-in flow.
- Enforce idempotent attendance.

### Milestone 5: Certificates

- Add certificates table.
- Add eligibility logic.
- Generate PDF certificates.
- Add attendee and admin download flows.

### Milestone 6: Polish and Validation

- Add loading states.
- Add empty states.
- Add error states.
- Verify role-based routing.
- Test full attendee and admin flows.
