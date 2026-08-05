# Bookgram Backend

Bookgram is a personal library for readers to catalogue books, track reading progress, and rediscover their collection. This repository contains the Node.js, Express, MongoDB, and JWT API.

> The application is split into two repositories. The user interface is available in the [Bookgram frontend repository](https://github.com/shivanijwork/bookgram-frontend).

## Features

- User registration and login
- Password hashing with bcrypt
- Signed, expiring JWT access tokens
- Protected user and book routes
- User-scoped book creation, reading, updating, and deletion
- Filtering by status, genre, and tag
- Search by title or author
- Sorting and pagination
- Collection totals grouped by reading status
- Request validation and consistent JSON errors
- Authentication rate limiting
- Configurable CORS allowlist
- Reusable MongoDB connection for serverless environments

## Tech Stack

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- [JSON Web Tokens](https://www.rfc-editor.org/rfc/rfc7519)
- [bcrypt](https://www.npmjs.com/package/bcrypt)

## Project Structure

```text
config/       # MongoDB connection
controllers/  # Authentication and book request handlers
middleware/   # JWT protection, rate limiting, and error handling
models/       # User and Book schemas
routes/       # Express route definitions
utils/        # JWT and book-validation helpers
server.js     # Express application and local server entry point
```

## Prerequisites

- Node.js 20 or newer
- npm
- A local MongoDB server or MongoDB Atlas connection string

## Local Setup

1. Clone and enter the repository:

   ```bash
   git clone https://github.com/shivanijwork/bookgram-backend.git
   cd bookgram-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell, use:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Replace the example JWT secret with a long, random value. For example, Node.js can generate one locally:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

5. Start the API:

   ```bash
   npm run dev
   ```

6. Confirm it is running at [http://localhost:5000](http://localhost:5000). The root endpoint responds with `Bookgram API running`.

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `MONGO_URI` | Yes | None | MongoDB connection string |
| `JWT_SECRET` | Yes | None | Long random value used to sign and verify JWTs |
| `JWT_EXPIRES_IN` | No | `7d` | JWT lifetime accepted by `jsonwebtoken` |
| `FRONTEND_URL` | Yes in production | `http://localhost:3000` | Comma-separated list of allowed frontend origins |
| `PORT` | No | `5000` | Local HTTP port |
| `NODE_ENV` | No | `development` | Runtime environment |

Never commit `.env` or production credentials.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API with Nodemon |
| `npm start` | Start the API with Node.js |

## API Response Shape

Successful responses use a consistent envelope:

```json
{
  "status": true,
  "message": "Books fetched successfully",
  "data": {}
}
```

Errors return an HTTP error status with a message and optional field errors:

```json
{
  "status": false,
  "message": "Please correct the highlighted fields",
  "errors": [
    { "field": "title", "message": "Title is required" }
  ]
}
```

## API Routes

### Authentication

| Method | Route | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/users/register` | Public | Create an account and receive a JWT |
| `POST` | `/api/users/login` | Public | Log in and receive a JWT |
| `GET` | `/api/users/me` | Bearer token | Get the current user |

### Books

All book endpoints require an `Authorization: Bearer <token>` header.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/books` | List the current user's books |
| `POST` | `/api/books` | Add a book |
| `GET` | `/api/books/summary` | Get collection and status totals |
| `GET` | `/api/books/:id` | Get one owned book |
| `PATCH` | `/api/books/:id` | Update one owned book |
| `PATCH` | `/api/books/:id/status` | Change reading status |
| `DELETE` | `/api/books/:id` | Delete one owned book |

### Collection Query Parameters

`GET /api/books` supports:

| Parameter | Values | Purpose |
| --- | --- | --- |
| `status` | `tbr`, `reading`, `read` | Filter by reading status |
| `genre` | Text | Exact, case-insensitive genre filter |
| `tag` | Text | Exact, case-insensitive tag filter |
| `search` | Text | Search title and author |
| `sort` | `newest`, `oldest`, `title-asc`, `title-desc`, `author-asc`, `rating-desc` | Order results |
| `page` | Positive integer | Select a results page |
| `limit` | `1`–`100` | Set page size |

## Data Model

Each book belongs to exactly one user. Ownership is taken from the verified JWT rather than accepted from request input. Every read, update, and delete query includes the authenticated user's ID, preventing one user from accessing another user's books.

A book contains:

- Title and author
- Primary genre and tags
- Reading status: `tbr`, `reading`, or `read`
- Optional cover URL, rating, and notes
- A cropped book-spine image stored as a data URL
- Created and updated timestamps

Indexes cover common user, status, genre, and creation-date queries.

## Production Deployment

For a production deployment:

1. Create a MongoDB Atlas database and obtain its connection string.
2. Deploy the Express application to a Node.js-compatible host.
3. Configure `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, and `FRONTEND_URL` in the host's environment settings.
4. Set `FRONTEND_URL` to the exact deployed frontend origin. Separate multiple origins with commas.
5. Configure the frontend's `BACKEND_URL` with this API's deployed origin.
6. Test registration, login, direct page refreshes, CRUD operations, and CORS from the deployed frontend.

Before submission, add the deployed URL here:

- **Live API:** Not deployed yet
- **Frontend repository:** https://github.com/shivanijwork/bookgram-frontend

## Security Notes

- Passwords are hashed before storage and excluded from normal user queries.
- JWTs expire and are verified on every protected request.
- Book ownership is enforced at the database-query level.
- Login and registration requests are rate limited per IP.
- CORS accepts only configured frontend origins and non-browser requests.
- Production secrets belong in the deployment environment, never in source control.

## License

This project was created as a technical assignment for Thumbstack.
