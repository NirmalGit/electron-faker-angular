# Complete Application Architecture with Authentication

## Full System Architecture

```mermaid
graph TB
    subgraph "Frontend - Angular Application"
        subgraph "UI Components"
            Login[Login Component]
            Dashboard[Dashboard Component]
            ProductList[Product List Component]
            ProductDetail[Product Detail Component]
        end
        
        subgraph "Services Layer"
            AuthService[Auth Service<br/>Login/Logout/Refresh]
            TokenService[Token Service<br/>JWT Management]
            ProductService[Product Service<br/>Business Logic]
            WebAPI[Web API Service<br/>HTTP Calls]
            ElectronAPI[Electron API Service<br/>IPC Calls]
        end
        
        subgraph "Interceptors & Guards"
            AuthInterceptor[Auth Interceptor<br/>Error Handling & Token Refresh]
            AuthGuard[Auth Guard<br/>Route Protection]
            GuestGuard[Guest Guard<br/>Redirect if Authenticated]
        end
    end
    
    subgraph "Backend Services"
        AuthAPI[Auth API<br/>/login /refresh /logout]
        DataAPI[Data API<br/>/products /categories]
        FakeStore[FakeStore API<br/>External]
    end
    
    subgraph "Electron Layer"
        Main[Main Process<br/>Config & IPC Handlers]
        Preload[Preload Script<br/>Context Bridge]
    end
    
    subgraph "Storage"
        LocalStorage[(Local Storage<br/>JWT Tokens)]
    end
    
    %% UI to Services
    Login -->|credentials| AuthService
    Dashboard -->|load data| ProductService
    ProductList -->|load data| ProductService
    ProductDetail -->|load data| ProductService
    
    %% Services to Storage
    AuthService -->|store tokens| TokenService
    TokenService -->|read/write| LocalStorage
    
    %% Services to API Selection
    ProductService -->|cloud mode| WebAPI
    ProductService -->|desktop mode| ElectronAPI
    
    %% Web API Flow
    WebAPI -->|HTTP| AuthInterceptor
    AuthInterceptor -->|add JWT| DataAPI
    DataAPI --> FakeStore
    
    %% Electron API Flow
    ElectronAPI -->|IPC| Preload
    Preload -->|invoke| Main
    Main -->|HTTP| FakeStore
    
    %% Auth Flow
    AuthService -->|HTTP| AuthInterceptor
    AuthInterceptor -->|login/refresh| AuthAPI
    AuthInterceptor -->|401 error| AuthService
    
    %% Guards
    AuthGuard -->|check auth| TokenService
    GuestGuard -->|check auth| TokenService
    Dashboard -.protected by.- AuthGuard
    Login -.protected by.- GuestGuard
    
    %% Styling
    style AuthInterceptor fill:#FF9800,color:#fff
    style AuthService fill:#2196F3,color:#fff
    style TokenService fill:#2196F3,color:#fff
    style AuthGuard fill:#4CAF50,color:#fff
    style GuestGuard fill:#4CAF50,color:#fff
    style LocalStorage fill:#9C27B0,color:#fff
    style Main fill:#00BCD4,color:#fff
    style Preload fill:#00BCD4,color:#fff
```

## Request Flow with Authentication

```mermaid
sequenceDiagram
    actor User
    participant UI as Component
    participant Guard as Auth Guard
    participant Svc as Service
    participant Int as Interceptor
    participant Token as Token Service
    participant Auth as Auth Service
    participant API as Backend API
    
    User->>UI: Navigate to Protected Route
    UI->>Guard: canActivate()
    Guard->>Token: hasValidToken()
    
    alt Has Valid Token
        Token->>Guard: true
        Guard->>UI: Allow Access
        UI->>Svc: Load Data
        Svc->>Int: HTTP Request
        Int->>Token: Get Access Token
        Token->>Int: Return Token
        Int->>API: Request + JWT Header
        
        alt Success (200)
            API->>Int: Response Data
            Int->>Svc: Return Data
            Svc->>UI: Update View
            UI->>User: Show Data
        end
        
        alt Token Expired (401)
            API->>Int: 401 Unauthorized
            Int->>Auth: refreshToken()
            Auth->>Token: Get Refresh Token
            Token->>Auth: Refresh Token
            Auth->>API: POST /auth/refresh
            
            alt Refresh Success
                API->>Auth: New Tokens
                Auth->>Token: Store New Tokens
                Token->>Auth: Success
                Auth->>Int: New Access Token
                Int->>API: Retry Request + New JWT
                API->>Int: Response Data
                Int->>Svc: Return Data
                Svc->>UI: Update View
                UI->>User: Show Data
            end
            
            alt Refresh Failed
                API->>Auth: 401 Invalid
                Auth->>Token: Clear Tokens
                Auth->>Int: Logout
                Int->>UI: Redirect to Login
                UI->>User: Show Login Page
            end
        end
        
        alt Bad Request (400)
            API->>Int: 400 + Errors
            Int->>UI: Show Validation Errors
            UI->>User: Display Errors
        end
    end
    
    alt No Valid Token
        Token->>Guard: false
        Guard->>UI: Redirect to Login
        UI->>User: Show Login Page
        User->>UI: Enter Credentials
        UI->>Auth: login(credentials)
        Auth->>API: POST /auth/login
        API->>Auth: Access + Refresh Tokens
        Auth->>Token: Store Tokens
        Token->>Auth: Success
        Auth->>UI: Login Successful
        UI->>User: Redirect to Dashboard
    end
```

## Error Handling State Machine

```mermaid
stateDiagram-v2
    [*] --> Request: HTTP Request
    
    Request --> Processing: Send to Backend
    Processing --> Success: 200 OK
    Processing --> BadRequest: 400 Error
    Processing --> Unauthorized: 401 Error
    Processing --> Forbidden: 403 Error
    Processing --> NotFound: 404 Error
    Processing --> ServerError: 500 Error
    
    Success --> [*]: Return Data
    
    BadRequest --> ExtractErrors: Parse Validation Errors
    ExtractErrors --> ShowErrors: Display to User
    ShowErrors --> [*]: Error State
    
    Unauthorized --> CheckEndpoint: Is Auth Endpoint?
    CheckEndpoint --> LogoutDirect: Yes
    CheckEndpoint --> CheckRefresh: No
    
    CheckRefresh --> RefreshInProgress: Check Status
    RefreshInProgress --> QueueRequest: Refresh Ongoing
    RefreshInProgress --> StartRefresh: Not Started
    
    StartRefresh --> CallRefresh: POST /auth/refresh
    CallRefresh --> RefreshSuccess: 200 OK
    CallRefresh --> RefreshFailed: 401 Error
    
    RefreshSuccess --> UpdateTokens: Store New Tokens
    UpdateTokens --> RetryRequest: Retry Original
    UpdateTokens --> ProcessQueue: Retry Queued
    RetryRequest --> Request
    ProcessQueue --> Success
    
    RefreshFailed --> LogoutAuto: Clear Tokens
    LogoutDirect --> [*]: Redirect to Login
    LogoutAuto --> [*]: Redirect to Login
    
    QueueRequest --> WaitRefresh: Wait for Complete
    WaitRefresh --> RetryRequest: Refresh Done
    
    Forbidden --> ShowForbidden: Access Denied
    ShowForbidden --> [*]: Error State
    
    NotFound --> ShowNotFound: Resource Missing
    ShowNotFound --> [*]: Error State
    
    ServerError --> ShowServerError: Server Down
    ShowServerError --> [*]: Error State
```

## Authentication Flow Diagram

```mermaid
flowchart TD
    Start([User Starts App]) --> CheckAuth{Has Valid<br/>Token?}
    
    CheckAuth -->|No| ShowLogin[Show Login Page]
    CheckAuth -->|Yes| LoadApp[Load Application]
    
    ShowLogin --> EnterCreds[User Enters Credentials]
    EnterCreds --> ClickLogin[Click Login]
    ClickLogin --> ValidateForm{Form Valid?}
    
    ValidateForm -->|No| ShowFormError[Show Validation Errors]
    ShowFormError --> EnterCreds
    
    ValidateForm -->|Yes| SendLogin[Send POST /auth/login]
    SendLogin --> LoginResponse{Response?}
    
    LoginResponse -->|Success| ReceiveTokens[Receive JWT Tokens]
    LoginResponse -->|400/401| ShowLoginError[Show Login Error]
    LoginResponse -->|500| ShowServerError[Show Server Error]
    
    ShowLoginError --> EnterCreds
    ShowServerError --> EnterCreds
    
    ReceiveTokens --> StoreTokens[Store in LocalStorage]
    StoreTokens --> SetAuthState[Set isAuthenticated = true]
    SetAuthState --> LoadApp
    
    LoadApp --> Dashboard[Navigate to Dashboard]
    Dashboard --> MakeRequest[Make API Request]
    
    MakeRequest --> AddJWT[Interceptor Adds JWT]
    AddJWT --> SendRequest[Send to Backend]
    SendRequest --> CheckResponse{Response<br/>Status?}
    
    CheckResponse -->|200| DisplayData[Display Data]
    CheckResponse -->|400| ShowError400[Show Validation Error]
    CheckResponse -->|401| HandleExpiry[Handle Token Expiry]
    CheckResponse -->|403| ShowError403[Show Access Denied]
    CheckResponse -->|404| ShowError404[Show Not Found]
    CheckResponse -->|500| ShowError500[Show Server Error]
    
    HandleExpiry --> CheckRefreshState{Refresh<br/>In Progress?}
    
    CheckRefreshState -->|Yes| AddToQueue[Add Request to Queue]
    CheckRefreshState -->|No| StartRefresh[Start Token Refresh]
    
    StartRefresh --> GetRefreshToken[Get Refresh Token]
    GetRefreshToken --> CallRefreshAPI[POST /auth/refresh]
    CallRefreshAPI --> RefreshResult{Refresh<br/>Result?}
    
    RefreshResult -->|Success| UpdateTokensNew[Update Tokens]
    RefreshResult -->|Failed| ClearTokens[Clear All Tokens]
    
    UpdateTokensNew --> RetryOriginal[Retry Original Request]
    UpdateTokensNew --> RetryQueued[Retry Queued Requests]
    RetryQueued --> AddJWT
    RetryOriginal --> AddJWT
    
    ClearTokens --> SetUnauthState[Set isAuthenticated = false]
    SetUnauthState --> RedirectLogin[Redirect to Login]
    RedirectLogin --> ShowLogin
    
    AddToQueue --> WaitForCompletion[Wait for Refresh]
    WaitForCompletion --> CheckRefreshOutcome{Refresh<br/>Successful?}
    CheckRefreshOutcome -->|Yes| RetryOriginal
    CheckRefreshOutcome -->|No| RedirectLogin
    
    DisplayData --> UserInteraction[User Interaction]
    ShowError400 --> UserInteraction
    ShowError403 --> UserInteraction
    ShowError404 --> UserInteraction
    ShowError500 --> UserInteraction
    
    UserInteraction --> UserAction{User Action?}
    UserAction -->|New Request| MakeRequest
    UserAction -->|Logout| HandleLogout[Call Logout]
    UserAction -->|Stay| UserInteraction
    
    HandleLogout --> CallLogoutAPI[POST /auth/logout]
    CallLogoutAPI --> ClearLocalTokens[Clear Tokens]
    ClearLocalTokens --> SetUnauthLogout[Set isAuthenticated = false]
    SetUnauthLogout --> ShowLogin
    
    style Start fill:#4CAF50,color:#fff
    style ReceiveTokens fill:#4CAF50,color:#fff
    style DisplayData fill:#4CAF50,color:#fff
    style ShowError400 fill:#FF9800,color:#fff
    style ShowError403 fill:#F44336,color:#fff
    style ShowError404 fill:#FF9800,color:#fff
    style ShowError500 fill:#F44336,color:#fff
    style UpdateTokensNew fill:#2196F3,color:#fff
    style ClearTokens fill:#F44336,color:#fff
```

## Token Lifecycle Timeline

```mermaid
gantt
    title JWT Token Lifecycle with Auto-Refresh
    dateFormat HH:mm
    axisFormat %H:%M
    
    section Access Token
    Valid Token         :active, at1, 00:00, 55m
    Warning Period      :crit, at2, 00:55, 4m
    About to Expire     :crit, at3, 00:59, 1m
    Expired             :done, at4, 01:00, 5m
    New Token Valid     :active, at5, 01:00, 55m
    
    section Refresh Process
    Idle                :r0, 00:00, 59m
    Refresh Triggered   :milestone, m1, 00:59, 0m
    Refreshing          :active, r1, 00:59, 1m
    New Token Issued    :milestone, m2, 01:00, 0m
    
    section User Experience
    Normal Usage        :active, u1, 00:00, 59m
    Seamless Transition :u2, 00:59, 1m
    Continue Working    :active, u3, 01:00, 1h
    
    section Background Tasks
    Monitor Expiry      :active, b1, 00:00, 2h
    Request Queue Empty :b2, 00:00, 59m
    Requests Queued     :crit, b3, 00:59, 1m
    Queue Processed     :done, b4, 01:00, 1m
```

## Component Dependency Graph

```mermaid
graph LR
    subgraph "Feature Components"
        LC[Login<br/>Component]
        DC[Dashboard<br/>Component]
        PLC[Product List<br/>Component]
        PDC[Product Detail<br/>Component]
    end
    
    subgraph "Services"
        AS[Auth<br/>Service]
        TS[Token<br/>Service]
        PS[Product<br/>Service]
    end
    
    subgraph "Interceptors"
        AI[Auth<br/>Interceptor]
    end
    
    subgraph "Guards"
        AG[Auth<br/>Guard]
        GG[Guest<br/>Guard]
    end
    
    subgraph "API Layer"
        WA[Web API<br/>Service]
        EA[Electron API<br/>Service]
    end
    
    LC --> AS
    LC -.guarded by.- GG
    
    DC --> PS
    PLC --> PS
    PDC --> PS
    DC -.guarded by.- AG
    PLC -.guarded by.- AG
    PDC -.guarded by.- AG
    
    AS --> TS
    AS --> AI
    AG --> TS
    GG --> TS
    
    PS --> WA
    PS --> EA
    
    WA --> AI
    AI --> AS
    AI --> TS
    
    style AS fill:#2196F3,color:#fff
    style TS fill:#2196F3,color:#fff
    style AI fill:#FF9800,color:#fff
    style AG fill:#4CAF50,color:#fff
    style GG fill:#4CAF50,color:#fff
```

---

## Legend

| Color | Meaning |
|-------|---------|
| 🟢 Green | Success / Active / Allowed |
| 🟡 Orange | Warning / Processing / Validation |
| 🔴 Red | Error / Forbidden / Failed |
| 🔵 Blue | Service / Logic / Management |
| 🟣 Purple | Storage / Cache |
| 🔵 Cyan | Electron / IPC |

---

## Key Takeaways

1. **Seamless Authentication**: Users never see token refresh happening
2. **Automatic Recovery**: Failed requests are automatically retried after token refresh
3. **Request Queueing**: Multiple simultaneous requests handled efficiently
4. **Comprehensive Errors**: All HTTP errors handled with appropriate user feedback
5. **Type Safe**: Full TypeScript support throughout the stack
6. **Production Ready**: Enterprise-grade security and error handling

This architecture ensures a robust, secure, and user-friendly application! 🎉
