# GPA Tracker - System & Database Design

This document provides a comprehensive overview of the **GPA Tracker** architecture, data flow, database schema, and frontend design.

---

## 🏗️ System Architecture (Full Stack)

The application follows a **Microservices Architecture** with a decoupled React frontend.

![Full System Architecture](./architecture_diagram.png)

### High-Level Component Diagram
```mermaid
graph TD
    Client[React Frontend] -->|REST / JWT| AuthSvc(Auth Service)
    Client -->|REST / JWT| ProjSvc(Project Service)
    Client -->|REST / JWT| TaskSvc(Task Service)

    AuthSvc -->|SQL| DB[(PostgreSQL Database)]
    ProjSvc -->|SQL| DB
    TaskSvc -->|SQL| DB

    subgraph "Backend Services"
        AuthSvc
        ProjSvc
        TaskSvc
    end

    subgraph "Shared Infrastructure"
        DB
        SharedLog[Evidence Engine]
    end

    TaskSvc -.->|Trigger Event| SharedLog
    SharedLog -.->|Append Only| DB
```

---

## 🎨 Frontend Design & Architecture

The frontend is built using **React (Vite)** and **TypeScript**, focusing on a component-based architecture with centralized API management.

![Frontend Architecture](./frontend_architecture.png)

### Frontend Component hierarchy
```mermaid
graph TD
    App[App.tsx / Router] --> Layout[Main Layout]
    Layout --> Nav[Side Navigation]
    
    subgraph "Core Pages"
        Layout --> Auth[Auth: Login/Register]
        Layout --> Dash[Dashboard]
        Layout --> MyGrp[My Groups]
        Layout --> GrpDet[Group Details]
        Layout --> MyTsk[My Tasks]
        Layout --> Scr[Accountability Scores]
        Layout --> Act[Evidence Activity]
    end

    subgraph "API Layer (Axios)"
        AuthApi[authApi.ts]
        ProjApi[projectsApi.ts]
        TaskApi[tasksApi.ts]
    end

    Auth --> AuthApi
    Dash --> ProjApi
    GrpDet --> TaskApi
    Act --> TaskApi
```

### 🛠️ Frontend Tech Stack
- **Framework**: React 18+ with Vite
- **Language**: TypeScript
- **State Management**: React Hooks (useState/useEffect) & Context API
- **Styling**: Vanilla CSS (Custom Glassmorphic Design)
- **API Client**: Axios with shared instance/interceptors
- **Icons**: Lucide React

---

## 🗄️ Database Design (ERD)

The database uses a relational schema in PostgreSQL. The key design principle is the **Evidence Audit Trail**.

### Entity Relationship Diagram
```mermaid
erDiagram
    USERS {
        string id PK
        string name
        string email
        string password
        string role
        timestamp createdAt
    }
    PROJECTS {
        string projectId PK
        string name
        string ownerId
        timestamp createdAt
    }
    PROJECT_MEMBERS {
        string projectId PK, FK
        string userId PK, FK
        string role
        timestamp joinedAt
    }
    TASKS {
        string taskId PK
        string projectId FK
        string ownerId FK
        string title
        string status
        timestamp deadline
        timestamp createdAt
    }
    EVIDENCE_EVENTS {
        string event_id PK
        string project_id FK
        string user_id FK
        string type
        string source
        timestamp timestamp
        jsonb metadata
    }

    USERS ||--o{ PROJECTS : "owns"
    PROJECTS ||--o{ PROJECT_MEMBERS : "has"
    USERS ||--o{ PROJECT_MEMBERS : "is member of"
    PROJECTS ||--o{ TASKS : "contains"
    PROJECTS ||--o{ EVIDENCE_EVENTS : "logs"
    USERS ||--o{ EVIDENCE_EVENTS : "performs"
```

---

## 📋 Table Descriptions

| Table Name | Description | Key Columns |
| :--- | :--- | :--- |
| **`users`** | Stores user identity, credentials, and roles. | `email` (unique), `password` (hashed) |
| **`projects`** | Project containers created by Owners. | `ownerId`, `name` |
| **`project_members`** | Junction table for Many-to-Many relationship. | `projectId`, `userId`, `role` |
| **`tasks`** | Specific units of work assigned within a project. | `status` (CREATED, IN_PROGRESS, DONE, APPROVED) |
| **`evidence_events`** | **The Audit Log.** Every status change is recorded here. | `type`, `timestamp`, `metadata` |

---

## 🔄 Core Workflow: Action-as-Evidence

1.  **Task Creation**: entry made in `tasks` + `TASK_CREATED` event.
2.  **Member Action**: `tasks` status updated + `STATUS_CHANGED` event with server-side timestamp.
3.  **Leader Validation**: `TASK_APPROVED` event logged.
4.  **Score Calculation**: Backend queries `evidence_events` to calculate the final accountability score based on *validated* work only.
