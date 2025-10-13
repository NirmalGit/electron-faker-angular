# HttpOnly Cookie Authentication Migration Guide

## 🔒 Security Improvement: From localStorage to HttpOnly Cookies

This document explains the migration from localStorage-based JWT storage to HttpOnly cookie-based authentication.

---

## ⚠️ Why This Change?

### Security Vulnerability: localStorage and XSS Attacks

**Problem with localStorage:**
```typescript
// ❌ VULNERABLE: Any JavaScript can access tokens
localStorage.setItem('access_token', token);
const stolen = localStorage.getItem('access_token');  // Accessible by any script!
```

**XSS Attack Scenario:**
1. Attacker injects malicious JavaScript into your app (via compromised dependency, CDN, or user input)
2. Script accesses `localStorage.getItem('access_token')`
3. Token is sent to attacker's server
4. Attacker impersonates user with stolen token

### Solution: HttpOnly Cookies

**✅ SECURE: HttpOnly cookies are JavaScript-inaccessible**
```typescript
// ✅ SECURE: Tokens stored in HttpOnly cookies
// JavaScript CANNOT access: document.cookie won't show HttpOnly cookies
// Browser automatically sends cookies with requests
// Protected from XSS attacks
```

**Security Features:**
- **HttpOnly Flag**: JavaScript cannot read the cookie (XSS protection)
- **Secure Flag**: Cookie only sent over HTTPS (man-in-the-middle protection)
- **SameSite Flag**: Cookie only sent to same-origin requests (CSRF protection)

---

## 📋 What Changed?

### Frontend Changes (Angular)

#### 1. **TokenService** - State Management Only

**Before (localStorage):**
```typescript
// ❌ OLD: Stored tokens in localStorage
setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}
```

**After (HttpOnly Cookies):**
```typescript
// ✅ NEW: Only manages authentication state
isAuthenticated = signal<boolean>(false);
private userInfo = signal<any>(null);

setAuthenticated(authenticated: boolean) {
  this.isAuthenticated.set(authenticated);
}

setUserInfo(user: any) {
  this.userInfo.set(user);
}

clearAuthState() {
  this.isAuthenticated.set(false);
  this.userInfo.set(null);
}
```

**Key Points:**
- No token storage in frontend
- Only tracks authentication state
- User info kept in memory only
- Tokens managed entirely by backend

---

#### 2. **AuthService** - Cookie-Based Authentication

**Before (Manual Token Management):**
```typescript
// ❌ OLD: Manually managed tokens
login(credentials: LoginRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>('/auth/login', credentials)
    .pipe(
      tap(response => {
        this.tokenService.setTokens(
          response.access_token,
          response.refresh_token
        );
      })
    );
}
```

**After (Cookie-Based):**
```typescript
// ✅ NEW: Backend sets HttpOnly cookies
login(credentials: LoginRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(
    '/auth/login', 
    credentials,
    { withCredentials: true }  // Important: Send cookies
  ).pipe(
    tap(response => {
      // No token storage! Just update state
      this.tokenService.setUserInfo(response.user);
    })
  );
}

refreshToken(): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(
    '/auth/refresh',
    {},
    { withCredentials: true }  // Browser sends refresh token cookie
  );
}

logout(): Observable<any> {
  return this.http.post(
    '/auth/logout',
    {},
    { withCredentials: true }  // Backend clears cookies
  );
}
```

**Key Points:**
- `withCredentials: true` on all auth requests
- No token in request body
- Backend response doesn't return tokens
- Browser automatically includes cookies

---

#### 3. **AuthInterceptor** - Automatic Cookie Handling

**Before (Manual Authorization Header):**
```typescript
// ❌ OLD: Manually added Authorization header
private addAuthToken(request: HttpRequest<any>): HttpRequest<any> {
  const token = this.tokenService.getAccessToken();
  if (token) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`  // Manual header
      }
    });
  }
  return request;
}
```

**After (Automatic Cookies):**
```typescript
// ✅ NEW: Browser automatically sends cookies
intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  // Add credentials to requests that need authentication
  if (this.shouldIncludeCredentials(request)) {
    request = request.clone({
      withCredentials: true  // Browser includes HttpOnly cookies
    });
  }
  
  return next.handle(request).pipe(
    catchError((error: HttpErrorResponse) => {
      return this.handleError(request, next, error);
    })
  );
}

private shouldIncludeCredentials(request: HttpRequest<any>): boolean {
  // Don't include credentials for external APIs
  return !this.EXTERNAL_APIS.some(url => request.url.includes(url));
}
```

**Key Points:**
- No Authorization header needed
- `withCredentials: true` for cookie inclusion
- Browser handles cookie transmission
- Still handles 401 errors with token refresh

---

## 🔧 Backend Requirements

### Required Cookie Configuration

Your backend **MUST** set cookies with these flags:

```javascript
// Node.js/Express Example
res.cookie('access_token', jwtToken, {
  httpOnly: true,     // ✅ Prevents JavaScript access (XSS protection)
  secure: true,       // ✅ HTTPS only (production)
  sameSite: 'strict', // ✅ Prevents CSRF attacks
  maxAge: 15 * 60 * 1000  // 15 minutes
});

res.cookie('refresh_token', refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});
```

### Required Endpoints

#### 1. **POST /auth/login**

**Request:**
```json
{
  "username": "john",
  "password": "secret"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "john",
    "email": "john@example.com",
    "role": "user"
  },
  "message": "Login successful"
}
```

**Backend Actions:**
- ✅ Set `access_token` cookie (HttpOnly, Secure, SameSite)
- ✅ Set `refresh_token` cookie (HttpOnly, Secure, SameSite)
- ✅ Return user info (NO tokens in response body)

---

#### 2. **POST /auth/refresh**

**Request:**
```json
{}  // Empty body, refresh token sent in cookie
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "john",
    "email": "john@example.com"
  }
}
```

**Backend Actions:**
- ✅ Read `refresh_token` from cookie
- ✅ Validate refresh token
- ✅ Generate new access token
- ✅ Set new `access_token` cookie
- ✅ Optionally rotate `refresh_token` cookie
- ✅ Return user info

---

#### 3. **POST /auth/logout**

**Request:**
```json
{}  // Empty body
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Backend Actions:**
- ✅ Clear `access_token` cookie
- ✅ Clear `refresh_token` cookie
- ✅ Optionally blacklist tokens (for extra security)

```javascript
// Node.js/Express Example
res.clearCookie('access_token', {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});

res.clearCookie('refresh_token', {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});
```

---

#### 4. **GET /auth/me**

**Request:**
```
GET /auth/me
// Access token sent automatically in cookie
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "john",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Backend Actions:**
- ✅ Read `access_token` from cookie
- ✅ Validate token
- ✅ Return user info

**Purpose:** Check if user is authenticated on app initialization

---

#### 5. **Protected Endpoints (All API Routes)**

**Request:**
```
GET /api/products
// Access token sent automatically in cookie
```

**Backend Actions:**
- ✅ Read `access_token` from cookie (NOT Authorization header)
- ✅ Validate token
- ✅ Return 401 if token invalid/expired
- ✅ Return 403 if user lacks permissions

---

### Backend Middleware Example

```javascript
// Node.js/Express Middleware
const authenticateToken = (req, res, next) => {
  // ✅ Read token from cookie (NOT Authorization header)
  const token = req.cookies.access_token;
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Apply to protected routes
app.get('/api/products', authenticateToken, (req, res) => {
  // req.user is available
  res.json({ products: [...] });
});
```

---

### CORS Configuration

**Critical:** Your backend must allow credentials from your frontend origin

```javascript
// Node.js/Express CORS Configuration
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:4200',  // Your Angular app URL
  credentials: true,  // ✅ REQUIRED: Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));
```

**Production:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,  // https://your-app.com
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));
```

---

## 🔐 Security Benefits

### XSS Protection
```typescript
// ❌ BEFORE: Vulnerable to XSS
// Any malicious script can access:
const stolen = localStorage.getItem('access_token');

// ✅ AFTER: Protected from XSS
// JavaScript cannot access HttpOnly cookies:
document.cookie;  // Won't show HttpOnly cookies!
```

### CSRF Protection
```javascript
// ✅ SameSite flag prevents CSRF attacks
res.cookie('access_token', token, {
  sameSite: 'strict'  // Only sent to same-origin requests
});
```

### Man-in-the-Middle Protection
```javascript
// ✅ Secure flag ensures HTTPS only
res.cookie('access_token', token, {
  secure: true  // Only transmitted over HTTPS
});
```

---

## 📝 Migration Checklist

### Frontend (Angular) ✅ COMPLETED
- [x] Update `TokenService` to remove localStorage
- [x] Update `AuthService` to use `withCredentials: true`
- [x] Update `AuthInterceptor` to remove Authorization header
- [x] Add `withCredentials: true` to all auth requests
- [x] Update error handling for 401 responses

### Backend (Your API) ⏳ PENDING
- [ ] Install cookie-parser middleware
- [ ] Configure CORS with `credentials: true`
- [ ] Update `/auth/login` to set HttpOnly cookies
- [ ] Update `/auth/refresh` to read/set cookies
- [ ] Update `/auth/logout` to clear cookies
- [ ] Create `/auth/me` endpoint
- [ ] Update protected route middleware to read cookies
- [ ] Test all endpoints with cookie-based auth

### Testing ⏳ PENDING
- [ ] Test login flow (cookies set correctly)
- [ ] Test API requests (cookies sent automatically)
- [ ] Test token refresh (new cookies set)
- [ ] Test logout (cookies cleared)
- [ ] Test XSS protection (cookies not accessible)
- [ ] Test CORS configuration
- [ ] Test HTTPS-only in production

---

## 🧪 Testing the Implementation

### 1. **Test Login**

```typescript
// In browser console after login:
console.log(document.cookie);
// Should NOT show access_token or refresh_token (HttpOnly protection)

// Check network tab:
// Login response should have Set-Cookie headers
```

### 2. **Test Automatic Cookie Inclusion**

```typescript
// Make an API request
this.http.get('/api/products', { withCredentials: true }).subscribe();

// Check network tab:
// Request headers should include: Cookie: access_token=...
// Browser automatically includes HttpOnly cookies
```

### 3. **Test XSS Protection**

```typescript
// Try to access cookies from console:
console.log(document.cookie);
// Should NOT show access_token or refresh_token

// Try to steal token:
localStorage.getItem('access_token');  // null
sessionStorage.getItem('access_token');  // null
// Tokens are completely inaccessible to JavaScript ✅
```

### 4. **Test Token Refresh**

```typescript
// Wait for access token to expire (15 minutes)
// Make an API request
// Should automatically:
// 1. Get 401 error
// 2. Call /auth/refresh with refresh_token cookie
// 3. Get new access_token cookie
// 4. Retry original request
// All automatic, no user intervention!
```

---

## 🚀 Deployment Considerations

### Development Environment
```typescript
// Angular proxy configuration for development
// proxy.conf.json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

### Production Environment

**Frontend:**
- Deploy to same domain as backend (e.g., `app.example.com`)
- Or use proper CORS configuration

**Backend:**
- Ensure HTTPS enabled (required for Secure flag)
- Set correct CORS origin
- Use environment variables for configuration

```javascript
// Production backend configuration
res.cookie('access_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
  sameSite: 'strict',
  domain: process.env.COOKIE_DOMAIN,  // .example.com
  maxAge: 15 * 60 * 1000
});
```

---

## 📚 Additional Resources

- [OWASP: HttpOnly Cookie Best Practices](https://owasp.org/www-community/HttpOnly)
- [MDN: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [Angular: HttpClient withCredentials](https://angular.io/api/common/http/HttpRequest#withCredentials)

---

## ✅ Summary

### Before (Vulnerable)
- ❌ Tokens stored in localStorage
- ❌ Accessible to any JavaScript
- ❌ Vulnerable to XSS attacks
- ❌ Manual Authorization header management

### After (Secure)
- ✅ Tokens in HttpOnly cookies
- ✅ Inaccessible to JavaScript
- ✅ Protected from XSS attacks
- ✅ Automatic cookie handling by browser
- ✅ CSRF protection with SameSite flag
- ✅ HTTPS-only with Secure flag

**Result:** Production-ready, secure authentication system! 🔒

---

**Last Updated:** December 2024
**Status:** Frontend Complete ✅ | Backend Pending ⏳
