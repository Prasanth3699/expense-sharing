# Expense Sharing App (Backend + Frontend)

This project provides a Django REST API for managing shared expenses and a React frontend for interacting with the API. Users can register, log in, create expenses with multiple participants, and download expense data as CSV.

## Features

- **User Authentication with JWT Tokens**
- **Split Expenses**: Equal, Exact, or Percentage
- **View Expense History**
- **Download Expenses as CSV**
- **Modern Frontend UI using React**
- **Secure API Endpoints**

---

## Backend Installation (Django)

### Prerequisites

- Python 3.8+
- pip (Python package manager)
- virtualenv (for creating virtual environments)
- SQLite (Optional, if using PostgreSQL instead of SQLite)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/expense-sharing-api.git
cd expense_sharing
```

### Step 2: Create a Virtual Environment

```bash
python -m venv venv
```

Activate the virtual environment:

- **Windows**:
  ```bash
  venv\Scripts\activate
  ```
- **macOS / Linux**:
  ```bash
  source venv/bin/activate
  ```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Run Migrations

```bash
python manage.py migrate
```

### Step 5: Create a Superuser (Optional)

```bash
python manage.py createsuperuser
```

### Step 6: Run the Development Server

```bash
python manage.py runserver
```

The backend will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Frontend Installation (React)

### Prerequisites

- Node.js (version 14+)
- npm (comes with Node.js)

### Step 1: Navigate to the Frontend Directory

```bash
cd expenses_sharing_frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure API URL

Open `expenses_sharing_frontend/src/services/api.js` and set the backend API base URL:

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Backend API URL
});

export default api;
```

### Step 4: Start the Frontend Server

```bash
npm run dev
```

The React frontend will be available at [http://localhost:5173](http://localhost:5173).

## How to Use the Application

### 1. Register a New User

- **Endpoint**: `POST /api/users/register/`
- **Request Body**:
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "P@ssw0rd_123!",
    "mobile_number": "1234567890"
  }
  ```

### 2. Obtain JWT Token

- **Endpoint**: `POST /api/auth/token/`
- **Request Body**:
  ```json
  {
    "username": "john_doe",
    "password": "P@ssw0rd_123!"
  }
  ```
- **Response**:
  ```json
  {
    "access": "<your_access_token>",
    "refresh": "<your_refresh_token>"
  }
  ```

### 3. Create an Expense

- **Endpoint**: `POST /api/expenses/add/`
- **Headers**:
  ```
  Authorization: Bearer <your_access_token>
  ```
- **Request Body**:
  ```json
  {
    "name": "Lunch",
    "created_by": 1,
    "total_amount": 300.0,
    "split_type": "EQUAL",
    "participants": [{ "user_id": 1, "amount_owed": 150.0 }]
  }
  ```

### 4. Get User Expenses

- **Endpoint**: `GET /api/expenses/user/<user_id>/`
- **Headers**:
  ```
  Authorization: Bearer <your_access_token>
  ```

### 5. Download Latest Expense as CSV

- **Endpoint**: `GET /api/expenses/user/<user_id>/latest/download/`
- **Headers**:
  ```
  Authorization: Bearer <your_access_token>
  ```

## Troubleshooting

### Backend Server Issues:

Ensure migrations are applied with:

```bash
python manage.py migrate
```

### Frontend Issues:

Verify the API URL is correctly set in `expenses_sharing_frontend/src/services/api.js`.

### JWT Authentication Issues:

Ensure the token is included in the request headers:

```
Authorization: Bearer <your_access_token>
```

**Thank You**
