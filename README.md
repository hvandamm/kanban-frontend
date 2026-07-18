# Kanban Frontend

This is the user interface for the Kanban Board application. It connects to the Spring Boot backend to manage boards, tasks, and columns.

##  Prerequisites

Before you begin, ensure you have the following installed on your machine:
* **Node.js**: v22.23.x LTS (or compatible 22.x version)
* **npm**: (Comes bundled with Node.js)

---

##  Getting Started & Installation

Before starting you should setup the backend from https://github.com/hvandamm/kanban-spring-backend

Follow these steps to get the frontend development server running on your local machine.

### 1. Clone the Repository
If you haven't already cloned the entire project, navigate to your working directory and run:
```bash
git clone https://github.com/hvandamm/kanban-frontend.git
cd kanban-frontend
```

### 2. Install dependencies

```bash
npm install
```

and generate the api contract.

```bash
npm run generate:api
```

### 3. Run the application

```bash
npm run dev
```

you can see the interface at http://localhost:5173
