# PV Workflow Manager

A powerful, visual workflow management application built with React and TypeScript. Design custom workflows with an intuitive drag-and-drop canvas, manage project statuses, assign tasks, and track progress through customizable approval processes.

![Workflow Canvas](https://via.placeholder.com/800x400/f0f8ff/1976d2?text=Interactive+Workflow+Designer)

## ✨ Features

### 🎨 Visual Workflow Designer
- **Interactive Canvas**: Drag-and-drop workflow designer built with Konva
- **Real-time Visualization**: See your workflows come to life with connected status nodes
- **Zoom & Pan**: Navigate large workflows with smooth zoom and pan controls
- **Persistent Layouts**: Workflow positions are automatically saved and restored

### 📊 Project Management
- **Status Tracking**: Monitor projects as they move through your custom workflows
- **Rich Project Cards**: View project details, task completion, and status at a glance
- **History Tracking**: Complete audit trail of all status changes with timestamps and user attribution
- **Search & Filter**: Quickly find projects with powerful search functionality

### ✅ Task Management
- **Task Assignment**: Assign specific tasks to users for each workflow transition
- **Progress Tracking**: Visual indicators show task completion status
- **Deadline Management**: Set and track task deadlines with date formatting
- **User Dashboard**: Personalized task lists for each team member

### 🔐 Approval Workflows
- **Flexible Approvals**: Configure approval requirements by role or specific users
- **Visual Indicators**: Clearly see which transitions require approval
- **Approval History**: Track who approved each transition and when
- **Role-based Permissions**: Different views and capabilities for admins vs users

### 🎭 Role Management
- **Admin Role**: Full access to create/edit workflows, statuses, and tasks
- **User Role**: Focus on assigned tasks and project status changes
- **Role Switching**: Easy toggle for testing different permission levels
- **Secure Operations**: Role-based access control throughout the application

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pvworkflowmanager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to access the application

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 🎯 How to Use

### For Administrators

#### 1. Define Your Statuses
- Go to **Status Management** to create status definitions
- Set colors, names, and descriptions for each status
- Configure which entity types (projects, campaigns, designs) can use each status

#### 2. Design Your Workflows
- Visit **Workflow Management** to create new workflows
- Use the visual canvas to drag status nodes and connect them
- Click the right edge of a status to start drawing connections
- Click the left edge of another status to complete the connection

#### 3. Configure Transitions
- Set approval requirements for specific transitions
- Assign approver roles (admin, user) or specific users
- Add tasks that must be completed before transitions can occur

#### 4. Assign Tasks
- Use **Task Management** to create and assign tasks
- Link tasks to specific workflow transitions
- Set deadlines and completion requirements

### For Users

#### 1. View Your Projects
- The main **Projects** dashboard shows all your accessible projects
- See current status, task completion, and project metadata
- Click "Completed tasks: X/Y" to view detailed task information

#### 2. Complete Tasks
- Your assigned tasks appear in the task list
- Mark tasks as complete when finished
- Undo completions if needed (admin permission may be required)

#### 3. Change Project Status
- Click "Change Status" on any project to see available transitions
- The system shows approval requirements and blocking tasks
- Only valid transitions based on workflow rules are displayed

#### 4. Track History
- Click "View History" to see complete status change audit trail
- View timestamps, responsible users, and approval information

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 19 + TypeScript
- **Canvas**: Konva.js for interactive workflow visualization
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Custom CSS with design system and CSS variables
- **Data Storage**: Browser localStorage (no backend required)
- **Routing**: React Router for navigation

### Performance Optimizations
- **React.memo** for component memoization
- **useMemo** for expensive computations
- **useCallback** for optimized event handlers
- **Consolidated CSS** with design system
- **Custom hooks** for reusable logic

### Key Components
- **WorkflowCanvas**: Interactive drag-and-drop workflow designer
- **ProjectList**: Main dashboard with project cards and filtering
- **StatusChangeModal**: Guided status transition interface
- **UserTaskList**: Personalized task management
- **Base Components**: Reusable UI components (buttons, inputs, modals)

## 💾 Data Management

### Storage
All data is stored locally in your browser's localStorage, making this a zero-configuration application:
- No server setup required
- No database installation needed
- Data persists between browser sessions
- Automatic data versioning and migration

### Mock Data
The application comes with sample data to demonstrate features:
- Example workflows for projects, campaigns, and designs
- Sample users with different roles
- Pre-configured tasks and approval flows
- Test projects at various status levels

## 🎨 Customization

### Styling
The application uses a comprehensive design system:
- **CSS Variables**: Centralized colors, spacing, and typography
- **Component Classes**: Consistent styling across all UI elements
- **Responsive Design**: Works on desktop and tablet devices
- **Theme Support**: Easy to modify colors and styles

### Workflows
Create workflows that match your organization:
- **Custom Statuses**: Define statuses specific to your process
- **Flexible Connections**: Connect statuses in any pattern
- **Approval Levels**: Multiple approval requirements per transition
- **Task Dependencies**: Block transitions until tasks are complete

## 🔧 Development

### Available Scripts
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

### Project Structure
```
src/
├── components/     # React components
│   ├── common/    # Reusable base components
│   └── ...        # Feature-specific components
├── pages/         # Top-level page components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── styles/        # CSS files and design system
├── data/          # Data access and mock data
└── types/         # TypeScript type definitions
```

### Adding Features
1. Define TypeScript interfaces in `src/types/`
2. Add data operations in `src/data/dataAccess.ts`
3. Create components using base components from `src/components/common/`
4. Follow the established CSS patterns and performance optimizations

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Follow the existing code patterns and TypeScript conventions
4. Add appropriate documentation
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the browser console for error messages
2. Verify your browser supports localStorage
3. Clear localStorage to reset to fresh sample data
4. Check that JavaScript is enabled in your browser

---

**Built with ❤️ using React, TypeScript, and modern web technologies.**