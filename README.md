# Trellcord - A Trello-inspired Project Management App

A modern, React-based project management application inspired by Trello, built with TypeScript and styled-components.

## 🚀 Features

### Authentication System
- **User Login/Registration**: Complete authentication flow with protected routes
- **Password Reset**: Forgot password and reset password functionality
- **User Sessions**: Persistent login sessions using localStorage

### User Interface Components
- **UserDropdown Component**: Custom dropdown menu for user actions
  - Displays user name and email
  - Settings navigation option
  - Logout functionality
  - Click-outside and escape key handling

### Settings Management
- **Comprehensive Settings Page**: Full-featured settings interface
  - **Profile Management**: Update name and email
  - **Password Change**: Secure password update with current password verification
  - **Notifications**: Toggle email notifications, push notifications, board updates, and mentions
  - **Privacy Settings**: Control profile and activity visibility
  - **Account Management**: Logout and account deletion options

### Dashboard & Board Management
- **Dashboard**: Main overview page with quick actions and recent boards
- **My Boards Page**: Dedicated board management interface
  - Grid and list view options
  - Board filtering (All, Starred, Recent)
  - Star/unstar boards functionality
  - Board actions menu (Edit, Duplicate, Share, Delete)

### Navigation System
- **Header Navigation**: 
  - Logo and branding
  - Search functionality
  - Notification bell
  - Settings button (connected to settings page)
  - User dropdown menu
- **Sidebar Navigation**: Quick access to all main sections
  - Dashboard
  - My Boards
  - Teams
  - Starred
  - Templates
  - Archive
  - Settings (connected to settings page)

## 🛠️ Technology Stack

### Frontend Framework & Libraries
- **React 18**: Modern React with functional components and hooks
- **TypeScript**: Type-safe development with full TypeScript integration
- **React Router**: Client-side routing with protected and public routes
- **Styled Components**: CSS-in-JS styling solution for component-based styling

### State Management
- **React Context API**: 
  - `AuthContext`: Manages user authentication state and methods
  - `BoardContext`: Manages board data and operations
- **React Hooks**: useState, useEffect, useContext, useReducer

### UI/UX Libraries
- **Lucide React**: Modern icon library for consistent iconography
- **Custom Styled Components**: Reusable styled components for consistent design

### Development Tools
- **Create React App**: Project bootstrapping and build configuration
- **ESLint & TypeScript**: Code quality and type checking

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── UserDropdown.tsx  # User menu dropdown component
│   ├── NewBoardModal.tsx # Modal for creating new boards
│   ├── JoinBoardModal.tsx # Modal for joining boards
│   ├── DeleteBoardModal.tsx # Modal for deleting boards
│   └── index.ts          # Component exports
├── context/              # React context providers
│   ├── AuthContext.tsx   # Authentication state management
│   └── BoardContext.tsx  # Board data management
├── pages/                # Main application pages
│   ├── LoginPage.tsx     # User login interface
│   ├── RegisterPage.tsx  # User registration interface
│   ├── DashboardPage.tsx # Main dashboard
│   ├── MyBoardsPage.tsx  # Board management page
│   ├── SettingsPage.tsx  # User settings interface
│   ├── ForgotPasswordPage.tsx # Password reset request
│   └── ResetPasswordPage.tsx  # Password reset form
├── types/                # TypeScript type definitions
│   └── index.ts          # Global type definitions
└── App.tsx               # Main application component with routing
```

## 🔧 Key Implementations

### Settings Integration
I implemented a comprehensive settings system that includes:

1. **Settings Page Connection**: Added `/settings` route to the main App.tsx router
2. **Navigation Integration**: Connected settings access from multiple points:
   - Header settings icon button
   - Sidebar settings menu item  
   - UserDropdown settings option
3. **Settings Features**:
   - Profile information management
   - Password change functionality
   - Notification preferences
   - Privacy controls
   - Account management with logout and delete options

### UserDropdown Enhancement
Enhanced the user experience by replacing simple user buttons with a comprehensive dropdown:

1. **User Information Display**: Shows user name and email
2. **Settings Access**: Direct link to settings page
3. **Logout Functionality**: Secure logout with navigation to login page
4. **Accessibility**: Keyboard navigation support (ESC key) and click-outside handling

### Component Architecture
Built with reusable, modular components:

1. **Styled Components**: Consistent styling with theme-based approach
2. **TypeScript Integration**: Full type safety across all components
3. **Context Providers**: Centralized state management for auth and board data
4. **Modal System**: Reusable modal components for different actions

### Route Protection
Implemented secure routing system:

1. **Protected Routes**: Authentication required for dashboard, boards, and settings
2. **Public Routes**: Login, register, and password reset accessible without authentication
3. **Auto-Redirect**: Automatic navigation based on authentication state

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trellcord
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🎨 Design System

### Color Palette
- Primary: `#667eea` (Blue gradient)
- Secondary: `#764ba2` (Purple gradient)
- Background: `#f8f9fa` (Light gray)
- Text Primary: `#2c3e50` (Dark blue-gray)
- Text Secondary: `#7f8c8d` (Medium gray)
- Accent: `#95a5a6` (Light gray)

### Typography
- Headers: Bold weights with consistent sizing
- Body text: 14px base size with good contrast ratios
- Interactive elements: Medium weight for better visibility

### Components
- Consistent border radius: 8px for cards, 6px for inputs
- Box shadows: Subtle shadows for depth and hierarchy
- Transitions: Smooth 0.2s transitions for all interactive elements

## 🔒 Security Features

- **Protected Routes**: Authentication required for sensitive pages
- **Token Management**: Secure token storage and validation
- **Form Validation**: Client-side validation for all forms
- **CSRF Protection**: Context-based state management prevents common attacks

## 📱 Responsive Design

- Mobile-first approach with responsive breakpoints
- Flexible grid systems for board layouts
- Touch-friendly interface elements
- Optimized for both desktop and mobile usage

## 🧪 Testing Considerations

The application is built with testability in mind:
- Separated business logic from UI components
- Context providers for easy mocking
- TypeScript for compile-time error detection
- Consistent component structure for reliable testing

---

This application demonstrates modern React development practices with TypeScript, providing a solid foundation for a project management tool with room for future enhancements and scaling.
