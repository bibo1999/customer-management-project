# Customer Relationship Management (CRM)

A customer management application built with **React**, **ASP.NET Core Web API**, **Entity Framework Core**, and **SQL Server**.

## Features

- Create, view, update, and delete customer records.
- Search customers by name or phone number.
- Client-side form validation.
- Loading, empty, and error states.
- Delete confirmation.
- Save-state handling to prevent duplicate submissions.
- Preserve entered form values when an API request fails.
- Responsive customer directory for desktop and mobile.

## Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- Lucide React

**Backend**
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server

## Project Structure

```text
customer-management-project/
├── backend/
│   └── CustomerManagement.Api/
│       ├── Controllers/
│       ├── Migrations/
│       ├── appsettings.json
│       └── CustomerManagement.Api.csproj
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── services/
    │   ├── App.jsx
    │   └── index.css
    ├── .env
    └── package.json
```

## Prerequisites

Install the following before running the project:

- .NET SDK compatible with the backend project.
- Node.js and npm.
- SQL Server, with a database instance accessible to the application.

## Setup Instructions

### 1. Configure the database

Configure the SQL Server connection string using the application's existing configuration. Ensure it points to an accessible SQL Server instance.

The application uses the `CustomerManagementDb` database.

### 2. Apply Entity Framework Core migrations

Open a terminal and run:

```powershell
cd backend/CustomerManagement.Api
dotnet restore
dotnet ef database update
```

If the `dotnet ef` command is unavailable, install the appropriate Entity Framework Core CLI tool version and ensure the project's EF Core design package is installed.

### 3. Run the backend

From the backend project directory:

```powershell
dotnet run --urls http://localhost:5080
```

The API should be available at:

`http://localhost:5080`

Swagger documentation is available at:

`http://localhost:5080/swagger`

### 4. Configure and run the frontend

Open a second terminal:

```powershell
cd frontend
npm install
```

Configure the frontend `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5080/api
```

Start the development server:

```powershell
npm run dev
```

Open the local URL printed by Vite, normally:

`http://localhost:5173`

Keep both the frontend and backend running while using the application.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/Customers` | Retrieve customers |
| GET | `/api/Customers?search=Ahmed` | Search customers |
| GET | `/api/Customers/{id}` | Retrieve a customer |
| POST | `/api/Customers` | Create a customer |
| PUT | `/api/Customers/{id}` | Update a customer |
| DELETE | `/api/Customers/{id}` | Delete a customer |

Customer records include a full name, phone number, optional email address, creation timestamp, and database-generated ID.

## Build Verification

Frontend:

```powershell
cd frontend
npm run build
```

Backend:

```powershell
cd backend/CustomerManagement.Api
dotnet build
```

## Notes

- Ensure the configured SQL Server instance is running before applying migrations or using database operations.
- Keep local credentials and sensitive connection strings out of source control.
- Do not commit `node_modules`, frontend build output, or generated build directories.
