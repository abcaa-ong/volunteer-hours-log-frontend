import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

// Componentes
import PrivateRoute from './components/common/PrivateRoute.jsx';
import App from './App.jsx';

// Páginas de Autenticação
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';

// Páginas do Volunteer
import VolunteerDashboard from './pages/volunteer/Dashboard.jsx';
import VolunteerProfile from './pages/volunteer/Profile.jsx';
import VolunteerActivities from './pages/volunteer/Activities.jsx';
import VolunteerReports from './pages/volunteer/Reports.jsx';

// Páginas do Admin
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminVolunteers from './pages/admin/Volunteers.jsx';
import AdminApprovals from './pages/admin/Approvals.jsx';
import AdminDepartments from './pages/admin/Departments.jsx';

// Páginas compartilhadas
import Ranking from './pages/shared/Ranking.jsx';

// Configuração das rotas
const router = createBrowserRouter([
  // Rotas Públicas
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
  {
    path: '/reset-password',
    element: <ResetPassword />
  },

  // Rota raiz (redireciona baseado no tipo de usuário)
  {
    path: '/',
    element: (
      <PrivateRoute>
        <App />
      </PrivateRoute>
    )
  },

  // Rotas do VOLUNTEER
  {
    path: '/volunteer/dashboard',
    element: (
      <PrivateRoute>
        <VolunteerDashboard />
      </PrivateRoute>
    )
  },
  {
    path: '/volunteer/profile',
    element: (
      <PrivateRoute>
        <VolunteerProfile />
      </PrivateRoute>
    )
  },
  {
    path: '/volunteer/activities',
    element: (
      <PrivateRoute>
        <VolunteerActivities />
      </PrivateRoute>
    )
  },
  {
    path: '/volunteer/reports',
    element: (
      <PrivateRoute>
        <VolunteerReports />
      </PrivateRoute>
    )
  },
  {
    path: '/volunteer/ranking',
    element: (
      <PrivateRoute>
        <Ranking />
      </PrivateRoute>
    )
  },

  // Rotas do ADMIN
  {
    path: '/admin/dashboard',
    element: (
      <PrivateRoute adminOnly={true}>
        <AdminDashboard />
      </PrivateRoute>
    )
  },
  {
    path: '/admin/profile',
    element: (
      <PrivateRoute adminOnly={true}>
        <VolunteerProfile />
      </PrivateRoute>
    )
  },
  {
    path: '/admin/activities',
    element: (
      <PrivateRoute adminOnly={true}>
        <VolunteerActivities />
      </PrivateRoute>
    )
  },
  {
    path: '/admin/reports',
    element: (
      <PrivateRoute adminOnly={true}>
        <VolunteerReports />
      </PrivateRoute>
    )
  },
  {
    path: '/admin/volunteers',
    element: (
      <PrivateRoute adminOnly={true}>
        <AdminVolunteers />
      </PrivateRoute>
    )
  },
  {
    path: '/admin/approvals',
    element: (
      <PrivateRoute adminOnly={true}>
        <AdminApprovals />
      </PrivateRoute>
    )
  },
  {
    path: '/admin/departments',
    element: (
      <PrivateRoute adminOnly={true}>
        <AdminDepartments />
      </PrivateRoute>
    )
  },
  {
    path: '/admin/ranking',
    element: (
      <PrivateRoute adminOnly={true}>
        <Ranking />
      </PrivateRoute>
    )
  }
]);

// Renderiza a aplicação
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  </StrictMode>
);
