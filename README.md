# API DevSonic

Backend API service built with NestJS, Prisma, and PostgreSQL for the DevSonic portfolio ecosystem. Provides RESTful endpoints for CV/portfolio data management, email notifications, and layout template storage.

## Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5.9 (ESM / nodenext modules)
- **Database**: PostgreSQL 17
- **ORM**: Prisma 7
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Brevo (formerly Sendinblue)
- **Testing**: Jest

## Features

- JWT-based authentication for write operations
- Portfolio CV data management (about, experience, projects, testimonials, contact)
- Email notifications via Brevo integration
- CORS domain whitelist management (database-driven)
- Layout/template system backed by the database (Base64-encoded HTML)
- Runtime configuration via database properties table

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
PORT=3000
```

> Note: `JWT_SECRET`, `BREVO_APIKEY`, `SERVICE_NAME`, and `SERVICE_STATUS` are stored in the `property` table in the database, not in environment variables.

---

## Authentication

Write operations (POST, PATCH, DELETE) on most modules are protected by `JwtGuard`. All GET endpoints are public, except for the `layouts` module where all operations require authentication.

**Header format:**

```
Authorization: Bearer <jwt_token>
```

`JwtGuard` validates the token using `JWT_SECRET` fetched from the `property` table at runtime. Returns `401 Unauthorized` if the header is missing, malformed, or the token is invalid/expired.

---

## API Endpoints

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

### About Module

Base path: `/about`

---

#### `GET /about`

Returns all about section items.

**Auth required:** No

**Response `200 OK`**

```json
[
  {
    "id": 1,
    "icon": "FaUser",
    "title": "Who I am",
    "description": "Full-stack developer with 5+ years of experience."
  }
]
```

---

#### `GET /about/:id`

Returns a single about item by ID.

**Auth required:** No

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | number | About item ID |

**Response `200 OK`**

```json
{
  "id": 1,
  "icon": "FaUser",
  "title": "Who I am",
  "description": "Full-stack developer with 5+ years of experience."
}
```

**Response `404 Not Found`**

```json
{
  "message": "About with id <id> not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

#### `POST /about`

Creates a new about item.

**Auth required:** Yes — `JwtGuard`

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `icon` | string | Yes | Icon identifier (e.g., component name or icon key) |
| `title` | string | Yes | Section title |
| `description` | string | Yes | Section description text |

```json
{
  "icon": "FaUser",
  "title": "Who I am",
  "description": "Full-stack developer with 5+ years of experience."
}
```

**Response `201 Created`**

```json
{
  "id": 1,
  "icon": "FaUser",
  "title": "Who I am",
  "description": "Full-stack developer with 5+ years of experience."
}
```

**Response `401 Unauthorized`** — missing or invalid token

---

#### `PATCH /about/:id`

Updates an existing about item.

**Auth required:** Yes — `JwtGuard`

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | number | About item ID |

**Request body** (all fields optional)

| Field | Type | Required | Description |
|---|---|---|---|
| `icon` | string | No | Icon identifier |
| `title` | string | No | Section title |
| `description` | string | No | Section description text |

**Response `200 OK`** — returns updated about object

**Response `404 Not Found`** — item not found

**Response `401 Unauthorized`** — missing or invalid token

---

#### `DELETE /about/:id`

Deletes an about item.

**Auth required:** Yes — `JwtGuard`

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | number | About item ID |

**Response `204 No Content`** — deleted successfully

**Response `404 Not Found`** — item not found

**Response `401 Unauthorized`** — missing or invalid token

---

### Contact Module

Base path: `/contact`

---

#### `GET /contact`

Returns all contact items.

**Auth required:** No

**Response `200 OK`**

```json
[
  {
    "id": 1,
    "icon": "FaEnvelope",
    "label": "Email",
    "value": "mfigueroa@devsonic.cl",
    "href": "mailto:mfigueroa@devsonic.cl"
  }
]
```

---

#### `GET /contact/:id`

Returns a single contact item by ID.

**Auth required:** No

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | number | Contact item ID |

**Response `200 OK`**

```json
{
  "id": 1,
  "icon": "FaEnvelope",
  "label": "Email",
  "value": "mfigueroa@devsonic.cl",
  "href": "mailto:mfigueroa@devsonic.cl"
}
```

**Response `404 Not Found`**

```json
{
  "message": "Contact with id <id> not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

#### `POST /contact`

Creates a new contact item.

**Auth required:** Yes — `JwtGuard`

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `icon` | string | Yes | Icon identifier |
| `label` | string | Yes | Display label (e.g., "Email", "GitHub") |
| `value` | string | Yes | Display value (e.g., email address, username) |
| `href` | string | Yes | Link URL or protocol (e.g., `mailto:`, `https://`) |

```json
{
  "icon": "FaEnvelope",
  "label": "Email",
  "value": "mfigueroa@devsonic.cl",
  "href": "mailto:mfigueroa@devsonic.cl"
}
```

**Response `201 Created`** — returns created contact object

**Response `401 Unauthorized`** — missing or invalid token

---

#### `PATCH /contact/:id`

Updates an existing contact item.

**Auth required:** Yes — `JwtGuard`

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | number | Contact item ID |

**Request body** (all fields optional)

| Field | Type | Required | Description |
|---|---|---|---|
| `icon` | string | No | Icon identifier |
| `label` | string | No | Display label |
| `value` | string | No | Display value |
| `href` | string | No | Link URL |

**Response `200 OK`** — returns updated contact object

**Response `404 Not Found`** — item not found

**Response `401 Unauthorized`** — missing or invalid token

---

#### `DELETE /contact/:id`

Deletes a contact item.

**Auth required:** Yes — `JwtGuard`

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | number | Contact item ID |

**Response `204 No Content`** — deleted successfully

**Response `404 Not Found`** — item not found

**Response `401 Unauthorized`** — missing or invalid token

---

### Experience Module

Base path: `/experience`

---

#### `GET /experience`

Returns all work experience entries.

**Auth required:** No

**Response `200 OK`**

```json
[
  {
    "id": 1,
    "period": "Jan 2022 - Present",
    "role": "Full-Stack Developer",
    "company": "DevSonic",
    "description": "Development of web applications and APIs.",
    "technologies": "NestJS, React, PostgreSQL",
    "current": true
  }
]
```

---

#### `GET /experience/:id`

Returns a single experience entry by ID.

**Auth required:** No

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | number | Experience entry ID |

**Response `200 OK`** — returns single experience object

**Response `404 Not Found`**

```json
{
  "message": "Experience with id <id> not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

#### `POST /experience`

Creates a new experience entry.

**Auth required:** Yes — `JwtGuard`

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `period` | string | Yes | Time period (e.g., `"Jan 2020 - Dec 2022"`) |
| `role` | string | Yes | Job title |
| `company` | string | Yes | Company name |
| `description` | string | Yes | Job description |
| `technologies` | string | Yes | Technologies used (comma-separated or free text) |
| `current` | boolean | No | Whether this is the current position. Default: `false` |

```json
{
  "period": "Jan 2022 - Present",
  "role": "Full-Stack Developer",
  "company": "DevSonic",
  "description": "Development of web applications and APIs.",
  "technologies": "NestJS, React, PostgreSQL",
  "current": true
}
```

**Response `201 Created`** — returns created experience object

**Response `401 Unauthorized`** — missing or invalid token

---

#### `PATCH /experience/:id`

Updates an existing experience entry.

**Auth required:** Yes — `JwtGuard`

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | number | Experience entry ID |

**Request body** (all fields optional)

| Field | Type | Required | Description |
|---|---|---|---|
| `period` | string | No | Time period |
| `role` | string | No | Job title |
| `company` | string | No | Company name |
| `description` | string | No | Job description |
| `technologies` | string | No | Technologies used |
| `current` | boolean | No | Current position flag |

**Response `200 OK`** — returns updated experience object

**Response `404 Not Found`** — entry not found

**Response `401 Unauthorized`** — missing or invalid token

---

#### `DELETE /experience/:id`

Deletes an experience entry.

**Auth required:** Yes — `JwtGuard`

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | number | Experience entry ID |

**Response `204 No Content`** — deleted successfully

**Response `404 Not Found`** — entry not found

**Response `401 Unauthorized`** — missing or invalid token

---

### Project Module

Base path: `/project`

---

#### `GET /project`

Returns all portfolio projects.

**Auth required:** No

**Response `200 OK`**

```json
[
  {
    "id": 1,
    "title": "API DevSonic",
    "image": "https://example.com/image.png",
    "tags": "NestJS, Prisma, PostgreSQL",
    "description": "Backend API for the DevSonic portfolio.",
    "link": "https://api.devsonic.cl",
    "githubLink": "https://github.com/devsonic/api"
  }
]
```

---

#### `GET /project/:id`

Returns a single project by ID.

**Auth required:** No

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | number | Project ID |

**Response `200 OK`** — returns single project object

**Response `404 Not Found`**

```json
{
  "message": "Project with id <id> not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

#### `POST /project`

Creates a new project.

**Auth required:** Yes — `JwtGuard`

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | Project name |
| `image` | string | Yes | Image URL |
| `tags` | string | Yes | Tags (comma-separated or free text) |
| `description` | string | No | Project description. Default: `""` |
| `link` | string | No | Live project URL. Default: `""` |
| `githubLink` | string | No | GitHub repository URL. Default: `""` |

```json
{
  "title": "API DevSonic",
  "image": "https://example.com/image.png",
  "tags": "NestJS, Prisma, PostgreSQL",
  "description": "Backend API for the DevSonic portfolio.",
  "link": "https://api.devsonic.cl",
  "githubLink": "https://github.com/devsonic/api"
}
```

**Response `201 Created`** — returns created project object

**Response `401 Unauthorized`** — missing or invalid token

---

#### `PATCH /project/:id`

Updates an existing project.

**Auth required:** Yes — `JwtGuard`

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | number | Project ID |

**Request body** (all fields optional)

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | No | Project name |
| `image` | string | No | Image URL |
| `tags` | string | No | Tags |
| `description` | string | No | Project description |
| `link` | string | No | Live project URL |
| `githubLink` | string | No | GitHub repository URL |

**Response `200 OK`** — returns updated project object

**Response `404 Not Found`** — project not found

**Response `401 Unauthorized`** — missing or invalid token

---

#### `DELETE /project/:id`

Deletes a project.

**Auth required:** Yes — `JwtGuard`

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | number | Project ID |

**Response `204 No Content`** — deleted successfully

**Response `404 Not Found`** — project not found

**Response `401 Unauthorized`** — missing or invalid token

---

### Testimonials Module

Base path: `/testimonials`

---

#### `GET /testimonials`

Returns all testimonials.

**Auth required:** No

**Response `200 OK`**

```json
[
  {
    "id": 1,
    "quote": "Marco delivered the project on time and exceeded expectations.",
    "author": "Jane Doe",
    "role": "CTO at Acme Corp",
    "avatar": "https://example.com/avatar.png"
  }
]
```

---

#### `GET /testimonials/:id`

Returns a single testimonial by ID.

**Auth required:** No

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | number | Testimonial ID |

**Response `200 OK`** — returns single testimonial object

**Response `404 Not Found`**

```json
{
  "message": "Testimonial with id <id> not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

#### `POST /testimonials`

Creates a new testimonial.

**Auth required:** Yes — `JwtGuard`

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `quote` | string | Yes | Testimonial text |
| `author` | string | Yes | Author's full name |
| `role` | string | Yes | Author's title and/or company |
| `avatar` | string | Yes | Avatar image URL |

```json
{
  "quote": "Marco delivered the project on time and exceeded expectations.",
  "author": "Jane Doe",
  "role": "CTO at Acme Corp",
  "avatar": "https://example.com/avatar.png"
}
```

**Response `201 Created`** — returns created testimonial object

**Response `401 Unauthorized`** — missing or invalid token

---

#### `PATCH /testimonials/:id`

Updates an existing testimonial.

**Auth required:** Yes — `JwtGuard`

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | number | Testimonial ID |

**Request body** (all fields optional)

| Field | Type | Required | Description |
|---|---|---|---|
| `quote` | string | No | Testimonial text |
| `author` | string | No | Author's full name |
| `role` | string | No | Author's title and/or company |
| `avatar` | string | No | Avatar image URL |

**Response `200 OK`** — returns updated testimonial object

**Response `404 Not Found`** — testimonial not found

**Response `401 Unauthorized`** — missing or invalid token

---

#### `DELETE /testimonials/:id`

Deletes a testimonial.

**Auth required:** Yes — `JwtGuard`

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | number | Testimonial ID |

**Response `204 No Content`** — deleted successfully

**Response `404 Not Found`** — testimonial not found

**Response `401 Unauthorized`** — missing or invalid token

---

### Layouts Module

Base path: `/layouts`

Stores Base64-encoded HTML email and UI templates. All endpoints require authentication.

---

#### `GET /layouts`

Returns all layout templates.

**Auth required:** Yes — `JwtGuard`

**Response `200 OK`**

```json
[
  {
    "id": 1,
    "name": "Contact Devsonic Portfolio",
    "description": "Email template for portfolio contact form",
    "content": "<base64-encoded-html>"
  }
]
```

---

#### `GET /layouts/:id`

Returns a single layout template by ID.

**Auth required:** Yes — `JwtGuard`

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | number | Layout ID |

**Response `200 OK`** — returns single layout object

**Response `404 Not Found`**

```json
{
  "message": "Layout with id <id> not found",
  "error": "Not Found",
  "statusCode": 404
}
```

**Response `401 Unauthorized`** — missing or invalid token

---

#### `POST /layouts`

Creates a new layout template.

**Auth required:** Yes — `JwtGuard`

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Unique template name |
| `description` | string | Yes | Template description |
| `content` | string | Yes | Base64-encoded HTML template |

```json
{
  "name": "Contact Devsonic Portfolio",
  "description": "Email template for portfolio contact form",
  "content": "PGh0bWw+Li4uPC9odG1sPg=="
}
```

**Response `201 Created`** — returns created layout object

**Response `401 Unauthorized`** — missing or invalid token

---

#### `PATCH /layouts/:id`

Updates an existing layout template.

**Auth required:** Yes — `JwtGuard`

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | number | Layout ID |

**Request body** (all fields optional)

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | No | Unique template name |
| `description` | string | No | Template description |
| `content` | string | No | Base64-encoded HTML template |

**Response `200 OK`** — returns updated layout object

**Response `404 Not Found`** — layout not found

**Response `401 Unauthorized`** — missing or invalid token

---

#### `DELETE /layouts/:id`

Deletes a layout template.

**Auth required:** Yes — `JwtGuard`

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | number | Layout ID |

**Response `204 No Content`** — deleted successfully

**Response `404 Not Found`** — layout not found

**Response `401 Unauthorized`** — missing or invalid token

---

### Notifications Module

Base path: `/notifications`

---

#### `POST /notifications/portfolio`

Sends a portfolio contact notification email via Brevo. The email is delivered using an HTML template stored in the `layouts` table (name: `Contact Devsonic Portfolio`). Placeholders `{{name}}`, `{{email}}`, and `{{message}}` in the template are replaced at send time. The message is sent from `no-reply@devsonic.cl` to `mfigueroa@devsonic.cl`.

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
  "message": "Notification sent successfuly",
  "estado": true
}
```

**Response `400 Bad Request`** — missing required fields

```json
{
  "message": "Missing data in the notification request {name, email, message}"
}
```

**Response `500 Internal Server Error`**

```json
{
  "message": "An error has occurred while sending the notification"
}
```

---

## Database Schema

The database is managed by Prisma ORM and backed by PostgreSQL 17.

### Configuration Tables

#### `property`

Key-value store for runtime configuration.

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `key` | String | Unique |
| `value` | String | — |

**Known keys:** `SERVICE_NAME`, `SERVICE_STATUS`, `JWT_SECRET`, `BREVO_APIKEY`

#### `cors_domains`

Stores domains allowed by the CORS policy. Loaded at application startup.

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `domain` | String | Unique |
| `habilitated` | Boolean | Default: `false` |

#### `layouts`

HTML email and UI templates stored as Base64-encoded content.

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `name` | String | Unique |
| `description` | String | — |
| `content` | String | VarChar(10000), stored as Base64 |

---

### CV / Portfolio Tables

#### `about`

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `icon` | String | — |
| `title` | String | — |
| `description` | String | — |

#### `contact`

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `icon` | String | — |
| `label` | String | — |
| `value` | String | — |
| `href` | String | — |

#### `experience`

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `period` | String | — |
| `role` | String | — |
| `company` | String | — |
| `description` | String | — |
| `technologies` | String | — |
| `current` | Boolean | Default: `false` |

#### `project`

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `title` | String | — |
| `image` | String | — |
| `tags` | String | — |
| `description` | String | Default: `""` |
| `link` | String | Default: `""` |
| `githubLink` | String | Default: `""` |

#### `testimonials`

| Column | Type | Constraints |
|---|---|---|
| `id` | Int | Primary key, auto-increment |
| `quote` | String | — |
| `author` | String | — |
| `role` | String | — |
| `avatar` | String | — |

---

## Author

**Marco Figueroa**
Email: mfigueroa@devsonic.cl

## License

UNLICENSED - Private project
