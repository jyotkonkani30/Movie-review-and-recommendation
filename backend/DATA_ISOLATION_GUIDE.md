# 🔒 User Data Isolation Guide

## ⚠️ CRITICAL SECURITY PRINCIPLE

**ONE USER MUST NEVER SEE OR AFFECT ANOTHER USER'S DATA**

This document explains how complete data isolation is enforced in the Cineverse backend.

---

## 🛡️ Security Architecture

### 1. **JWT-Based Authentication**

All protected routes require a valid JWT token:

```javascript
// Authorization header required
Authorization: Bearer <token>
```

**Process:**
1. User logs in → receives JWT with userId embedded
2. Frontend stores JWT in localStorage
3. Every API request includes JWT in Authorization header
4. Backend verifies JWT and extracts userId
5. **NEVER trust userId from request body** - always use `req.user.id`

---

### 2. **Two-Layer Data Model**

#### **Option A: Array-Based Model (MovieInteraction)**
- One document per user
- Arrays for bucketList, watchedMovies, ratings, likedMovies
- Good for simple operations

#### **Option B: Document-Per-Interaction Model (IndividualMovieInteraction) ⭐ RECOMMENDED**
- Separate document for each user-movie pair
- Compound unique index: `{userId: 1, movieId: 1}`
- **Database-level enforcement** of data isolation
- Prevents duplicate interactions
- Better scalability

```javascript
// Schema structure
{
  userId: ObjectId,      // References User
  movieId: Number,       // TMDB movie ID
  isInBucketList: Boolean,
  isWatched: Boolean,
  rating: Number,        // 1-5 stars
  liked: Boolean,
  title: String,         // Cached movie info
  posterPath: String,
  watchedAt: Date,
  likedAt: Date,
  ratedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Compound unique index ensures:
// - User A cannot create duplicate entry for same movie
// - User A's document with movieId=123 is separate from User B's document with movieId=123
```

---

## 🔐 Security Enforcement Points

### **1. Middleware Protection**

```javascript
// authMiddleware.js
export const protect = async (req, res, next) => {
  // Extract token from header
  const token = req.headers.authorization?.split(' ')[1];
  
  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // Find user and attach to request
  req.user = await User.findById(decoded.id);
  
  next();
};
```

**Result:** Every protected route has access to `req.user.id` (verified from JWT)

---

### **2. Controller-Level Isolation**

```javascript
// ✅ CORRECT: Always use req.user.id
export const getBucketList = async (req, res) => {
  const userId = req.user.id; // From JWT - TRUSTED
  
  const movies = await IndividualMovieInteraction.getUserBucketList(userId);
  
  res.json({ data: movies });
};

// ❌ WRONG: Never trust frontend userId
export const getBucketList = async (req, res) => {
  const userId = req.body.userId; // From frontend - UNTRUSTED
  // ⚠️ Attacker could send any userId and access other users' data!
};
```

---

### **3. Model-Level Queries**

All static methods in `IndividualMovieInteraction` enforce userId requirement:

```javascript
// Static method with built-in validation
static async getUserBucketList(userId) {
  if (!userId) {
    throw new Error('userId is required for getUserBucketList');
  }
  
  return this.find({ 
    userId,                  // ✅ Filter by userId
    isInBucketList: true 
  }).sort({ createdAt: -1 });
}

// Usage in controller
const bucketList = await IndividualMovieInteraction.getUserBucketList(req.user.id);
// ✅ Only returns THIS user's bucket list
```

---

### **4. Instance Methods**

All instance methods operate on the specific document:

```javascript
// Instance method
async addToBucketList() {
  this.isInBucketList = true;
  this.addedToBucketListAt = new Date();
  await this.save();
  return this;
}

// Usage in controller
const userId = req.user.id;  // From JWT
const movieId = req.body.movieId;

// findOne with BOTH userId and movieId
const interaction = await IndividualMovieInteraction.findOne({ 
  userId,    // ✅ User's own ID from JWT
  movieId 
});

await interaction.addToBucketList();
// ✅ Can only modify their own interaction
```

---

## 🔍 Data Isolation Verification

### **Test Scenarios**

#### Scenario 1: User A Cannot See User B's Data

```javascript
// User A (userId: 111) requests their bucket list
GET /api/movies/individual/bucket-list
Authorization: Bearer <User_A_Token>

// Response: Only User A's movies
{
  "success": true,
  "count": 5,
  "data": [
    { userId: "111", movieId: 12345, isInBucketList: true },
    { userId: "111", movieId: 67890, isInBucketList: true }
    // ✅ All have userId: 111
  ]
}
```

#### Scenario 2: User B Cannot Modify User A's Data

```javascript
// User B (userId: 222) tries to add to their bucket list
POST /api/movies/individual/bucket-list
Authorization: Bearer <User_B_Token>
{
  "movieId": 12345
}

// Backend extracts userId from JWT (222, not 111)
// Creates/finds interaction with userId=222 and movieId=12345
// Result: User B's OWN interaction is modified
// User A's interaction with movieId=12345 remains unchanged
```

#### Scenario 3: Attack Attempt - Spoofing userId

```javascript
// Attacker sends fake userId in request body
POST /api/movies/individual/bucket-list
Authorization: Bearer <Attacker_Token>  // userId: 999
{
  "userId": "111",  // ⚠️ Trying to spoof User A's ID
  "movieId": 12345
}

// ❌ BLOCKED: Backend ignores req.body.userId
const userId = req.user.id; // Always uses JWT userId (999)

// Result: Interaction created for userId=999, not 111
// User A's data is safe
```

---

## 📊 Database Indexes

Compound unique index ensures data integrity:

```javascript
// IndividualMovieInteraction.js
movieInteractionSchema.index(
  { userId: 1, movieId: 1 }, 
  { unique: true }
);

// Benefits:
// 1. Prevents duplicate (userId, movieId) pairs
// 2. Fast queries: findOne({ userId, movieId })
// 3. Database-level enforcement (even if code has bugs)
```

---

## 🚀 API Endpoints (Enhanced Security Routes)

All endpoints under `/api/movies/individual/*` use the IndividualMovieInteraction model:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/summary` | Get user's interaction counts | ✅ |
| GET | `/all` | Get all user interactions | ✅ |
| GET | `/bucket-list` | Get user's bucket list | ✅ |
| POST | `/bucket-list` | Add movie to bucket list | ✅ |
| DELETE | `/bucket-list/:movieId` | Remove from bucket list | ✅ |
| GET | `/watched` | Get watched movies | ✅ |
| POST | `/watched` | Mark movie as watched | ✅ |
| DELETE | `/watched/:movieId` | Unmark as watched | ✅ |
| GET | `/ratings` | Get rated movies | ✅ |
| POST | `/rate` | Rate a movie (1-5 stars) | ✅ |
| DELETE | `/rate/:movieId` | Remove rating | ✅ |
| GET | `/likes` | Get liked movies | ✅ |
| POST | `/like` | Like a movie | ✅ |
| DELETE | `/like/:movieId` | Unlike a movie | ✅ |
| GET | `/:movieId` | Get specific movie interaction | ✅ |

**All routes:**
- Require valid JWT token
- Extract userId from JWT (never from request body)
- Return only user's own data
- Operate only on user's own documents

---

## 🧪 Testing Data Isolation

### Manual Testing

```bash
# 1. Create two users
POST http://localhost:5000/api/auth/signup
{
  "email": "user1@test.com",
  "password": "Test1234!",
  "username": "user1"
}

POST http://localhost:5000/api/auth/signup
{
  "email": "user2@test.com",
  "password": "Test1234!",
  "username": "user2"
}

# 2. Login as User 1
POST http://localhost:5000/api/auth/login
{
  "email": "user1@test.com",
  "password": "Test1234!"
}
# Save token1

# 3. Login as User 2
POST http://localhost:5000/api/auth/login
{
  "email": "user2@test.com",
  "password": "Test1234!"
}
# Save token2

# 4. User 1 adds movie to bucket list
POST http://localhost:5000/api/movies/individual/bucket-list
Authorization: Bearer <token1>
{
  "movieId": 12345,
  "title": "Inception",
  "posterPath": "/path.jpg"
}

# 5. User 2 gets their bucket list
GET http://localhost:5000/api/movies/individual/bucket-list
Authorization: Bearer <token2>

# ✅ Expected: Empty array (User 2 hasn't added any movies)
# ❌ If you see User 1's movies: DATA LEAK!

# 6. Verify User 1's bucket list is intact
GET http://localhost:5000/api/movies/individual/bucket-list
Authorization: Bearer <token1>

# ✅ Expected: Array with movieId 12345
```

---

## 🔑 Key Takeaways

1. **Never trust frontend data for userId** - always use `req.user.id` from JWT
2. **All database queries MUST filter by userId** - no global queries
3. **Use compound unique index** - database-level enforcement
4. **Protected routes only** - no public access to user data
5. **One document per user-movie pair** - better isolation than arrays
6. **Static methods enforce userId** - throw errors if missing
7. **Test with multiple users** - verify no cross-user access

---

## 📝 Implementation Checklist

- [x] JWT authentication middleware (`protect`)
- [x] User model with bcrypt password hashing
- [x] IndividualMovieInteraction model with compound index
- [x] Controller methods use `req.user.id` only
- [x] Static methods validate userId presence
- [x] All routes protected with JWT middleware
- [x] No userId accepted from request body
- [x] Database indexes for performance + uniqueness
- [x] Error handling for unauthorized access
- [x] Frontend stores JWT in localStorage
- [x] Frontend sends JWT in Authorization header

---

## 🚨 Security Red Flags to Avoid

```javascript
// ❌ NEVER DO THIS:
const userId = req.body.userId;  // Attacker can send any ID
const userId = req.query.userId; // Same problem
const userId = req.params.userId; // Same problem

// ✅ ALWAYS DO THIS:
const userId = req.user.id;  // From verified JWT token

// ❌ NEVER DO THIS:
const movies = await IndividualMovieInteraction.find({ movieId }); // Returns ALL users' interactions

// ✅ ALWAYS DO THIS:
const movies = await IndividualMovieInteraction.find({ 
  userId: req.user.id,  // Filter by authenticated user
  movieId 
});
```

---

## 🎯 Conclusion

**Data isolation is enforced at multiple layers:**

1. **Network Layer**: HTTPS (in production)
2. **Application Layer**: JWT verification
3. **Controller Layer**: `req.user.id` extraction
4. **Model Layer**: Static method validation
5. **Database Layer**: Compound unique index

With this multi-layered approach, **one user can NEVER see or affect another user's data**.

---

*Last Updated: 2024*
*Backend Version: 1.0.0*
