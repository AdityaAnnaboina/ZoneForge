# FastAPI Backend API Reference

This document outlines the API endpoints, sample request/response structures, and `curl` command examples to verify the backend behavior.

---

## Authentication Endpoints

### 1. User Login
- **Endpoint**: `POST /api/auth/login`
- **Authentication Required**: No
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Response Body (`200 OK`)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "username": "admin"
  }
  ```
- **Verify using `curl`**:
  ```bash
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "admin123"}'
  ```

### 2. User Logout
- **Endpoint**: `POST /api/auth/logout`
- **Authentication Required**: Yes (`Bearer <token>`)
- **Response Body (`200 OK`)**:
  ```json
  {
    "message": "Successfully logged out"
  }
  ```
- **Verify using `curl`**:
  ```bash
  curl -X POST http://localhost:8000/api/auth/logout \
    -H "Authorization: Bearer <your_token_here>"
  ```

### 3. Fetch Self profile info
- **Endpoint**: `GET /api/auth/me`
- **Authentication Required**: Yes (`Bearer <token>`)
- **Response Body (`200 OK`)**:
  ```json
  {
    "id": 1,
    "username": "admin",
    "created_at": "2026-06-27T10:30:00Z"
  }
  ```
- **Verify using `curl`**:
  ```bash
  curl -X GET http://localhost:8000/api/auth/me \
    -H "Authorization: Bearer <your_token_here>"
  ```

---

## Hosted Zones Endpoints

### 1. List Hosted Zones
- **Endpoint**: `GET /api/hosted-zones`
- **Query Parameters**:
  - `search` (string, optional): Query match filter by domain name
  - `type_filter` (string, optional): `"Public"` or `"Private"`
  - `page` (int, default=1)
  - `page_size` (int, default=20)
- **Response Body (`200 OK`)**:
  ```json
  {
    "items": [
      {
        "id": "7fa8bb86-d2bc-44fa-90f7-1845bb08f2ad",
        "name": "example.com.",
        "type": "Public",
        "comment": "Main internet zone",
        "record_count": 5,
        "created_at": "2026-06-27T10:30:00Z",
        "updated_at": "2026-06-27T10:30:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 20,
    "total_pages": 1
  }
  ```
- **Verify using `curl`**:
  ```bash
  curl -X GET "http://localhost:8000/api/hosted-zones?search=example&page=1&page_size=20" \
    -H "Authorization: Bearer <your_token_here>"
  ```

### 2. Fetch Hosted Zone by ID
- **Endpoint**: `GET /api/hosted-zones/{id}`
- **Response Body (`200 OK`)**:
  ```json
  {
    "id": "7fa8bb86-d2bc-44fa-90f7-1845bb08f2ad",
    "name": "example.com.",
    "type": "Public",
    "comment": "Main internet zone",
    "record_count": 5,
    "created_at": "2026-06-27T10:30:00Z",
    "updated_at": "2026-06-27T10:30:00Z"
  }
  ```
- **Verify using `curl`**:
  ```bash
  curl -X GET http://localhost:8000/api/hosted-zones/7fa8bb86-d2bc-44fa-90f7-1845bb08f2ad \
    -H "Authorization: Bearer <your_token_here>"
  ```

### 3. Create Hosted Zone
- **Endpoint**: `POST /api/hosted-zones`
- **Request Body**:
  ```json
  {
    "name": "newzone.org",
    "type": "Public",
    "comment": "New organization zone"
  }
  ```
- **Response Body (`201 Created`)**:
  ```json
  {
    "id": "3bb89c12-ef5a-4933-9121-a3f290d238cb",
    "name": "newzone.org.",
    "type": "Public",
    "comment": "New organization zone",
    "record_count": 0,
    "created_at": "2026-06-27T10:45:00Z",
    "updated_at": "2026-06-27T10:45:00Z"
  }
  ```
- **Verify using `curl`**:
  ```bash
  curl -X POST http://localhost:8000/api/hosted-zones \
    -H "Authorization: Bearer <your_token_here>" \
    -H "Content-Type: application/json" \
    -d '{"name": "newzone.org", "type": "Public", "comment": "New organization zone"}'
  ```

### 4. Update Hosted Zone
- **Endpoint**: `PUT /api/hosted-zones/{id}`
- **Request Body**:
  ```json
  {
    "type": "Private",
    "comment": "Updated comments describing zone usage"
  }
  ```
- **Response Body (`200 OK`)**:
  ```json
  {
    "id": "3bb89c12-ef5a-4933-9121-a3f290d238cb",
    "name": "newzone.org.",
    "type": "Private",
    "comment": "Updated comments describing zone usage",
    "record_count": 0,
    "created_at": "2026-06-27T10:45:00Z",
    "updated_at": "2026-06-27T10:50:00Z"
  }
  ```
- **Verify using `curl`**:
  ```bash
  curl -X PUT http://localhost:8000/api/hosted-zones/3bb89c12-ef5a-4933-9121-a3f290d238cb \
    -H "Authorization: Bearer <your_token_here>" \
    -H "Content-Type: application/json" \
    -d '{"type": "Private", "comment": "Updated comments describing zone usage"}'
  ```

### 5. Delete Hosted Zone
- **Endpoint**: `DELETE /api/hosted-zones/{id}`
- **Response Body (`204 No Content`)**: Empty body
- **Verify using `curl`**:
  ```bash
  curl -X DELETE http://localhost:8000/api/hosted-zones/3bb89c12-ef5a-4933-9121-a3f290d238cb \
    -H "Authorization: Bearer <your_token_here>"
  ```

---

## DNS Records Endpoints

### 1. List DNS Records
- **Endpoint**: `GET /api/hosted-zones/{zone_id}/records`
- **Query Parameters**:
  - `search` (string, optional): Query match filter by record name
  - `type_filter` (string, optional): Record type (`A`, `CNAME`, etc.)
  - `page` (int, default=1)
  - `page_size` (int, default=20)
- **Response Body (`200 OK`)**:
  ```json
  {
    "items": [
      {
        "id": "e9324fae-3ba2-40f4-90a8-bcf9032adcf3",
        "hosted_zone_id": "7fa8bb86-d2bc-44fa-90f7-1845bb08f2ad",
        "name": "www",
        "type": "A",
        "ttl": 300,
        "value": "192.168.1.1",
        "routing_policy": "Simple",
        "comment": "Main landing page IP",
        "created_at": "2026-06-27T10:30:00Z",
        "updated_at": "2026-06-27T10:30:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 20,
    "total_pages": 1
  }
  ```
- **Verify using `curl`**:
  ```bash
  curl -X GET "http://localhost:8000/api/hosted-zones/7fa8bb86-d2bc-44fa-90f7-1845bb08f2ad/records?search=www" \
    -H "Authorization: Bearer <your_token_here>"
  ```

### 2. Fetch DNS Record Details
- **Endpoint**: `GET /api/hosted-zones/{zone_id}/records/{id}`
- **Response Body (`200 OK`)**:
  ```json
  {
    "id": "e9324fae-3ba2-40f4-90a8-bcf9032adcf3",
    "hosted_zone_id": "7fa8bb86-d2bc-44fa-90f7-1845bb08f2ad",
    "name": "www",
    "type": "A",
    "ttl": 300,
    "value": "192.168.1.1",
    "routing_policy": "Simple",
    "comment": "Main landing page IP",
    "created_at": "2026-06-27T10:30:00Z",
    "updated_at": "2026-06-27T10:30:00Z"
  }
  ```
- **Verify using `curl`**:
  ```bash
  curl -X GET http://localhost:8000/api/hosted-zones/7fa8bb86-d2bc-44fa-90f7-1845bb08f2ad/records/e9324fae-3ba2-40f4-90a8-bcf9032adcf3 \
    -H "Authorization: Bearer <your_token_here>"
  ```

### 3. Create DNS Record
- **Endpoint**: `POST /api/hosted-zones/{zone_id}/records`
- **Request Body**:
  ```json
  {
    "name": "blog",
    "type": "CNAME",
    "ttl": 3600,
    "value": "ghs.google.com.",
    "routing_policy": "Simple",
    "comment": "Blog redirection CNAME"
  }
  ```
- **Response Body (`201 Created`)**:
  ```json
  {
    "id": "2fa09bb3-2e3d-4951-bdfc-a19cd00f2ad3",
    "hosted_zone_id": "7fa8bb86-d2bc-44fa-90f7-1845bb08f2ad",
    "name": "blog",
    "type": "CNAME",
    "ttl": 3600,
    "value": "ghs.google.com.",
    "routing_policy": "Simple",
    "comment": "Blog redirection CNAME",
    "created_at": "2026-06-27T11:00:00Z",
    "updated_at": "2026-06-27T11:00:00Z"
  }
  ```
- **Verify using `curl`**:
  ```bash
  curl -X POST http://localhost:8000/api/hosted-zones/7fa8bb86-d2bc-44fa-90f7-1845bb08f2ad/records \
    -H "Authorization: Bearer <your_token_here>" \
    -H "Content-Type: application/json" \
    -d '{"name": "blog", "type": "CNAME", "ttl": 3600, "value": "ghs.google.com.", "routing_policy": "Simple", "comment": "Blog redirection CNAME"}'
  ```

### 4. Update DNS Record
- **Endpoint**: `PUT /api/hosted-zones/{zone_id}/records/{id}`
- **Request Body**:
  ```json
  {
    "name": "blog-updated",
    "ttl": 300,
    "value": "ghs.google.com.",
    "routing_policy": "Simple",
    "comment": "Updated CNAME comment"
  }
  ```
- **Response Body (`200 OK`)**:
  ```json
  {
    "id": "2fa09bb3-2e3d-4951-bdfc-a19cd00f2ad3",
    "hosted_zone_id": "7fa8bb86-d2bc-44fa-90f7-1845bb08f2ad",
    "name": "blog-updated",
    "type": "CNAME",
    "ttl": 300,
    "value": "ghs.google.com.",
    "routing_policy": "Simple",
    "comment": "Updated CNAME comment",
    "created_at": "2026-06-27T11:00:00Z",
    "updated_at": "2026-06-27T11:10:00Z"
  }
  ```
- **Verify using `curl`**:
  ```bash
  curl -X PUT http://localhost:8000/api/hosted-zones/7fa8bb86-d2bc-44fa-90f7-1845bb08f2ad/records/2fa09bb3-2e3d-4951-bdfc-a19cd00f2ad3 \
    -H "Authorization: Bearer <your_token_here>" \
    -H "Content-Type: application/json" \
    -d '{"name": "blog-updated", "ttl": 300, "value": "ghs.google.com.", "routing_policy": "Simple", "comment": "Updated CNAME comment"}'
  ```

### 5. Delete DNS Record
- **Endpoint**: `DELETE /api/hosted-zones/{zone_id}/records/{id}`
- **Response Body (`204 No Content`)**: Empty body
- **Verify using `curl`**:
  ```bash
  curl -X DELETE http://localhost:8000/api/hosted-zones/7fa8bb86-d2bc-44fa-90f7-1845bb08f2ad/records/2fa09bb3-2e3d-4951-bdfc-a19cd00f2ad3 \
    -H "Authorization: Bearer <your_token_here>"
  ```
