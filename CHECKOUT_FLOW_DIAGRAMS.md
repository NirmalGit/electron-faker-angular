# Checkout Flow Diagrams

This document contains Mermaid diagrams that visualize the complete shopping cart and checkout flow for the Electron-Faker-Angular application.

## Complete User Journey Flowchart

```mermaid
flowchart TD
    %% Product Discovery
    A[Product Discovery] --> B{User Action}
    B -->|Add to Cart| C[Add Product to Cart]
    B -->|View Details| D[Product Detail Page]
    D -->|Add to Cart| C
    
    %% Cart Management
    C --> E[Update Cart Badge]
    E --> F[Show Success Notification]
    F --> G{User Choice}
    G -->|Continue Shopping| A
    G -->|View Cart| H[Cart Component]
    
    %% Cart Operations
    H --> I{Cart Actions}
    I -->|Update Quantity| J[Modify Cart Items]
    I -->|Remove Items| K[Remove from Cart]
    I -->|Proceed to Checkout| L[Checkout Component]
    J --> H
    K --> H
    
    %% Checkout Process
    L --> M[Step 1: Billing Information]
    M --> N{Billing Valid?}
    N -->|No| M
    N -->|Yes| O[Step 2: Shipping Information]
    O --> P{Shipping Valid?}
    P -->|No| O
    P -->|Yes| Q[Step 3: Payment Information]
    Q --> R{Payment Valid?}
    R -->|No| Q
    R -->|Yes| S[Order Submission]
    
    %% Order Completion
    S --> T{Order Success?}
    T -->|No| U[Show Error Message]
    U --> Q
    T -->|Yes| V[Order Confirmation]
    V --> W[Clear Cart]
    W --> X[Return to Dashboard]
    X --> A
    
    %% Styling
    classDef processNode fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef decisionNode fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef startEndNode fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef errorNode fill:#ffebee,stroke:#c62828,stroke-width:2px
    
    class A,X startEndNode
    class B,G,I,N,P,R,T decisionNode
    class C,E,F,H,J,K,L,M,O,Q,S,V,W processNode
    class U errorNode
```

## Cart Service State Management Flow

```mermaid
flowchart LR
    %% Cart Service Operations
    A[User Action] --> B{Action Type}
    
    %% Add to Cart Flow
    B -->|Add to Cart| C[Find Existing Item]
    C --> D{Item Exists?}
    D -->|Yes| E[Update Quantity]
    D -->|No| F[Create New Item]
    E --> G[Update Cart State]
    F --> G
    
    %% Update Quantity Flow
    B -->|Update Quantity| H{New Quantity > 0?}
    H -->|Yes| I[Update Item Quantity]
    H -->|No| J[Remove Item]
    I --> G
    J --> G
    
    %% Remove Item Flow
    B -->|Remove Item| K[Filter Out Item]
    K --> G
    
    %% Clear Cart Flow
    B -->|Clear Cart| L[Reset Cart State]
    L --> G
    
    %% State Update Process
    G --> M[Calculate Totals]
    M --> N[Update Signals]
    N --> O[Save to Storage]
    O --> P[Trigger UI Updates]
    
    %% UI Reactions
    P --> Q[Update Cart Badge]
    P --> R[Update Cart Component]
    P --> S[Update Order Summary]
    
    classDef actionNode fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef processNode fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef storageNode fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef uiNode fill:#fff8e1,stroke:#f57c00,stroke-width:2px
    
    class A actionNode
    class C,E,F,I,J,K,L,M,N processNode
    class O storageNode
    class P,Q,R,S uiNode
```

## Checkout Form Validation Flow

```mermaid
flowchart TD
    %% Form Validation Process
    A[User Submits Step] --> B{Form Valid?}
    B -->|No| C[Show Validation Errors]
    C --> D[Highlight Invalid Fields]
    D --> E[Display Error Messages]
    E --> F[User Corrects Input]
    F --> A
    
    B -->|Yes| G{Current Step}
    
    %% Step Navigation
    G -->|Billing| H[Enable Shipping Step]
    G -->|Shipping| I[Enable Payment Step]
    G -->|Payment| J[Enable Order Submission]
    
    H --> K[Navigate to Shipping]
    I --> L[Navigate to Payment]
    J --> M[Submit Order]
    
    %% Order Submission Process
    M --> N[Validate All Forms]
    N --> O{All Valid?}
    O -->|No| P[Return to Invalid Step]
    O -->|Yes| Q[Create Order Object]
    Q --> R[Submit to API]
    R --> S{API Success?}
    S -->|No| T[Show Error Message]
    S -->|Yes| U[Order Success]
    
    %% Final Actions
    U --> V[Clear Cart]
    V --> W[Show Confirmation]
    W --> X[Navigate to Dashboard]
    
    T --> G
    P --> G
    
    classDef validationNode fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    classDef navigationNode fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px
    classDef successNode fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    classDef apiNode fill:#fff3e0,stroke:#ff9800,stroke-width:2px
    
    class C,D,E,N,O,P validationNode
    class H,I,J,K,L navigationNode
    class U,V,W,X successNode
    class Q,R,S,T apiNode
```

## Cross-Platform Architecture Flow

```mermaid
flowchart TB
    %% User Interface Layer
    A[User Interface] --> B{Platform Detection}
    B -->|Web| C[Browser Environment]
    B -->|Desktop| D[Electron Environment]
    
    %% Service Layer
    C --> E[WebApiService]
    D --> F[ElectronApiService]
    
    %% Cart Service Integration
    E --> G[CartService]
    F --> G
    
    %% Storage Layer
    E --> H[localStorage]
    F --> I[File System via IPC]
    
    %% IPC Communication (Electron Only)
    I --> J[Main Process]
    J --> K[cart.ipc.js]
    K --> L[JSON File Storage]
    
    %% Data Flow
    H --> M[Browser Storage]
    L --> N[Desktop Storage]
    
    %% Common Operations
    G --> O[Add to Cart]
    G --> P[Update Quantity]
    G --> Q[Remove Item]
    G --> R[Create Order]
    
    %% Platform-Specific Persistence
    O --> S{Platform?}
    P --> S
    Q --> S
    R --> S
    
    S -->|Web| H
    S -->|Desktop| I
    
    %% Subgraphs for better organization
    subgraph "Web Platform"
        C
        E
        H
        M
    end
    
    subgraph "Electron Platform"
        D
        F
        I
        J
        K
        L
        N
    end
    
    subgraph "Shared Logic"
        G
        O
        P
        Q
        R
    end
    
    classDef webNode fill:#e3f2fd,stroke:#2196f3,stroke-width:2px
    classDef electronNode fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    classDef sharedNode fill:#fff3e0,stroke:#ff9800,stroke-width:2px
    classDef storageNode fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    
    class C,E,H,M webNode
    class D,F,I,J,K,L,N electronNode
    class A,B,G,O,P,Q,R,S sharedNode
    class H,I,M,N storageNode
```

## Component Interaction Diagram

```mermaid
flowchart LR
    %% Components
    A[Dashboard Component] --> B[CartService]
    C[Product Detail Component] --> B
    D[Cart Component] --> B
    E[Checkout Component] --> B
    
    %% Navigation Flow
    A -->|Add to Cart| F[Show Notification]
    C -->|Add to Cart| F
    F -->|View Cart Action| D
    D -->|Proceed to Checkout| E
    
    %% Service Interactions
    B --> G[IDataApi Interface]
    G --> H{Platform?}
    H -->|Web| I[WebApiService]
    H -->|Desktop| J[ElectronApiService]
    
    %% Storage
    I --> K[localStorage]
    J --> L[Electron IPC]
    L --> M[File System]
    
    %% State Management
    B --> N[Angular Signals]
    N --> O[Reactive Updates]
    O --> P[UI Components]
    
    %% Badge Updates
    B --> Q[App Component]
    Q --> R[Navigation Badge]
    Q --> S[Toolbar Badge]
    
    subgraph "UI Components"
        A
        C
        D
        E
        Q
    end
    
    subgraph "Services"
        B
        G
        I
        J
    end
    
    subgraph "Storage"
        K
        L
        M
    end
    
    subgraph "State Management"
        N
        O
        P
    end
    
    classDef componentNode fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef serviceNode fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef storageNode fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef stateNode fill:#fff8e1,stroke:#f57c00,stroke-width:2px
    
    class A,C,D,E,Q,F,R,S componentNode
    class B,G,I,J serviceNode
    class K,L,M storageNode
    class N,O,P stateNode
```

## Order Processing Sequence

```mermaid
flowchart TD
    %% Order Creation
    A[User Clicks Submit Order] --> B[Validate All Forms]
    B --> C{Forms Valid?}
    C -->|No| D[Show Validation Errors]
    C -->|Yes| E[Create Order Object]
    
    %% Order Object Creation
    E --> F[Collect Billing Info]
    F --> G[Collect Shipping Info]
    G --> H[Collect Payment Info]
    H --> I[Calculate Order Summary]
    I --> J[Generate Order ID]
    J --> K[Set Order Status: Pending]
    
    %% Order Submission
    K --> L[Submit to CartService]
    L --> M[Save Order to Storage]
    M --> N{Save Success?}
    N -->|No| O[Show Error Message]
    N -->|Yes| P[Clear Cart]
    
    %% Success Flow
    P --> Q[Update Order Status: Processing]
    Q --> R[Show Success Message]
    R --> S[Navigate to Dashboard]
    
    %% Error Handling
    O --> T[Log Error]
    T --> U[Allow Retry]
    U --> A
    D --> V[Focus Invalid Field]
    V --> W[Wait for User Input]
    W --> A
    
    classDef startNode fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    classDef processNode fill:#e3f2fd,stroke:#2196f3,stroke-width:2px
    classDef decisionNode fill:#fff3e0,stroke:#ff9800,stroke-width:2px
    classDef errorNode fill:#ffebee,stroke:#f44336,stroke-width:2px
    classDef successNode fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    
    class A startNode
    class B,E,F,G,H,I,J,K,L,M,P,Q,R,S processNode
    class C,N decisionNode
    class D,O,T,U,V,W errorNode
```

These diagrams provide a comprehensive visual representation of the entire checkout flow, from initial product discovery through order completion, including error handling, cross-platform considerations, and component interactions.