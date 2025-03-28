# Task Management API

A RESTful API for managing tasks, projects, and users built with Express.js, TypeScript, Sequelize, and SQLite.

## Features

- Full CRUD operations for Tasks, Users, Projects, and Tags
- SQLite database with Sequelize ORM
- TypeScript implementation
- RESTful API endpoints
- Proper error handling
- Data validation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The server will start on port 3000 by default.

## API Endpoints

### Tasks

- GET `/api/tasks` - Get all tasks
- GET `/api/tasks/:id` - Get a specific task
- POST `/api/tasks` - Create a new task
  ```json
  {
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the API",
    "status": "pending",
    "dueDate": "2024-04-01T00:00:00.000Z",
    "priority": "high",
    "userId": 1,
    "projectId": 1
  }
  ```
- PUT `/api/tasks/:id` - Update a task
  ```json
  {
    "title": "Updated task title",
    "description": "Updated task description",
    "status": "in_progress",
    "dueDate": "2024-04-15T00:00:00.000Z",
    "priority": "medium"
  }
- DELETE `/api/tasks/:id` - Delete a task

### Users

- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get a specific user
- POST `/api/users` - Create a new user
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- PUT `/api/users/:id` - Update a user
  ```json
  {
    "username": "johndoe_updated",
    "email": "john.updated@example.com",
    "firstName": "John",
    "lastName": "Doe-Smith"
  }
  ```
- DELETE `/api/users/:id` - Delete a user

### Projects

- GET `/api/projects` - Get all projects
- GET `/api/projects/:id` - Get a specific project
- POST `/api/projects` - Create a new project
  ```json
  {
    "name": "Website Redesign",
    "description": "Redesign company website with modern UI",
    "status": "active",
    "startDate": "2024-03-01T00:00:00.000Z",
    "endDate": "2024-06-01T00:00:00.000Z",
    "userId": 1
  }
  ```
- PUT `/api/projects/:id` - Update a project
  ```json
  {
    "name": "Website Redesign 2.0",
    "description": "Updated project description",
    "status": "in_progress",
    "endDate": "2024-07-01T00:00:00.000Z"
  }
  ```
- DELETE `/api/projects/:id` - Delete a project

### Tags

- GET `/api/tags` - Get all tags
- GET `/api/tags/:id` - Get a specific tag
- POST `/api/tags` - Create a new tag
  ```json
  {
    "name": "Frontend",
    "color": "#FF5733"
  }
  ```
- PUT `/api/tags/:id` - Update a tag
  ```json
  {
    "name": "Frontend Development",
    "color": "#FF5734"
  }
  ```
- DELETE `/api/tags/:id` - Delete a tag

## Data Models

### Task
- id (INTEGER, PRIMARY KEY)
- title (STRING)
- description (TEXT)
- status (ENUM: 'pending', 'in_progress', 'completed')
- dueDate (DATE)
- priority (ENUM: 'low', 'medium', 'high')
- userId (FOREIGN KEY)
- projectId (FOREIGN KEY)

### User
- id (INTEGER, PRIMARY KEY)
- username (STRING, UNIQUE)
- email (STRING, UNIQUE)
- password (STRING)
- firstName (STRING)
- lastName (STRING)

### Project
- id (INTEGER, PRIMARY KEY)
- name (STRING)
- description (TEXT)
- status (ENUM: 'active', 'completed', 'archived')
- startDate (DATE)
- endDate (DATE)
- userId (FOREIGN KEY)

### Tag
- id (INTEGER, PRIMARY KEY)
- name (STRING, UNIQUE)
- color (STRING) 

