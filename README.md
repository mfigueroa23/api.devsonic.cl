# API DevSonic

Backend API service built with NestJS, Prisma, and PostgreSQL for the DevSonic ecosystem. Provides RESTful endpoints for user management, notifications, and application configuration.

## Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript (ESM modules)
- **Database**: PostgreSQL 17
- **ORM**: Prisma 7
- **Email Service**: Brevo (formerly Sendinblue)
- **Testing**: Jest

## Features

- User management with role-based access (user, admin, vet)
- Email notifications via Brevo integration
- CORS domain management
- Layout template system
- PostgreSQL database with Prisma ORM
- Encrypted password storage
- Comprehensive logging

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

## API Endpoints

### Health Check
```http
GET /
```
Returns service name and status from database configuration.

### Users Module

```http
# Get all users
GET /users/getAll

# Get user by email or RUT
GET /users/getUser?email=user@example.com
GET /users/getUser?rut=12345678

# Create new user
POST /users/create
Body: {
  "email": "user@example.com",
  "name": "John",
  "lastname": "Doe",
  "rut": 12345678,
  "rut_dv": 9,
  "password": "securePassword",
  "role": "user"
}

# Update user (cannot update email or RUT)
PATCH /users/update?email=user@example.com
Body: {
  "name": "Jane",
  "lastname": "Doe"
}

# Toggle user active status
PATCH /users/active?email=user@example.com&status=true
PATCH /users/active?rut=12345678&status=false
```

### Notifications Module

```http
# Send portfolio contact notification
POST /notifications/portfolio
Body: {
  "name": "Contact Name",
  "email": "contact@example.com",
  "message": "Message content"
}
```

## Database Schema

### Users
- `id`: Auto-increment primary key
- `email`: Unique email address
- `name`: First name
- `lastname`: Last name
- `rut`: Chilean national ID (unique)
- `rut_dv`: RUT verification digit
- `password`: Encrypted password (varchar 3000)
- `role`: Enum (user, admin, vet)
- `active`: Boolean status (default: true)

### Supporting Tables
- `property`: Key-value configuration storage
- `cors_domains`: CORS domain whitelist management
- `layouts`: Email and UI layout templates

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
BREVO_API_KEY="your-brevo-api-key"
PORT=3000
```

## Author

**Marco Figueroa**
Email: mfigueroa@devsonic.cl

## License

UNLICENSED - Private project
