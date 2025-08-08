# Document Sharing System - Frontend

A modern React-based frontend for the Document Sharing System with role-based access control, built using React, Bootstrap, and modern web technologies.

## 📁 Project Structure

```
task/
├── Frontend/               # React Frontend Application (this directory)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Login.js    # Login form component
│   │   │   ├── Register.js # Registration form component
│   │   │   ├── Navigation.js # Navigation bar component
│   │   │   └── ProtectedRoute.js # Route protection component
│   │   ├── contexts/       # React Context providers
│   │   │   └── AuthContext.js # Authentication context
│   │   ├── pages/          # Main page components
│   │   │   ├── Dashboard.js # Dashboard overview page
│   │   │   ├── MyFiles.js  # Personal files management
│   │   │   ├── TeamFiles.js # Team shared files view
│   │   │   └── AdminPortal.js # Admin user management
│   │   ├── services/       # API and utility services
│   │   │   └── api.js      # API service layer
│   │   ├── App.js          # Main application component
│   │   └── index.js        # Application entry point
│   ├── public/             # Static assets
│   ├── package.json        # Dependencies and scripts
│   └── README.md           # This file
└── java backend/           # Java Spring Boot Backend (separate)
    └── ...                 # Backend files (unchanged)
```

## Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control** (User/Admin)
- **Registration system** with password validation
- **Protected routes** based on authentication status and user roles

### 📁 My Files
- **Upload documents** with metadata (name, description)
- **View uploaded documents** with file details and preview
- **Delete own files** with confirmation dialogs
- **Share files via links** with team sharing options
- **Search and filter** documents by name or description
- **File management** with edit document details

### 👥 Team Files
- **View team-shared files** from all team members
- **Download team documents** with access control
- **View-only access** for regular users
- **Admin delete capability** for administrators
- **Search team documents** by name, description, or owner

### 🛡️ Admin Portal
- **User management table** with comprehensive user information
- **Add new users** with role assignment
- **Edit user details** including roles and status
- **Delete users** with confirmation prompts
- **User statistics dashboard** with metrics
- **Search and filter users** across all fields

### 📊 Dashboard
- **Overview statistics** showing file counts and storage usage
- **Recent files display** with quick access
- **Quick action buttons** for common tasks
- **System status indicators** for operational awareness
- **Role-based widgets** showing relevant information

## Technology Stack

- **React 18** - Modern React with hooks and functional components
- **React Router 6** - Client-side routing with protected routes
- **React Bootstrap** - Bootstrap 5 components for React
- **Bootstrap Icons** - Comprehensive icon library
- **Axios** - HTTP client for API communication
- **Context API** - State management for authentication

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Java backend running on port 8080 (located in `../java backend/`)

## Installation & Setup

1. **Navigate to the Frontend directory:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration (Optional):**
   Create a `.env` file in the Frontend directory:
   ```
   REACT_APP_API_URL=http://localhost:8080/api
   ```

## Running the Application

### 🚀 Development Mode

1. **Start the Java backend first:**
   ```bash
   # In a separate terminal, navigate to the java backend directory
   cd ../java\ backend/
   # Run the Spring Boot application (make sure it's running on port 8080)
   ```

2. **Start the React frontend:**
   ```bash
   # From the Frontend directory
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### 🏗️ Production Build

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Available Scripts

- `npm start` - Runs the app in development mode on port 3000
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## API Integration

The frontend integrates with the Java Spring Boot backend through a comprehensive API layer:

### Backend Requirements
- Java Spring Boot backend must be running on `http://localhost:8080`
- Backend endpoints must be available at `/api/*`

### Authentication Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration

### Document Management
- `POST /documents/upload` - Upload documents
- `GET /documents/my-files` - Get user's documents
- `GET /documents/team-files` - Get team shared documents
- `GET /documents/{id}/download` - Download documents
- `POST /documents/{id}/share` - Share documents
- `PUT /documents/{id}` - Update document metadata
- `DELETE /documents/{id}` - Delete documents

### Admin Operations
- `GET /admin/users` - Get all users
- `POST /admin/users` - Create new users
- `PUT /admin/users/{id}` - Update user details
- `DELETE /admin/users/{id}` - Delete users

## User Roles & Permissions

### Regular Users
- Upload and manage personal documents
- View and download team shared files
- Share own documents with team
- Access dashboard and file statistics

### Administrators
- All user capabilities
- Access to admin portal
- Create, edit, and delete users
- Delete team shared files
- View system-wide statistics

## Security Features

- **JWT Token Management** - Secure authentication with automatic token refresh
- **Protected Routes** - Role-based route protection
- **Input Validation** - Client-side validation for all forms
- **XSS Protection** - Sanitized input handling
- **Secure File Upload** - File type and size validation

## Development Guidelines

### Code Structure
- **Components** - Functional components with hooks
- **State Management** - Context API for global state
- **Styling** - Bootstrap classes with custom CSS when needed
- **Error Handling** - Comprehensive error handling with user feedback
- **Loading States** - Loading indicators for all async operations

### Features by Page

#### Login/Register Pages
- Modern, responsive design
- Form validation with real-time feedback
- Password strength requirements
- Redirect to intended page after login

#### Dashboard
- Statistics cards showing file counts and storage
- Recent files table with quick actions
- Quick access buttons for common tasks
- System status indicators

#### My Files
- File upload with metadata support
- Document management with full CRUD operations
- Share settings with team collaboration
- Search and filter capabilities
- File type icons and size formatting

#### Team Files
- View all team-shared documents
- Download capabilities with access control
- Admin delete functionality
- Owner information display
- Search across all team files

#### Admin Portal
- Comprehensive user management interface
- User statistics dashboard
- Role-based permissions management
- User activity tracking
- Bulk operations support

## Troubleshooting

### Common Issues

1. **Backend Connection Error:**
   - Ensure Java backend is running on port 8080
   - Check if backend APIs are accessible at `http://localhost:8080/api`

2. **CORS Issues:**
   - Backend should have CORS enabled for `http://localhost:3000`
   - Check backend CORS configuration

3. **Authentication Issues:**
   - Clear browser localStorage and cookies
   - Ensure JWT token format matches backend expectations

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style and structure
2. Add appropriate error handling and loading states
3. Include responsive design considerations
4. Test all user interactions and edge cases
5. Update documentation for any new features

## License

This project is part of the Document Sharing System and follows the same licensing terms as the main project. 