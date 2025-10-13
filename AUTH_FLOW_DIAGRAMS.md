# Authentication & Error Handling Flow Diagrams

## Complete Request Flow with Error Handling

```mermaid
sequenceDiagram
    participant C as Component
    participant I as Auth Interceptor
    participant T as Token Service
    participant A as Auth Service
    participant B as Backend API

    C->>I: HTTP Request
    
    alt Has Valid Token
        I->>I: Add JWT to Headers
        I->>B: Request + JWT
        
        alt Success (200)
            B->>I: Response Data
            I->>C: Return Data
        end
        
        alt Bad Request (400)
            B->>I: 400 + Validation Errors
            I->>I: Extract Error Messages
            I->>I: Show Notification
            I->>C: Throw Structured Error
        end
        
        alt Unauthorized (401)
            B->>I: 401 Token Expired
            I->>T: Get Refresh Token
            T->>I: Return Refresh Token
            I->>A: Call refreshToken()
            A->>B: POST /auth/refresh
            
            alt Refresh Success
                B->>A: New Tokens
                A->>T: Store New Tokens
                T->>A: Success
                A->>I: Return New Token
                I->>I: Retry Original Request
                I->>B: Request + New JWT
                B->>I: Response Data
                I->>C: Return Data
            end
            
            alt Refresh Failed
                B->>A: 401 Invalid Refresh
                A->>T: Clear Tokens
                A->>I: Throw Error
                I->>C: Redirect to Login
            end
        end
        
        alt Forbidden (403)
            B->>I: 403 Forbidden
            I->>I: Show Access Denied
            I->>C: Throw Error
        end
        
        alt Not Found (404)
            B->>I: 404 Not Found
            I->>I: Show Not Found
            I->>C: Throw Error
        end
        
        alt Server Error (500)
            B->>I: 500 Server Error
            I->>I: Show Server Error
            I->>C: Throw Error
        end
    end
```

## Token Refresh with Request Queueing

```mermaid
flowchart TD
    Start[HTTP Request] --> HasToken{Has Valid Token?}
    
    HasToken -->|Yes| AddToken[Add JWT to Headers]
    HasToken -->|No| SendRequest[Send Request]
    
    AddToken --> SendRequest
    SendRequest --> CheckResponse{Response Status}
    
    CheckResponse -->|200 Success| ReturnData[Return Data to Component]
    CheckResponse -->|400 Bad Request| Handle400[Extract & Show Validation Errors]
    CheckResponse -->|401 Unauthorized| Check401[Check if Auth Endpoint]
    CheckResponse -->|403 Forbidden| Handle403[Show Access Denied]
    CheckResponse -->|404 Not Found| Handle404[Show Not Found]
    CheckResponse -->|500 Server Error| Handle500[Show Server Error]
    
    Check401 -->|Is /auth endpoint| Logout1[Logout User]
    Check401 -->|Not auth endpoint| CheckRefresh{Refresh in Progress?}
    
    CheckRefresh -->|Yes| QueueRequest[Add to Request Queue]
    CheckRefresh -->|No| StartRefresh[Start Token Refresh]
    
    StartRefresh --> CallRefresh[Call /auth/refresh API]
    CallRefresh --> RefreshResponse{Refresh Success?}
    
    RefreshResponse -->|Success| UpdateTokens[Update Stored Tokens]
    RefreshResponse -->|Failed| Logout2[Logout User]
    
    UpdateTokens --> RetryRequest[Retry Original Request]
    UpdateTokens --> ProcessQueue[Process Queued Requests]
    
    QueueRequest --> WaitForRefresh[Wait for Refresh Complete]
    WaitForRefresh --> RetryRequest
    
    RetryRequest --> SendRequest
    ProcessQueue --> ReturnData
    
    Handle400 --> ThrowError[Throw Structured Error]
    Handle403 --> ThrowError
    Handle404 --> ThrowError
    Handle500 --> ThrowError
    Logout1 --> ThrowError
    Logout2 --> ThrowError
    
    ReturnData --> End[End]
    ThrowError --> End
    
    style Start fill:#4CAF50
    style ReturnData fill:#4CAF50
    style Handle400 fill:#FF9800
    style Handle403 fill:#F44336
    style Handle404 fill:#FF9800
    style Handle500 fill:#F44336
    style Logout1 fill:#F44336
    style Logout2 fill:#F44336
    style UpdateTokens fill:#2196F3
    style End fill:#9E9E9E
```

## Authentication State Management

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    
    Unauthenticated --> Authenticating: login()
    Authenticating --> Authenticated: Login Success
    Authenticating --> Unauthenticated: Login Failed
    
    Authenticated --> TokenValid: Check Token
    TokenValid --> TokenExpired: Time Passes
    
    TokenExpired --> Refreshing: Auto Refresh on 401
    Refreshing --> Authenticated: Refresh Success
    Refreshing --> Unauthenticated: Refresh Failed
    
    Authenticated --> Unauthenticated: logout()
    TokenExpired --> Unauthenticated: Manual Logout
    
    note right of TokenValid
        Token is valid
        User can make requests
    end note
    
    note right of TokenExpired
        Token expired
        Need to refresh
    end note
    
    note right of Refreshing
        Using refresh token
        to get new access token
    end note
```

## Error Handling Decision Tree

```mermaid
flowchart TD
    Error[HTTP Error Received] --> CheckStatus{Status Code?}
    
    CheckStatus -->|400| BadRequest[Bad Request Handler]
    CheckStatus -->|401| Unauthorized[Unauthorized Handler]
    CheckStatus -->|403| Forbidden[Forbidden Handler]
    CheckStatus -->|404| NotFound[Not Found Handler]
    CheckStatus -->|500-503| ServerError[Server Error Handler]
    CheckStatus -->|Other| Unknown[Unknown Error Handler]
    
    BadRequest --> ExtractValidation[Extract Validation Errors]
    ExtractValidation --> ShowValidation[Show User-Friendly Messages]
    ShowValidation --> Return400[Return Structured Error]
    
    Unauthorized --> IsAuthEndpoint{Auth Endpoint?}
    IsAuthEndpoint -->|Yes| LogoutImmediate[Logout Immediately]
    IsAuthEndpoint -->|No| AttemptRefresh[Attempt Token Refresh]
    
    AttemptRefresh --> RefreshSuccess{Refresh OK?}
    RefreshSuccess -->|Yes| RetryOriginal[Retry Original Request]
    RefreshSuccess -->|No| LogoutAndRedirect[Logout & Redirect to Login]
    
    Forbidden --> CheckPermissions[Check User Permissions]
    CheckPermissions --> ShowAccessDenied[Show Access Denied Message]
    ShowAccessDenied --> Return403[Return Forbidden Error]
    
    NotFound --> LogNotFound[Log Missing Resource]
    LogNotFound --> ShowNotFound[Show Not Found Message]
    ShowNotFound --> Return404[Return Not Found Error]
    
    ServerError --> DetermineType{Error Type?}
    DetermineType -->|500| InternalError[Internal Server Error]
    DetermineType -->|502| BadGateway[Bad Gateway]
    DetermineType -->|503| ServiceDown[Service Unavailable]
    
    InternalError --> LogServerError[Log Error Details]
    BadGateway --> LogServerError
    ServiceDown --> LogServerError
    LogServerError --> ShowServerError[Show Generic Server Error]
    ShowServerError --> Return500[Return Server Error]
    
    Unknown --> LogUnknown[Log Unknown Error]
    LogUnknown --> ShowGenericError[Show Generic Error Message]
    ShowGenericError --> ReturnUnknown[Return Unknown Error]
    
    Return400 --> NotifyUser[Show Notification to User]
    Return403 --> NotifyUser
    Return404 --> NotifyUser
    Return500 --> NotifyUser
    ReturnUnknown --> NotifyUser
    LogoutImmediate --> NotifyUser
    LogoutAndRedirect --> NotifyUser
    RetryOriginal --> Success[Request Successful]
    
    NotifyUser --> End[End]
    Success --> End
    
    style Error fill:#F44336,color:#fff
    style BadRequest fill:#FF9800
    style Unauthorized fill:#FF9800
    style Forbidden fill:#F44336,color:#fff
    style ServerError fill:#F44336,color:#fff
    style Success fill:#4CAF50,color:#fff
    style RetryOriginal fill:#4CAF50,color:#fff
```

## Component Integration Example

```mermaid
flowchart LR
    subgraph "Component Layer"
        Login[Login Component]
        Dashboard[Dashboard Component]
        Profile[Profile Component]
    end
    
    subgraph "Service Layer"
        AuthService[Auth Service]
        TokenService[Token Service]
        ProductService[Product Service]
    end
    
    subgraph "Interceptor Layer"
        Interceptor[Auth Interceptor]
    end
    
    subgraph "Guards"
        AuthGuard[Auth Guard]
        GuestGuard[Guest Guard]
    end
    
    Login -->|login credentials| AuthService
    Dashboard -->|get products| ProductService
    Profile -->|get user info| TokenService
    
    AuthService -->|store tokens| TokenService
    AuthService -->|HTTP requests| Interceptor
    ProductService -->|HTTP requests| Interceptor
    
    Interceptor -->|add JWT| Backend[(Backend API)]
    Interceptor -->|401 error| AuthService
    Interceptor -->|refresh token| Backend
    
    AuthGuard -->|check auth| TokenService
    GuestGuard -->|check auth| TokenService
    
    Dashboard -.protected by.- AuthGuard
    Profile -.protected by.- AuthGuard
    Login -.protected by.- GuestGuard
    
    style AuthService fill:#2196F3
    style TokenService fill:#2196F3
    style Interceptor fill:#FF9800
    style AuthGuard fill:#4CAF50
    style GuestGuard fill:#4CAF50
```

## Token Lifecycle

```mermaid
gantt
    title JWT Token Lifecycle
    dateFormat HH:mm:ss
    axisFormat %H:%M:%S
    
    section Access Token
    Valid Token    :active, t1, 00:00:00, 59m
    About to Expire :crit, t2, 00:59:00, 1m
    Expired        :done, t3, 01:00:00, 1m
    
    section Refresh Process
    Refresh Triggered :milestone, m1, 00:59:30, 0m
    Refreshing        :active, r1, 00:59:30, 30s
    New Token Issued  :milestone, m2, 01:00:00, 0m
    
    section User Experience
    Normal Usage      :active, u1, 00:00:00, 59m
    Seamless Refresh  :u2, 00:59:30, 30s
    Continue Usage    :active, u3, 01:00:00, 1m
```

---

## Quick Reference

### Error Status Codes

| Code | Name | Action | Retry? |
|------|------|--------|--------|
| 400 | Bad Request | Show validation errors | No |
| 401 | Unauthorized | Auto-refresh token | Yes (after refresh) |
| 403 | Forbidden | Show access denied | No |
| 404 | Not Found | Show not found | No |
| 500 | Server Error | Show server error | Optional |
| 502 | Bad Gateway | Show server down | Optional |
| 503 | Service Unavailable | Show maintenance | Optional |

### Token Refresh Triggers

1. **Automatic**: When 401 error received on authenticated endpoint
2. **Proactive**: When token is about to expire (30s buffer)
3. **Manual**: User clicks "refresh" button (optional)

### Security Best Practices

✅ Store tokens in localStorage (or HttpOnly cookies for production)  
✅ Always use HTTPS in production  
✅ Implement token expiry validation  
✅ Rotate refresh tokens on each use  
✅ Implement token blacklisting on logout  
✅ Add rate limiting on refresh endpoint  
✅ Use short-lived access tokens (15-60 min)  
✅ Use long-lived refresh tokens (7-30 days)  
✅ Validate tokens on every request (backend)  
✅ Log security events (failed logins, etc.)  
