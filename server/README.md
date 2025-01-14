# Expense Management System

This project is an **Expense Management System** built with Node.js, Express.js, and PostgreSQL. The application allows users to manage their accounts, categories, and transactions with features like authentication, filtering, and summary generation.

---

## Features

### Core Functionalities

- **User Authentication**
  - User registration and login with JWT-based authentication.
- **Account Management**
  - Add, update, delete, and list user accounts.
- **Category Management**
  - Add, update, delete, and list expense categories linked to accounts.
- **Transaction Management**
  - Add transactions with optional categories and accounts.
  - Generate summaries and filter transactions by month, year, account, or category.

### Additional Features

- **Pagination**
  - Retrieve paginated results for transaction listings.
- **Secure Environment**
  - Secrets like JWT keys and database credentials are managed via `.env`.

---

## Tech Stack

### Backend

- **Node.js**
- **Express.js**
- **PostgreSQL**
- **pg** (PostgreSQL client for Node.js)

### Authentication

- **JWT (JSON Web Token)**

---
