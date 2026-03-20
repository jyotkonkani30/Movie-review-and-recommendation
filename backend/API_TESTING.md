# 🧪 API Testing Guide

## Quick Test Commands (Using curl)

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

Expected Response:
```json
{
  "success": true,
  "message": "Cineverse API is running",
  "timestamp": "2025-12-31T12:00:00.000Z"
}
```

---

### 2. Sign Up (Register New User)

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "phone": "1234567890",
    "username": "johndoe",
    "password": "password123"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "john@example.com",
    "phone": "1234567890",
    "username": "johndoe",
    "createdAt": "..."
  }
}
```

**Save the token!** You'll need it for protected routes.

---

### 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Expected Response: Same as signup

---

### 4. Get Current User (Protected)

Replace `<YOUR_TOKEN>` with the token from signup/login:

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

Expected Response:
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "john@example.com",
    "phone": "1234567890",
    "username": "johndoe",
    "createdAt": "..."
  }
}
```

---

### 5. Get User Movie Interactions (Protected)

```bash
curl -X GET http://localhost:5000/api/movies/interactions \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "bucketList": [],
    "watchedMovies": [],
    "ratings": [],
    "likedMovies": []
  }
}
```

---

### 6. Add Movie to Bucket List (Protected)

```bash
curl -X POST http://localhost:5000/api/movies/bucket-list \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "movieId": 550,
    "title": "Fight Club",
    "posterPath": "/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg"
  }'
```

---

### 7. Mark Movie as Watched (Protected)

```bash
curl -X POST http://localhost:5000/api/movies/watched \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "movieId": 550,
    "title": "Fight Club",
    "posterPath": "/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg"
  }'
```

---

### 8. Rate a Movie (Protected)

```bash
curl -X POST http://localhost:5000/api/movies/rate \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "movieId": 550,
    "title": "Fight Club",
    "posterPath": "/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg",
    "rating": 5
  }'
```

---

### 9. Like a Movie (Protected)

```bash
curl -X POST http://localhost:5000/api/movies/like \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "movieId": 550,
    "title": "Fight Club",
    "posterPath": "/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg"
  }'
```

---

### 10. Remove from Bucket List (Protected)

```bash
curl -X DELETE http://localhost:5000/api/movies/bucket-list/550 \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

### 11. Remove Rating (Protected)

```bash
curl -X DELETE http://localhost:5000/api/movies/rate/550 \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

### 12. Unlike Movie (Protected)

```bash
curl -X DELETE http://localhost:5000/api/movies/like/550 \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

### 13. Logout (Protected)

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

---

## Testing Error Cases

### Invalid Email Format
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "notanemail",
    "phone": "1234567890",
    "username": "testuser",
    "password": "password123"
  }'
```

Expected: Validation error

### Invalid Phone Number
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "123",
    "username": "testuser",
    "password": "password123"
  }'
```

Expected: Validation error (must be 10 digits)

### Wrong Password
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "wrongpassword"
  }'
```

Expected: 401 Unauthorized

### No Token (Protected Route)
```bash
curl -X GET http://localhost:5000/api/auth/me
```

Expected: 401 Unauthorized

### Invalid Token
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer invalid_token_here"
```

Expected: 401 Unauthorized

---

## Using Postman

### 1. Import Collection

Create a new collection in Postman with these requests:

**Collection Variables:**
- `baseUrl`: `http://localhost:5000/api`
- `token`: (will be set automatically)

### 2. Setup Auth Requests

**Signup:**
- Method: POST
- URL: `{{baseUrl}}/auth/signup`
- Body (JSON):
```json
{
  "email": "test@example.com",
  "phone": "1234567890",
  "username": "testuser",
  "password": "password123"
}
```
- Tests (to save token):
```javascript
if (pm.response.code === 201) {
  pm.collectionVariables.set("token", pm.response.json().token);
}
```

**Login:**
- Same as signup but URL: `{{baseUrl}}/auth/login`
- Only needs email and password

### 3. Setup Protected Requests

For all protected endpoints:
- Authorization: Bearer Token
- Token: `{{token}}`

---

## Using VSCode REST Client Extension

Install the "REST Client" extension, then create a file `api-tests.http`:

```http
@baseUrl = http://localhost:5000/api
@token = your_token_here

### Health Check
GET {{baseUrl}}/health

### Signup
POST {{baseUrl}}/auth/signup
Content-Type: application/json

{
  "email": "test@example.com",
  "phone": "1234567890",
  "username": "testuser",
  "password": "password123"
}

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

### Get Current User
GET {{baseUrl}}/auth/me
Authorization: Bearer {{token}}

### Add to Bucket List
POST {{baseUrl}}/movies/bucket-list
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "movieId": 550,
  "title": "Fight Club",
  "posterPath": "/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg"
}
```

---

## Expected Status Codes

- `200` - Success (GET, DELETE)
- `201` - Created (POST signup)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing Workflow

1. **Start Backend**: `cd backend && npm run dev`
2. **Test Health**: Verify server is running
3. **Signup**: Create a test user, save token
4. **Login**: Test login works
5. **Get User**: Verify token authentication
6. **Movie Actions**: Test all CRUD operations
7. **Error Cases**: Test validation and auth errors
8. **Logout**: Clear session

---

## Debugging Tips

### Check Server Logs
The terminal running `npm run dev` will show:
- Request method and path
- Any errors
- Database connection status

### Common Issues

**401 Unauthorized:**
- Token missing or malformed
- Token expired (7 days)
- Wrong Authorization header format

**400 Bad Request:**
- Missing required fields
- Invalid data format
- Validation errors

**500 Internal Server Error:**
- Check server logs
- Usually database connection issues

---

## Browser Testing

You can also test from browser console:

```javascript
// Signup
fetch('http://localhost:5000/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    phone: '1234567890',
    username: 'testuser',
    password: 'password123'
  })
})
.then(r => r.json())
.then(data => {
  console.log(data);
  // Save token
  localStorage.setItem('token', data.token);
});

// Get user (protected)
fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(console.log);
```

---

**Happy Testing! 🧪✨**
