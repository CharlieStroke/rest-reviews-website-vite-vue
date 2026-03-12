# Restaurant Analytics - Node.js Backend

Professional Node.js API built with **TypeScript**, **Express 5**, and **Clean Architecture**. This service acts as the orchestrator for the entire platform.

---

## 🏗️ Architectural Layers

Inspired by Uncle Bob's Clean Architecture, this module is strictly decoupled:

-   **Domain**: Entitites and Repository Interfaces. Zero dependencies on external frameworks.
-   **Application**: Use Cases that implement the business logic. 
-   **Infrastructure**: Technical implementations.
    -   `repositories/`: Prisma-based data access.
    -   `services/`: External integrations (Supabase Storage, Python Analytics).
    -   `http/`: Controllers, Routes, and Middleware.

---

## 🚀 Key Features

### Engineering Excellence
-   **Express 5**: Native async error handling, removing the need for `try/catch` wrapper in controllers.
-   **Prisma v7**: High-performance Type-Safe ORM connected to Supabase.
-   **Dependency Injection**: Managed via `tsyringe` for better testability and decoupled services.

### Security
-   **RBAC**: Role-Based Access Control for Managers and Users.
-   **Password Hashing**: State-of-the-art **Argon2id** algorithm.
-   **Validation**: Robust input validation using **Zod**.

---

## 🛠️ Installation & Setup

1.  **Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file from `.env.example`:
    - `DATABASE_URL`: Your Supabase/PostgreSQL connection string.
    - `JWT_SECRET`: Secret for signing tokens.
    - `SUPABASE_URL` / `SUPABASE_KEY`: For bucket storage.

3.  **Database Migration**:
    ```bash
    npx prisma db push
    ```

4.  **Run Development**:
    ```bash
    npm run dev
    ```

---

## 📜 Available Scripts

-   `npm run dev`: Starts the server with `ts-node-dev`.
-   `npm run build`: Compiles TypeScript to `dist/`.
-   `npm run prisma:generate`: Updates the Prisma client types.
-   `npm run prisma:push`: Pushes schema changes to the DB without migrations.

---

## 📊 Analytics Integration
This service communicates with the Python Analytics module by spawning a child process. It captures the standard output, parses the JSON results, and returns formatted metrics to the client.
