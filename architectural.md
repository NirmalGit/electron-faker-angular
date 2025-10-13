# System Architecture Documentation

## C1 – System Context Diagram

Shows how the overall system interacts with external entities (users, APIs, OS).

```mermaid
graph LR
A["End User"]
B["Angular 20 App (Cloud/Desktop)"]
C["FakeStoreAPI / Company REST Service"]
D["Operating System (Windows/macOS/Linux)"]
E["Electron Main Process (Desktop only)"]

A -->|uses| B
B -->|fetches data| C
B -->|runs within| E
E -->|accesses| D
E -->|requests external APIs| C
```

**Explanation**
- The user interacts with one UI — Angular 20.
- In cloud mode, Angular talks directly to FakeStore API.
- In desktop mode, Angular runs inside Electron → Electron handles OS & API access.

---

## 🧩 C2 – Container Diagram

Shows main runtime containers and responsibilities.

```mermaid
graph TB
subgraph Cloud_Mode["🌐 Cloud Mode"]
  A1["Angular Renderer (Browser)"]
  A2["WebApiService (HttpClient)"]
  A3["FakeStoreAPI (REST Server)"]
  A1 -->|calls| A2
  A2 -->|GET/POST| A3
end

subgraph Desktop_Mode["💻 Desktop Mode (Electron)"]
  B1["Angular Renderer (Chromium View)"]
  B2["Electron Preload Bridge (Secure IPC)"]
  B3["Electron Main Process (Node.js Layer)"]
  B4["FakeStoreAPI / Internal Service"]
  B5["Operating System Services (FS, Tray, Notifications)"]

  B1 -->|invoke| B2
  B2 -->|ipcRenderer.invoke| B3
  B3 -->|fetch HTTP| B4
  B3 -->|access| B5
end
```

**Explanation**
- Cloud mode: Angular → HttpClient → API.
- Desktop mode: Angular → Preload → Main Process → API/OS.
- Both share identical Angular components, routing, and Material UI.

---

## ⚙️ C3 – Component Diagram

Shows the Angular + Electron internal structure and dependency boundaries.

```mermaid
graph TB
subgraph Angular20_App["Angular 20 Application"]
  A1["DashboardComponent"]
  A2["ProductService"]
  A3["IDataApi (Interface)"]
  A4["WebApiService / ElectronApiService (Adapters)"]
  A5["Angular Material UI Modules"]
  A6["Signals & Reactive State"]

  A1 -->|injects| A2
  A2 -->|depends on| A3
  A3 -->|implemented by| A4
  A1 -->|renders UI| A5
  A2 -->|updates state| A6
end

subgraph Electron_Layer["Electron Integration"]
  B1["Preload.ts (ContextBridge)"]
  B2["IPC Handlers (product.ipc.ts)"]
  B3["Main.ts (Electron Lifecycle)"]
  B4["Logger / Config Loader Utilities"]
  B5["OS APIs (Notifications, Tray, FS)"]

  B1 -->|exposes| A3
  B1 -->|communicates| B2
  B2 -->|registered in| B3
  B3 -->|uses| B4
  B3 -->|accesses| B5
end
```

**Explanation**
- IDataApi acts as the abstraction boundary.
- Angular never knows whether it’s calling Electron or HTTP.
- Electron side isolates Node and OS logic behind IPC.

---

## 🔍 C4 – Code/Interaction Flow Diagram

Shows the step-by-step runtime call chain for a “Get All Products” request.

```mermaid
sequenceDiagram
participant UI as "DashboardComponent"
participant SVC as "ProductService"
participant API as "IDataApi (Web/Electron)"
participant PRE as "Preload Bridge"
participant MAIN as "Electron Main Process"
participant EXT as "FakeStoreAPI Server"

UI->>SVC: calls loadProducts()
SVC->>API: getAllProducts()

alt Cloud Mode
  API->>EXT: HttpClient GET /products
  EXT-->>API: JSON response
else Desktop Mode
  API->>PRE: window.electronAPI.getAllProducts()
  PRE->>MAIN: ipcRenderer.invoke('products:getAll')
  MAIN->>EXT: fetch('https://fakestoreapi.com/products')
  EXT-->>MAIN: JSON data
  MAIN-->>PRE: IPC result
  PRE-->>API: Promise resolve
end

API-->>SVC: Product array
SVC-->>UI: Signal update + render
```

**Explanation**
- Both paths end up delivering identical product data to the component.
- Desktop uses IPC, web uses HttpClient.
- UI remains unaware of environment differences.

---

## 🧠 Summary: Architectural Value

| Layer                                   | Purpose                              | Shared Between Cloud & Desktop |
|------------------------------------------|--------------------------------------|:-----------------------------:|
| Angular Components + Signals + Material UI | Pure presentation & state            | ✅ Yes                        |
| ProductService + IDataApi interface      | Business abstraction boundary         | ✅ Yes                        |
| WebApiService                           | Cloud-specific API access             | 🌐 Only                      |
| ElectronApiService + IPC Handlers        | Desktop bridge & system integration   | 💻 Only                      |
| Electron Main Process                    | Secure Node/OS access, logging, config| 💻 Only                      |

