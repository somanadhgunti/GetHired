import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/routing/ProtectedRoute'
import RoleRoute from './components/routing/RoleRoute'
import { PageTransition } from './components/transitions/PageTransition'
import { AuthProvider } from './context/AuthContext'
import { TransitionProvider } from './context/TransitionContext'
import AuthPage from './pages/AuthPage'
import DashboardIndexRedirect from './pages/DashboardIndexRedirect'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import EmployerDashboard from './pages/employer/EmployerDashboard'
import EmployerPostJobPage from './pages/employer/EmployerPostJobPage'
import EmployerManageJobsPage from './pages/employer/EmployerManageJobsPage'
import EmployerJobDetailPage from './pages/employer/EmployerJobDetailPage'
import EmployerProfilePage from './pages/employer/EmployerProfilePage'
import WorkerDashboard from './pages/worker/WorkerDashboard'
import WorkerProfilePage from './pages/worker/WorkerProfilePage'
import WorkerJobsPage from './pages/worker/WorkerJobsPage'
import WorkerJobDetailPage from './pages/worker/WorkerJobDetailPage'
import WorkerApplicationsPage from './pages/worker/WorkerApplicationsPage'
import WorkerSavedJobsPage from './pages/worker/WorkerSavedJobsPage'
import './App.css'

export default function App() {
  return (
    <AuthProvider>
      <TransitionProvider>
        <PageTransition>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<DashboardLayout />}>
                <Route index element={<DashboardIndexRedirect />} />

                <Route element={<RoleRoute allowedRoles={['worker']} />}>
                  <Route path="worker" element={<WorkerDashboard />} />
                  <Route path="worker/profile" element={<WorkerProfilePage />} />
                  <Route path="worker/jobs" element={<WorkerJobsPage />} />
                  <Route path="worker/jobs/:jobId" element={<WorkerJobDetailPage />} />
                  <Route path="worker/saved" element={<WorkerSavedJobsPage />} />
                  <Route path="worker/applications" element={<WorkerApplicationsPage />} />
                </Route>

                <Route element={<RoleRoute allowedRoles={['employer']} />}>
                  <Route path="employer" element={<EmployerDashboard />} />
                  <Route path="employer/post-job" element={<EmployerPostJobPage />} />
                  <Route path="employer/jobs" element={<EmployerManageJobsPage />} />
                  <Route path="employer/jobs/:jobId" element={<EmployerJobDetailPage />} />
                  <Route path="employer/profile" element={<EmployerProfilePage />} />
                </Route>

                <Route element={<RoleRoute allowedRoles={['representative']} />}>
                  <Route path="admin" element={<AdminDashboard />} />
                </Route>
              </Route>
            </Route>

            <Route path="/dashboard" element={<Navigate to="/app" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </PageTransition>
      </TransitionProvider>
    </AuthProvider>
  )
}
