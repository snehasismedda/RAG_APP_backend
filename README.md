# RAG Backend

A robust backend service for a Retrieval Augmented Generation (RAG) system, built with Node.js and Express. It supports file ingestion (PDF, DOCX, TXT), vector search, and context-aware chat capabilities.

## 🚀 Features

*   **Authentication**: Secure user authentication using JWT-based access tokens and refresh tokens with Passport.js. Tokens are stored in HTTP-only cookies for enhanced security.
*   **File Ingestion**: Upload documents via AWS S3 Presigned URLs. Supports text extraction from PDFs, DOCX files, and plain text.
*   **Vector Search**: Uses Qdrant for efficient vector storage and similarity search. Embeddings are generated using Google Gemini models.
*   **Chat Interface**: Conversational AI capabilities with context retrieval from ingested documents.
*   **Notebook Management**: Create and manage notebooks to organize your work.
*   **Asynchronous Processing**: Background job processing for file ingestion, deletion, and other heavy tasks using BullMQ and Redis queues.
*   **Scalable Architecture**: Built with modularity and scalability in mind using Docker and microservices principles.

## 🛠️ Tech Stack

*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Database**: [PostgreSQL](https://www.postgresql.org/) (with [Knex.js](https://knexjs.org/))
*   **Vector Store**: [Qdrant](https://qdrant.tech/)
*   **Cache & Queue**: [Redis](https://redis.io/) & [BullMQ](https://docs.bullmq.io/)
*   **AI/ML**: [Google Gemini](https://ai.google.dev/) (Embeddings & Generative AI), [LangChain](https://js.langchain.com/)

## 📋 Prerequisites

Ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=8000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Google Gemini
GOOGLE_API_KEY=your_google_api_key

# Qdrant
QDRANT_URL=http://localhost:6333

# JWT
JWT_SECRET=your_jwt_secret

# AWS S3 (For File Uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name
```

## 🚀 Getting Started

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Start Infrastructure Services:**

    Start PostgreSQL, Qdrant, and Redis using Docker Compose:

    ```bash
    docker-compose up -d
    ```

4.  **Run Migrations:**

    Set up the database schema:

    ```bash
    npm run migrate:latest
    ```

5.  **Start the Server:**

    ```bash
    npm run dev
    ```

    The server will start at `http://localhost:8000`.

## 📚 API Endpoints

### Authentication (`/user`)
*   `POST /user/register` - Register a new user
*   `POST /user/login` - Login and receive a JWT token (stored in HTTP-only cookie)
*   `POST /user/logout` - Logout and clear authentication cookie
*   `GET /user/me` - Get current user profile (requires authentication)
*   `DELETE /user/:id` - Delete user account (requires authentication)

### AWS S3 (`/aws`)
*   `POST /aws/presigned-url` - Get a presigned URL for S3 file upload (requires authentication)

### Ingestion (`/ingest`)
*   `POST /ingest/file/completed` - Trigger ingestion after file upload to S3 (requires authentication)
*   `POST /ingest/url/completed` - Ingest content from a URL (requires authentication)
*   `GET /ingest/status/:fileId` - Get ingestion status for a specific file (requires authentication)
*   `DELETE /ingest/delete/:fileId` - Delete a file and its vectors from the system (requires authentication)

### Chat (`/chat`)
*   `POST /chat` - Send a message to the chat and get AI response (requires authentication)
*   `POST /chat/create` - Create a new chat session (requires authentication)
*   `GET /chat/:chatId` - Get conversation history for a specific chat (requires authentication)
*   `PATCH /chat/:id` - Update chat metadata (requires authentication)
*   `DELETE /chat/:id` - Delete a chat conversation (requires authentication)

### Notebooks (`/notebook`)
*   `POST /notebook` - Create a new notebook (requires authentication)
*   `GET /notebook` - List all notebooks for the current user (requires authentication)
*   `GET /notebook/:id` - Get specific notebook content (requires authentication)
*   `PATCH /notebook/:id` - Update notebook details (requires authentication)
*   `DELETE /notebook/:id` - Delete a notebook (requires authentication)

## 📁 Project Structure

```
src/
├── config/         # Configuration files (DB, Logger, etc.)
├── controllers/    # Route controllers
├── knex/           # Database migrations and seeds
├── middleware/     # Express middleware (Auth, etc.)
├── models/         # Database models
├── queues/         # BullMQ queue setup
├── routes/         # API routes
├── services/       # Business logic services
├── utils/          # Utility functions
├── workers/        # Background workers
└── app.js          # App entry point
```
