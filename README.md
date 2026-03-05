# API DevSonic

Backend API service built with NestJS, Prisma, and PostgreSQL for the DevSonic ecosystem. Provides RESTful endpoints for user management, pet management, authentication, and notifications.

## Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5.9 (ESM / nodenext modules)
- **Database**: PostgreSQL 17
- **ORM**: Prisma 7
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Brevo (formerly Sendinblue)
- **Testing**: Jest

## Features

- JWT-based authentication with role-based access control (user, admin)
- User management with encrypted password storage
- Pet management with weight tracking and weight history
- Email notifications via Brevo integration
- CORS domain whitelist management
- Layout/template system backed by the database
- Comprehensive request logging

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

## Development

```bash
# Start development server with hot reload
npm run start:dev

# Start in debug mode
npm run start:debug

# Build for production
npm run build

# Start production server
npm run start:prod
```

## Database

```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# Create new migration
npx prisma migrate dev --name description

# Deploy migrations to production
npx prisma migrate deploy

# Push schema changes without migration
npx prisma db push
```

## Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e

# Generate coverage report
npm run test:cov
```

## Code Quality

```bash
# Run ESLint with auto-fix
npm run lint

# Format code with Prettier
npm run format
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-jwt-secret"
PORT=3000
```

> Note: The Brevo API key and service configuration values (SERVICE_NAME, SERVICE_STATUS) are stored in the `property` table in the database, not in environment variables.

---

## API Endpoints

### Authentication Guards

Several routes are protected by guards applied in sequence:

| Guard | Requirement |
|---|---|
| `AuthGuard` | Validates the JWT in the `Authorization: Bearer <token>` header. Returns `401` if missing or invalid. |
| `ProfileAdminGuard` | Checks that the authenticated user has the `admin` role. Returns `401` if not. |
| `ProfileUserGuard` | Checks that the authenticated user has the `user` role. Returns `401` if not. |

Routes that require authentication must include the header:

```
Authorization: Bearer <jwt_token>
```

---

### Health Check

#### `GET /`

Returns the current service name and status from database configuration.

**Auth required:** No

**Response `200 OK`**

```json
{
  "serviceName": "api.devsonic.cl",
  "serviceStatus": "running"
}
```

**Response `500 Internal Server Error`** — database unreachable or properties missing

```json
{
  "serviceName": "unknown",
  "serviceStatus": "unknown",
  "error": "<error detail>"
}
```

---

### Auth Module

Base path: `/auth`

---

#### `POST /auth/logIn`

Authenticates a user by email and password. Returns a JWT session token on success.

**Auth required:** No

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | The user's email address |
| `password` | string | Yes | The user's plain-text password |

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response `200 OK` — credentials valid**

```json
{
  "message": "LogIn successful",
  "token": "<jwt_token>",
  "status": true
}
```

**Response `200 OK` — credentials invalid (password mismatch)**

```json
{
  "message": "LogIn failed",
  "status": false
}
```

**Response `404 Not Found` — user does not exist**

```json
{
  "message": "User not found"
}
```

**Response `500 Internal Server Error`**

```json
{
  "message": "An error occurred while login the user"
}
```

---

#### `POST /auth/verify`

Verifies a JWT token and returns the full user object associated with it.

**Auth required:** No (token is passed in the header manually, not via guard)

**Request headers**

| Header | Required | Description |
|---|---|---|
| `Authorization` | Yes | `Bearer <jwt_token>` |

**Response `200 OK`**

Returns the user object for the email encoded in the token:

```json
{
  "name": "Marco",
  "lastname": "Figueroa",
  "email": "user@example.com",
  "rut": "12345678-9",
  "active": true,
  "roles": ["user"]
}
```

**Response `400 Bad Request` — no token provided**

```json
{
  "message": "Must provide a valid token"
}
```

**Response `400 Bad Request` — token expired**

```json
{
  "message": "Token expired"
}
```

**Response `400 Bad Request` — token has invalid signature**

```json
{
  "message": "Token invalid"
}
```

**Response `500 Internal Server Error`**

```json
{
  "message": "An error occurred while verifying the token"
}
```

---

### Users Module

Base path: `/users`

---

#### `GET /users`

Returns all users in the system.

**Auth required:** Yes — `AuthGuard` + `ProfileAdminGuard` (admin role)

**Response `200 OK` — users found**

```json
[
  {
    "name": "Marco",
    "lastname": "Figueroa",
    "email": "user@example.com",
    "rut": "12345678-9",
    "active": true,
    "roles": ["user", "admin"]
  }
]
```

**Response `200 OK` — no users in database**

```json
{
  "message": "No users found"
}
```

**Response `401 Unauthorized` — missing or invalid token / insufficient role**

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

**Response `500 Internal Server Error`**

```json
{
  "message": "An error occurred while retrieving users"
}
```

---

#### `GET /users/find`

Finds a single user by email or RUT. Exactly one query parameter must be provided.

**Auth required:** Yes — `AuthGuard` + `ProfileAdminGuard` (admin role)

**Query parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `email` | string | Conditional | User's email address. Cannot be combined with `rut`. |
| `rut` | string | Conditional | User's Chilean RUT in `12345678-9` format. Cannot be combined with `email`. |

**Response `200 OK`**

```json
{
  "name": "Marco",
  "lastname": "Figueroa",
  "email": "user@example.com",
  "rut": "12345678-9",
  "active": true,
  "roles": ["user"]
}
```

**Response `400 Bad Request` — both parameters provided**

```json
{
  "message": "Please provide either email or rut, not both"
}
```

**Response `400 Bad Request` — no parameter provided**

```json
{
  "message": "Please provide either email or rut as a query parameter"
}
```

**Response `404 Not Found`**

```json
{
  "message": "User not found"
}
```

**Response `500 Internal Server Error`**

```json
{
  "message": "An error occurred while retrieving users"
}
```

---

#### `POST /users`

Creates a new user. The password is encrypted before storage. The `user` role is automatically assigned to the new user.

**Auth required:** No

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | User's first name |
| `lastname` | string | Yes | User's last name |
| `email` | string | Yes | Unique email address |
| `rut` | string | Yes | Chilean RUT in `12345678-9` format (digits-verifier) |
| `password` | string | Yes | Plain-text password, encrypted before storage |

```json
{
  "name": "Marco",
  "lastname": "Figueroa",
  "email": "user@example.com",
  "rut": "12345678-9",
  "password": "securePassword123"
}
```

**Response `201 Created`**

```json
{
  "name": "Marco",
  "lastname": "Figueroa",
  "email": "user@example.com",
  "rut": "12345678-9",
  "active": true,
  "roles": ["user"]
}
```

**Response `400 Bad Request` — duplicate email or RUT**

```json
{
  "message": "A user with the same email or rut already exists"
}
```

**Response `500 Internal Server Error`**

```json
{
  "message": "An error occurred while creating a user"
}
```

---

#### `PATCH /users`

Updates mutable fields of an existing user. Exactly one query parameter (`email` or `rut`) must be provided to identify the target user. The fields `rut`, `rut_dv`, `email`, and `active` cannot be updated via this endpoint. If a new password is provided it is re-encrypted before storage.

**Auth required:** Yes — `AuthGuard` + `ProfileAdminGuard` (admin role)

**Query parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `email` | string | Conditional | Identify target user by email. Cannot be combined with `rut`. |
| `rut` | string | Conditional | Identify target user by RUT (`12345678-9` format). Cannot be combined with `email`. |

**Request body** (all fields optional, at least one should be provided)

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | No | New first name |
| `lastname` | string | No | New last name |
| `password` | string | No | New plain-text password, re-encrypted before storage |

```json
{
  "name": "Marco",
  "lastname": "Updated"
}
```

**Response `200 OK`**

Returns the updated user object in the same shape as `GET /users/find`.

**Response `400 Bad Request` — no query parameter provided**

```json
{
  "message": "Please provide either email or rut as a query parameter"
}
```

**Response `400 Bad Request` — attempt to update restricted fields**

```json
{
  "message": "Updating rut, rut_dv, email or active fields is not allowed"
}
```

**Response `500 Internal Server Error`**

```json
{
  "message": "An error occurred while updating a user"
}
```

---

#### `PUT /users`

Adds or removes a role from a user. Exactly one of `email` or `rut` must be provided.

**Auth required:** Yes — `AuthGuard` + `ProfileAdminGuard` (admin role)

**Query parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `email` | string | Conditional | Identify target user by email. Cannot be combined with `rut`. |
| `rut` | string | Conditional | Identify target user by RUT (`12345678-9` format). Cannot be combined with `email`. |
| `role` | string | Yes | Role name to assign or remove (e.g., `admin`, `user`, `vet`) |
| `action` | string | Yes | Must be `add` or `remove` |

**Response `200 OK`**

Returns the updated user object in the same shape as `GET /users/find`.

**Response `400 Bad Request` — both email and rut provided**

```json
{
  "message": "Please provide either email or rut, not both, for role update"
}
```

**Response `400 Bad Request` — no identifier provided**

```json
{
  "message": "Please provide either email or rut as a query parameter"
}
```

**Response `400 Bad Request` — invalid action value**

```json
{
  "message": "Invalid action. Use <add> or <remove>"
}
```

**Response `400 Bad Request` — user already has the role (on add)**

```json
{
  "message": "The user already has this role"
}
```

**Response `400 Bad Request` — user does not have the role (on remove)**

```json
{
  "message": "User does not have the role '<role>' assigned"
}
```

**Response `500 Internal Server Error`**

```json
{
  "message": "An error occurred while updating user role"
}
```

---

#### `DELETE /users`

Updates the active status of a user (soft enable/disable). Despite using the `DELETE` HTTP method, this does not remove the user record. Exactly one of `email` or `rut` must be provided.

**Auth required:** Yes — `AuthGuard` + `ProfileAdminGuard` (admin role)

**Query parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `email` | string | Conditional | Identify target user by email. Cannot be combined with `rut`. |
| `rut` | string | Conditional | Identify target user by RUT (`12345678-9` format). Cannot be combined with `email`. |
| `active` | string | Yes | `"true"` to activate, `"false"` to deactivate |

**Response `200 OK`**

Returns the updated user object in the same shape as `GET /users/find`.

**Response `400 Bad Request` — both email and rut provided**

```json
{
  "message": "Please provide either email or rut, not both, for status update"
}
```

**Response `400 Bad Request` — no identifier provided**

```json
{
  "message": "Please provide either email or rut as a query parameter"
}
```

**Response `500 Internal Server Error`**

```json
{
  "message": "An error occurred while updating user status"
}
```

---

### Pets Module

Base path: `/pets`

All pet endpoints require authentication. The owner of the pet is determined from the JWT token payload (the `email` claim), so a user can only create or modify their own pets. Admin endpoints accept an optional `owner` query parameter to override the identity lookup and target another user's pets.

---

#### `GET /pets`

Returns all pets across all users.

**Auth required:** Yes — `AuthGuard` + `ProfileAdminGuard` (admin role)

**Response `200 OK`**

```json
[
  {
    "id": 1,
    "name": "Firulais",
    "born_date": "Marzo 2020",
    "age": "4",
    "desease": false,
    "specie": "Perro",
    "breed": "Labrador",
    "user": {
      "name": "Marco",
      "lastname": "Figueroa",
      "email": "user@example.com",
      "rut": "12345678-9",
      "active": true,
      "roles": ["user"]
    },
    "pet_weight": "10.5 kg",
    "weight_history": [
      {
        "weight": "10.5 kg",
        "date": "2024-03-01T12:00:00.000Z"
      }
    ]
  }
]
```

**Response `500 Internal Server Error`**

```json
{
  "message": "An error occurred while fetching the pets"
}
```

---

#### `GET /pets/byOwner`

Returns all pets belonging to an owner. If the `owner` query parameter is omitted, the owner email is extracted from the JWT token.

**Auth required:** Yes — `AuthGuard` + `ProfileAdminGuard` (admin role)

**Query parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `owner` | string | No | Email of the target owner. If omitted, the authenticated user's email is used. |

**Response `200 OK`**

Returns an array of pet objects in the same shape as `GET /pets`.

**Response `500 Internal Server Error`**

```json
{
  "message": "An error ocurred while getting the pets"
}
```

---

#### `GET /pets/byNameAndOwner`

Returns a specific pet identified by name and owner. If the `owner` query parameter is omitted, the owner email is extracted from the JWT token.

**Auth required:** Yes — `AuthGuard` + `ProfileAdminGuard` (admin role)

**Query parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `pet` | string | Yes | The pet's name |
| `owner` | string | No | Email of the target owner. If omitted, the authenticated user's email is used. |

**Response `200 OK`**

Returns a single pet object in the same shape as `GET /pets`.

**Response `400 Bad Request` — pet name not provided**

```json
{
  "message": "Must provide a pet name"
}
```

**Response `500 Internal Server Error`**

```json
{
  "message": "An error ocurred while getting the pet"
}
```

---

#### `POST /pets`

Creates a new pet. The owner is derived from the email claim in the JWT token.

**Auth required:** Yes — `AuthGuard` + `ProfileUserGuard` (user role)

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Pet's name |
| `born_month` | string (BornMonth enum) | Yes | Month of birth in Spanish. One of: `Enero`, `Febrero`, `Marzo`, `Abril`, `Mayo`, `Junio`, `Julio`, `Agosto`, `Septiembre`, `Octubre`, `Noviembre`, `Diciembre` |
| `born_year` | number | Yes | Year of birth (e.g., `2020`) |
| `age` | string | No | Age string. If omitted defaults to `"0"` |
| `deseace` | boolean | No | Whether the pet has a disease. Defaults to `false` |
| `weight` | number | No | Current weight value |
| `weight_unit` | string | No | Weight unit name as stored in the `weight_unit` table (e.g., `"kg"`) |
| `specie` | string | Yes | Species name as stored in the `pet_specie` table (e.g., `"Perro"`) |
| `breed` | string | Yes | Breed description |

```json
{
  "name": "Firulais",
  "born_month": "Marzo",
  "born_year": 2020,
  "deseace": false,
  "weight": 10.5,
  "weight_unit": "kg",
  "specie": "Perro",
  "breed": "Labrador"
}
```

**Response `201 Created`**

```json
{
  "name": "Firulais",
  "born_date": "Marzo 2020",
  "age": "0",
  "desease": false,
  "specie": "Perro",
  "breed": "Labrador",
  "user": {
    "name": "Marco",
    "lastname": "Figueroa",
    "email": "user@example.com",
    "rut": "12345678-9",
    "active": true,
    "roles": ["user"]
  },
  "pet_weight": "10.5 kg",
  "weight_history": [
    {
      "weight": "10.5 kg",
      "date": "2024-03-01T12:00:00.000Z"
    }
  ]
}
```

**Response `500 Internal Server Error`**

```json
{
  "message": "An error has occurred while creating the pet"
}
```

---

#### `PATCH /pets`

Updates mutable fields of an existing pet belonging to the authenticated user. The `age` field cannot be updated via this endpoint (it is considered auto-generated). The owner is always taken from the JWT token.

**Auth required:** Yes — `AuthGuard` + `ProfileUserGuard` (user role)

**Query parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `pet` | string | Yes | Name of the pet to update |

**Request body** (all fields optional)

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | No | New pet name |
| `born_month` | string (BornMonth enum) | No | New birth month (Spanish enum value) |
| `born_year` | number | No | New birth year |
| `desease` | boolean | No | Disease status |
| `breed` | string | No | New breed |

```json
{
  "name": "Firulais Updated",
  "breed": "Golden Retriever"
}
```

**Response `200 OK`**

Returns the updated pet object in the same shape as `GET /pets`.

**Response `400 Bad Request` — pet name not provided**

```json
{
  "message": "Must provide a pet name"
}
```

**Response `500 Internal Server Error`**

```json
{
  "message": "An error occurred while updating the pet"
}
```

---

#### `PUT /pets`

Updates the current weight of a pet and appends an entry to the pet's weight history. The owner is taken from the JWT token unless `email` is provided.

**Auth required:** Yes — `AuthGuard` + `ProfileUserGuard` (user role)

**Query parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `pet` | string | Yes | Name of the pet |
| `weight` | number | Yes | New weight value |
| `email` | string | No | Owner email override. If omitted, the authenticated user's email is used from the JWT token. |

**Response `200 OK`**

Returns the updated pet object in the same shape as `GET /pets`.

**Response `400 Bad Request` — pet name or weight not provided**

```json
{
  "message": "Must provide a pet name and pet weight"
}
```

**Response `500 Internal Server Error`**

```json
{
  "message": "An error occurred while updating the pet weight"
}
```

---

### Notifications Module

Base path: `/notifications`

---

#### `POST /notifications/portfolio`

Sends a portfolio contact notification email via Brevo. The email is delivered using an HTML template stored in the `layouts` table (key: `Contact Devsonic Portfolio`). All three body fields are required.

**Auth required:** No

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Sender's name |
| `email` | string | Yes | Sender's email address |
| `message` | string | Yes | Message content |

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Hello, I saw your portfolio and would like to get in touch."
}
```

**Response `200 OK`**

```json
{
  "message": "Notificación enviada exitosamente",
  "estado": true
}
```

**Response `400 Bad Request` — missing required fields**

```json
{
  "message": "Faltan datos en la solicitud de notificación {name, email, message}"
}
```

**Response `500 Internal Server Error`**

```json
{
  "message": "Error al enviar la solicitud de notificación"
}
```

---

## Database Schema

The database is managed by Prisma ORM and backed by PostgreSQL 17. Below is the full schema as defined in `prisma/schema.prisma`.

### Enums

#### `BornMonth`

Used for pet birth month. Values are Spanish month names:

`Enero` | `Febrero` | `Marzo` | `Abril` | `Mayo` | `Junio` | `Julio` | `Agosto` | `Septiembre` | `Octubre` | `Noviembre` | `Diciembre`

---

### Configuration Tables

#### `property`

Key-value store for runtime configuration (e.g., `SERVICE_NAME`, `SERVICE_STATUS`, `BREVO_APIKEY`).

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `key` | String | Unique |
| `value` | String | — |

#### `cors_domains`

Stores domains that are allowed by the CORS policy.

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `domain` | String | Unique |
| `habilitated` | Boolean | Default: `false` |

#### `layouts`

HTML email and UI templates stored as base64-encoded content.

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `name` | String | Unique |
| `description` | String | — |
| `content` | String | VarChar(10000), stored as base64 |

---

### User Tables

#### `users`

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `email` | String | Unique |
| `name` | String | — |
| `lastname` | String | — |
| `rut` | Int | Unique (Chilean national ID number) |
| `rut_dv` | Int | Verification digit |
| `password` | String | VarChar(3000), encrypted |
| `active` | Boolean | Default: `true` |

Relations: `pets[]`, `users_roles[]`, `recipes[]`, `notes` (user_notes[]), `reminders` (user_reminders[])

#### `roles`

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `name` | String | Unique |

#### `users_roles`

Join table linking users to roles.

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `user_id` | Int | Foreign key → `users.id` |
| `role_id` | Int | Foreign key → `roles.id` |

---

### Pet Tables

#### `pets`

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `name` | String | — |
| `born_year` | Int | — |
| `born_month` | BornMonth | Enum |
| `age` | String | — |
| `desease` | Boolean | Default: `false` |
| `user_id` | Int | Foreign key → `users.id` |
| `specie_id` | Int | Foreign key → `pet_specie.id` |
| `breed` | String | — |

Relations: `pet_weight[]`, `pet_weight_history[]`, `vaccines[]`, `deworming[]`, `recipes[]`, `notes` (pets_notes[]), `reminders` (pets_reminders[])

#### `pet_specie`

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `name` | String | Unique |

#### `pet_weight`

Stores the current weight of a pet (one record per pet).

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `pet_id` | Int | Unique, foreign key → `pets.id` |
| `weight` | Float | Default: `0` |
| `weight_unit_id` | Int | Foreign key → `weight_unit.id`, default: `1` |

#### `pet_weight_history`

Stores the full weight history of a pet (multiple records per pet).

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `pet_id` | Int | Foreign key → `pets.id` |
| `weight` | Float | Default: `0` |
| `weight_unit_id` | Int | Foreign key → `weight_unit.id`, default: `1` |
| `date` | DateTime | Default: `now()` |

#### `weight_unit`

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `name` | String | Unique |

---

### Medical / Health Tables

#### `vaccines`

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `name` | String | — |
| `quantity` | Int | — |
| `date` | DateTime | Default: `now()` |
| `content` | String | VarChar(10000) |
| `pet_id` | Int | Foreign key → `pets.id` |

#### `deworming`

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `name` | String | — |
| `date` | DateTime | Default: `now()` |
| `content` | String | VarChar(10000) |
| `quantity` | Int | — |
| `pet_id` | Int | Foreign key → `pets.id` |

#### `recipes`

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `name` | String | — |
| `content` | String | VarChar(10000) |
| `date` | DateTime | Default: `now()` |
| `pet_id` | Int | Foreign key → `pets.id` |
| `user_id` | Int | Foreign key → `users.id` |

---

### Notes and Reminders

#### `notes`

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `name` | String | — |
| `content` | String | VarChar(10000) |
| `date` | DateTime | Default: `now()` |

#### `user_notes`

Join table linking notes to users.

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `user_id` | Int | Foreign key → `users.id` |
| `notes_id` | Int | Foreign key → `notes.id` |

#### `pets_notes`

Join table linking notes to pets.

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `pet_id` | Int | Foreign key → `pets.id` |
| `notes_id` | Int | Foreign key → `notes.id` |

#### `reminders`

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `name` | String | — |
| `content` | String | VarChar(10000) |
| `date_creation` | DateTime | Default: `now()` |
| `date_due` | DateTime | — |

#### `user_reminders`

Join table linking reminders to users.

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `user_id` | Int | Foreign key → `users.id` |
| `reminders_id` | Int | Foreign key → `reminders.id` |

#### `pets_reminders`

Join table linking reminders to pets.

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `pet_id` | Int | Foreign key → `pets.id` |
| `reminders_id` | Int | Foreign key → `reminders.id` |

---

## Author

**Marco Figueroa**
Email: mfigueroa@devsonic.cl

## License

UNLICENSED - Private project
