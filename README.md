# Restaurant Analytics System - Anáhauc Oaxaca

A full-stack analytics platform for restaurant reviews, leveraging **Clean Architecture**, **SOLID** principles, and **Machine Learning**.

## 🏗️ Project Architecture

The system is composed of two primary backend services:

1. **/backend-node**: Main API (TypeScript, Express 5, Prisma v7).
2. **/backend-analytics**: Data Science & ML Service (Python, Scikit-learn, Pandas).

## 🚀 Tech Stack

- **Database**: Supabase (PostgreSQL).
- **ORM**: Prisma (Node.js) & SQLAlchemy (Python).
- **ML Engine**: Logistic Regression with TF-IDF vectorization.
- **API**: Express 5 (Native Async Error Handling).

## 📅 Status

- ✅ Domain Layer (Entities & Interfaces)
- ✅ Application Layer (Use Cases & DTOs)
- ✅ Infrastructure Layer (Prisma & Controllers)
- ✅ Analytical Layer (ETL & ML Sentiment)

## 🛠️ Installation

Refer to the **README.md** in each subdirectory for specific service setup.

1. Ensure Postgres/Supabase instance is active.
2. Initialize Node.js dependencies (`npm install` in `backend-node`).
3. Setup Python Virtual Environment (`pip install` in `backend-analytics`).
