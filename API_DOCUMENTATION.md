# Finance API Documentation for Postman

## Base URL
```
http://localhost:4000/api
```

## Authentication
- Most endpoints require Bearer Token authentication
- Token is obtained from the `/auth/login` endpoint
- Pass token in Authorization header: `Authorization: Bearer <token>`
- Tokens are also stored in httpOnly cookies (accessToken, refreshToken)

---

## 1. AUTHENTICATION ENDPOINTS

### 1.1 Bootstrap Register (First Admin Setup)
- **Method:** `POST`
- **Endpoint:** `/auth/register`
- **Description:** Create the first admin user (only available when no admin exists)
- **Authentication:** None
- **Request Headers:**
  ```
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {
    "email": "admin1@gmail.com",
    "password": "AdminPass123@",
    "setupKey": "KTvpYQ9SAHsXk1NG3AkF5lfmUdz8dqdZjqBdjNxkvja"
  }
  ```
- **Validation Rules:**
  - `email`: Valid email format (required)
  - `password`: Minimum 8 characters, maximum 72 characters (required)
  - `setupKey`: Must match ADMIN_SETUP_KEY from environment (required)
- **Response (201 Created):**
  ```json
  {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin1@gmail.com",
      "role": "admin",
      "isActive": true,
      "createdAt": "2026-04-05T10:30:00.000Z",
      "updatedAt": "2026-04-05T10:30:00.000Z"
    }
  }
  ```

---

### 1.2 Login
- **Method:** `POST`
- **Endpoint:** `/auth/login`
- **Description:** Authenticate user and receive access token
- **Authentication:** None
- **Request Headers:**
  ```
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {
    "email": "admin1@gmail.com",
    "password": "AdminPass123@"
  }
  ```
- **Validation Rules:**
  - `email`: Valid email format (required)
  - `password`: Any string (required)
- **Response (200 OK):**
  ```json
  {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin1@gmail.com",
      "role": "admin",
      "isActive": true,
      "createdAt": "2026-04-05T10:30:00.000Z",
      "updatedAt": "2026-04-05T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Cookies Set (HttpOnly):**
  - `accessToken` (expires in 15 minutes)
  - `refreshToken` (expires in 7 days)

---

### 1.3 Bootstrap Status
- **Method:** `GET`
- **Endpoint:** `/auth/bootstrap-status`
- **Description:** Check if bootstrap admin registration is available
- **Authentication:** None
- **Response (200 OK):**
  ```json
  {
    "isBootstrapAvailable": true
  }
  ```

---

### 1.4 Refresh Token
- **Method:** `POST`
- **Endpoint:** `/auth/refresh`
- **Description:** Rotate refresh token and issue new access token
- **Authentication:** None (uses cookie or body)
- **Request Headers:**
  ```
  Content-Type: application/json
  ```
- **Request Body (Optional - if not using cookie):**
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin1@gmail.com",
      "role": "admin",
      "isActive": true,
      "createdAt": "2026-04-05T10:30:00.000Z",
      "updatedAt": "2026-04-05T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

### 1.5 Logout
- **Method:** `POST`
- **Endpoint:** `/auth/logout`
- **Description:** Logout current user and invalidate refresh token
- **Authentication:** Required (Bearer Token)
- **Request Headers:**
  ```
  Authorization: Bearer <accessToken>
  Content-Type: application/json
  ```
- **Request Body:** `{}` (empty)
- **Response (200 OK):**
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

---

## 2. USER MANAGEMENT ENDPOINTS

### 2.1 List Users (Paginated)
- **Method:** `GET`
- **Endpoint:** `/users`
- **Description:** Get list of all users with pagination (Admin only)
- **Authentication:** Required (Bearer Token)
- **Required Role:** `admin`
- **Request Headers:**
  ```
  Authorization: Bearer <accessToken>
  ```
- **Query Parameters:**
  ```
  limit: number (1-100, default: 20)
  offset: number (minimum 0, default: 0)
  ```
- **Example Request:**
  ```
  GET /users?limit=20&offset=0
  ```
- **Response (200 OK):**
  ```json
  {
    "items": [
      {
        "id": "507f1f77bcf86cd799439011",
        "email": "admin1@gmail.com",
        "role": "admin",
        "isActive": true,
        "createdAt": "2026-04-05T10:30:00.000Z",
        "updatedAt": "2026-04-05T10:30:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439012",
        "email": "analyst1@gmail.com",
        "role": "analyst",
        "isActive": true,
        "createdAt": "2026-04-05T10:31:00.000Z",
        "updatedAt": "2026-04-05T10:31:00.000Z"
      }
    ],
    "total": 2,
    "limit": 20,
    "offset": 0
  }
  ```

---

### 2.2 Create User
- **Method:** `POST`
- **Endpoint:** `/users`
- **Description:** Create a new user (Admin only)
- **Authentication:** Required (Bearer Token)
- **Required Role:** `admin`
- **Request Headers:**
  ```
  Authorization: Bearer <accessToken>
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {
    "email": "analyst1@gmail.com",
    "password": "AnalystPass123@",
    "role": "analyst",
    "isActive": true
  }
  ```
- **Validation Rules:**
  - `email`: Valid email format, must be unique (required)
  - `password`: Minimum 8 characters, maximum 72 characters (required)
  - `role`: One of `viewer`, `analyst`, `admin` (required)
  - `isActive`: Boolean (optional, default: true)
- **Response (201 Created):**
  ```json
  {
    "id": "507f1f77bcf86cd799439013",
    "email": "analyst1@gmail.com",
    "role": "analyst",
    "isActive": true,
    "createdAt": "2026-04-05T10:32:00.000Z",
    "updatedAt": "2026-04-05T10:32:00.000Z"
  }
  ```

---

### 2.3 Update User
- **Method:** `PUT`
- **Endpoint:** `/users/{id}`
- **Description:** Update user details (Admin only)
- **Authentication:** Required (Bearer Token)
- **Required Role:** `admin`
- **Request Headers:**
  ```
  Authorization: Bearer <accessToken>
  Content-Type: application/json
  ```
- **URL Parameters:**
  ```
  id: MongoDB ObjectId (24-character hex string)
  ```
- **Request Body (at least one field required):**
  ```json
  {
    "email": "newemail@gmail.com",
    "password": "NewPassword123@",
    "role": "admin",
    "isActive": false
  }
  ```
- **Validation Rules:**
  - `email`: Valid email format, must be unique (optional)
  - `password`: Minimum 8 characters, maximum 72 characters (optional)
  - `role`: One of `viewer`, `analyst`, `admin` (optional)
  - `isActive`: Boolean (optional)
  - At least one field must be provided
- **Response (200 OK):**
  ```json
  {
    "id": "507f1f77bcf86cd799439013",
    "email": "newemail@gmail.com",
    "role": "admin",
    "isActive": false,
    "createdAt": "2026-04-05T10:32:00.000Z",
    "updatedAt": "2026-04-05T10:35:00.000Z"
  }
  ```

---

### 2.4 Delete User (Soft Delete)
- **Method:** `DELETE`
- **Endpoint:** `/users/{id}`
- **Description:** Soft delete a user (mark as inactive)
- **Authentication:** Required (Bearer Token)
- **Required Role:** `admin`
- **Request Headers:**
  ```
  Authorization: Bearer <accessToken>
  ```
- **URL Parameters:**
  ```
  id: MongoDB ObjectId (24-character hex string)
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "507f1f77bcf86cd799439013",
    "email": "analyst1@gmail.com",
    "role": "analyst",
    "isActive": false,
    "createdAt": "2026-04-05T10:32:00.000Z",
    "updatedAt": "2026-04-05T10:36:00.000Z"
  }
  ```

---

## 3. RECORD MANAGEMENT ENDPOINTS

### 3.1 List Records (With Filters)
- **Method:** `GET`
- **Endpoint:** `/records`
- **Description:** Get list of records with filtering options (Analyst/Admin)
- **Authentication:** Required (Bearer Token)
- **Allowed Roles:** `analyst`, `admin`
- **Request Headers:**
  ```
  Authorization: Bearer <accessToken>
  ```
- **Query Parameters:**
  ```
  type: string (optional - "income" or "expense")
  category: string (optional - category name)
  date: ISO date string (optional - exact date match)
  dateFrom: ISO date string (optional - start of date range)
  dateTo: ISO date string (optional - end of date range)
  search: string (optional - search in notes/category)
  limit: number (1-100, default: 20)
  offset: number (minimum 0, default: 0)
  ```
- **Example Request:**
  ```
  GET /records?type=income&category=Salary&dateFrom=2026-01-01&dateTo=2026-04-05&limit=20&offset=0
  ```
- **Response (200 OK):**
  ```json
  {
    "items": [
      {
        "id": "507f1f77bcf86cd799439020",
        "amount": 5000,
        "type": "income",
        "category": "Salary",
        "date": "2026-04-01T00:00:00.000Z",
        "notes": "Monthly salary",
        "createdBy": {
          "id": "507f1f77bcf86cd799439011",
          "email": "admin1@gmail.com",
          "role": "admin"
        },
        "createdAt": "2026-04-05T10:40:00.000Z",
        "updatedAt": "2026-04-05T10:40:00.000Z"
      }
    ],
    "total": 1,
    "limit": 20,
    "offset": 0
  }
  ```

---

### 3.2 Get Single Record
- **Method:** `GET`
- **Endpoint:** `/records/{id}`
- **Description:** Get a single record by ID (Analyst/Admin)
- **Authentication:** Required (Bearer Token)
- **Allowed Roles:** `analyst`, `admin`
- **Request Headers:**
  ```
  Authorization: Bearer <accessToken>
  ```
- **URL Parameters:**
  ```
  id: MongoDB ObjectId (24-character hex string)
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "507f1f77bcf86cd799439020",
    "amount": 5000,
    "type": "income",
    "category": "Salary",
    "date": "2026-04-01T00:00:00.000Z",
    "notes": "Monthly salary",
    "createdBy": {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin1@gmail.com",
      "role": "admin"
    },
    "createdAt": "2026-04-05T10:40:00.000Z",
    "updatedAt": "2026-04-05T10:40:00.000Z"
  }
  ```

---

### 3.3 Create Record
- **Method:** `POST`
- **Endpoint:** `/records`
- **Description:** Create a new financial record (Admin only)
- **Authentication:** Required (Bearer Token)
- **Required Role:** `admin`
- **Request Headers:**
  ```
  Authorization: Bearer <accessToken>
  Content-Type: application/json
  ```
- **Request Body:**
  ```json
  {
    "amount": 5000,
    "type": "income",
    "category": "Salary",
    "date": "2026-04-01T00:00:00Z",
    "notes": "Monthly salary payment",
    "createdBy": "507f1f77bcf86cd799439011"
  }
  ```
- **Validation Rules:**
  - `amount`: Positive number (required)
  - `type`: One of `income`, `expense` (required)
  - `category`: String, minimum 1 character, maximum 100 characters (required)
  - `date`: ISO 8601 format date string (required)
  - `notes`: String, maximum 1000 characters, can be empty (optional, default: "")
  - `createdBy`: MongoDB ObjectId (24-character hex string) (optional)
- **Response (201 Created):**
  ```json
  {
    "id": "507f1f77bcf86cd799439020",
    "amount": 5000,
    "type": "income",
    "category": "Salary",
    "date": "2026-04-01T00:00:00.000Z",
    "notes": "Monthly salary payment",
    "createdBy": "507f1f77bcf86cd799439011",
    "createdAt": "2026-04-05T10:40:00.000Z",
    "updatedAt": "2026-04-05T10:40:00.000Z"
  }
  ```

---

### 3.4 Update Record
- **Method:** `PUT`
- **Endpoint:** `/records/{id}`
- **Description:** Update a record (Admin only)
- **Authentication:** Required (Bearer Token)
- **Required Role:** `admin`
- **Request Headers:**
  ```
  Authorization: Bearer <accessToken>
  Content-Type: application/json
  ```
- **URL Parameters:**
  ```
  id: MongoDB ObjectId (24-character hex string)
  ```
- **Request Body (at least one field required):**
  ```json
  {
    "amount": 5500,
    "type": "income",
    "category": "Bonus",
    "date": "2026-04-02T00:00:00Z",
    "notes": "Updated monthly salary"
  }
  ```
- **Validation Rules:**
  - `amount`: Positive number (optional)
  - `type`: One of `income`, `expense` (optional)
  - `category`: String, minimum 1 character, maximum 100 characters (optional)
  - `date`: ISO 8601 format date string (optional)
  - `notes`: String, maximum 1000 characters, can be empty (optional)
  - At least one field must be provided
- **Response (200 OK):**
  ```json
  {
    "id": "507f1f77bcf86cd799439020",
    "amount": 5500,
    "type": "income",
    "category": "Bonus",
    "date": "2026-04-02T00:00:00.000Z",
    "notes": "Updated monthly salary",
    "createdBy": "507f1f77bcf86cd799439011",
    "createdAt": "2026-04-05T10:40:00.000Z",
    "updatedAt": "2026-04-05T10:45:00.000Z"
  }
  ```

---

### 3.5 Delete Record (Soft Delete)
- **Method:** `DELETE`
- **Endpoint:** `/records/{id}`
- **Description:** Soft delete a record (Admin only)
- **Authentication:** Required (Bearer Token)
- **Required Role:** `admin`
- **Request Headers:**
  ```
  Authorization: Bearer <accessToken>
  ```
- **URL Parameters:**
  ```
  id: MongoDB ObjectId (24-character hex string)
  ```
- **Response (200 OK):**
  ```json
  {
    "id": "507f1f77bcf86cd799439020",
    "amount": 5500,
    "type": "income",
    "category": "Bonus",
    "date": "2026-04-02T00:00:00.000Z",
    "notes": "Updated monthly salary",
    "createdBy": "507f1f77bcf86cd799439011",
    "createdAt": "2026-04-05T10:40:00.000Z",
    "updatedAt": "2026-04-05T10:50:00.000Z"
  }
  ```

---

## 4. DASHBOARD ENDPOINTS

### 4.1 Get Dashboard Summary
- **Method:** `GET`
- **Endpoint:** `/dashboard/summary`
- **Description:** Get financial summary with totals, category breakdown, and recent activity (Viewer/Analyst/Admin)
- **Authentication:** Required (Bearer Token)
- **Allowed Roles:** `viewer`, `analyst`, `admin`
- **Request Headers:**
  ```
  Authorization: Bearer <accessToken>
  ```
- **Query Parameters:**
  ```
  dateFrom: ISO date string (optional - start of date range)
  dateTo: ISO date string (optional - end of date range)
  ```
- **Example Request:**
  ```
  GET /dashboard/summary?dateFrom=2026-01-01&dateTo=2026-04-05
  ```
- **Response (200 OK):**
  ```json
  {
    "totalIncome": 10000,
    "totalExpenses": 3500,
    "netBalance": 6500,
    "categoryTotals": [
      {
        "category": "Salary",
        "total": 10000
      },
      {
        "category": "Groceries",
        "total": 1500
      },
      {
        "category": "Utilities",
        "total": 2000
      }
    ],
    "recentActivity": [
      {
        "id": "507f1f77bcf86cd799439025",
        "amount": 2000,
        "type": "expense",
        "category": "Utilities",
        "date": "2026-04-05T00:00:00.000Z",
        "notes": "Electricity and water bill",
        "createdBy": {
          "id": "507f1f77bcf86cd799439011",
          "email": "admin1@gmail.com",
          "role": "admin"
        },
        "createdAt": "2026-04-05T10:50:00.000Z",
        "updatedAt": "2026-04-05T10:50:00.000Z"
      }
    ]
  }
  ```

---

### 4.2 Get Dashboard Trends
- **Method:** `GET`
- **Endpoint:** `/dashboard/trends`
- **Description:** Get monthly income/expense trends (Viewer/Analyst/Admin)
- **Authentication:** Required (Bearer Token)
- **Allowed Roles:** `viewer`, `analyst`, `admin`
- **Request Headers:**
  ```
  Authorization: Bearer <accessToken>
  ```
- **Query Parameters:**
  ```
  dateFrom: ISO date string (optional - start of date range)
  dateTo: ISO date string (optional - end of date range)
  ```
- **Example Request:**
  ```
  GET /dashboard/trends?dateFrom=2026-01-01&dateTo=2026-04-05
  ```
- **Response (200 OK):**
  ```json
  {
    "trends": [
      {
        "period": "2026-01",
        "income": 5000,
        "expense": 1500,
        "net": 3500
      },
      {
        "period": "2026-02",
        "income": 5000,
        "expense": 2000,
        "net": 3000
      },
      {
        "period": "2026-04",
        "income": 0,
        "expense": 0,
        "net": 0
      }
    ]
  }
  ```

---

## 5. ERROR RESPONSES

All endpoints may return the following error responses:

### 400 Bad Request
- Invalid request body or query parameters
```json
{
  "message": "Validation error description",
  "statusCode": 400
}
```

### 401 Unauthorized
- Missing or invalid authentication token
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 403 Forbidden
- User lacks required permissions/role
```json
{
  "message": "Forbidden - insufficient permissions",
  "statusCode": 403
}
```

### 404 Not Found
- Resource not found
```json
{
  "message": "Resource not found",
  "statusCode": 404
}
```

### 500 Internal Server Error
- Server-side error
```json
{
  "message": "Internal server error",
  "statusCode": 500
}
```

---

## 6. ROLE-BASED ACCESS CONTROL

| Endpoint | Admin | Analyst | Viewer |
|----------|-------|---------|--------|
| `POST /auth/register` | ✓ (bootstrap only) | ✗ | ✗ |
| `POST /auth/login` | ✓ | ✓ | ✓ |
| `GET /auth/bootstrap-status` | ✓ | ✓ | ✓ |
| `POST /auth/refresh` | ✓ | ✓ | ✓ |
| `POST /auth/logout` | ✓ | ✓ | ✓ |
| `GET /users` | ✓ | ✗ | ✗ |
| `POST /users` | ✓ | ✗ | ✗ |
| `PUT /users/{id}` | ✓ | ✗ | ✗ |
| `DELETE /users/{id}` | ✓ | ✗ | ✗ |
| `GET /records` | ✓ | ✓ | ✗ |
| `POST /records` | ✓ | ✗ | ✗ |
| `GET /records/{id}` | ✓ | ✓ | ✗ |
| `PUT /records/{id}` | ✓ | ✗ | ✗ |
| `DELETE /records/{id}` | ✓ | ✗ | ✗ |
| `GET /dashboard/summary` | ✓ | ✓ | ✓ |
| `GET /dashboard/trends` | ✓ | ✓ | ✓ |

---

## 7. AUTHENTICATION FLOW

1. **Initial Setup:**
   - Check bootstrap status: `GET /auth/bootstrap-status`
   - Register first admin: `POST /auth/register`

2. **User Login:**
   - Send credentials: `POST /auth/login`
   - Receive `accessToken` and `refreshToken`
   - Tokens also stored in httpOnly cookies

3. **Using Protected Endpoints:**
   - Include `Authorization: Bearer <accessToken>` in header
   - Or rely on cookie-based authentication (if on same domain)

4. **Token Refresh:**
   - When access token expires (15 minutes):
   - Call: `POST /auth/refresh`
   - Receive new tokens

5. **Logout:**
   - Call: `POST /auth/logout`
   - Tokens are invalidated on server

---

## 8. POSTMAN ENVIRONMENT VARIABLES SETUP

Create these variables for easy API testing:

```
baseUrl: http://localhost:4000/api
accessToken: <token obtained from login>
refreshToken: <refresh token obtained from login>
userId: <user id for testing>
recordId: <record id for testing>
adminSetupKey: KTvpYQ9SAHsXk1NG3AkF5lfmUdz8dqdZjqBdjNxkvja
```

Use in requests like: `{{baseUrl}}/users` and `Authorization: Bearer {{accessToken}}`

