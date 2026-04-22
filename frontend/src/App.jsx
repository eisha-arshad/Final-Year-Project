import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/home/Login';
import ProtectedRoute from './components/home/ProtectedRoute';

import AdminDashboard from './components/admin/AdminDashboard';
import CreateUsers from './components/admin/CreateUsers';
import ManageUsers from './components/admin/ManageUsers';
import EditUser from './components/admin/EditUsers';
import AllProjects from './components/admin/AllProjects';

import SupervisorDashboard from './components/supervisor/SupervisorDashboard';
import CreateNewProject from './components/supervisor/CreateNewProject';
import EvaluationList from './components/supervisor/EvaluationList';
import SupervisorProjects from './components/supervisor/SupervisorProjects';
import CoSupervisorProjects from './components/supervisor/CoSupervisorProjects';

import StudentDashboard from './components/student/StudentDashboard';
import MyProjectDetail from './components/student/MyProjectDetail';
import FileSubmission from './components/student/FileSubmission';

import './App.css';

function App() {
  return (
    <Routes>
      {/* root -> /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* public login */}
      <Route path="/login" element={<Login />} />

      {/* admin */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin','dept_admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route path="createusers" element={<CreateUsers />} />
        <Route path="manage-users" element={<ManageUsers />} />
        <Route path="all-projects" element={<AllProjects />} />
      </Route>

      {/* admin edit user (top-level) */}
      <Route
        path="/edit-user/:id"
        element={
          <ProtectedRoute allowedRole="admin">
            <EditUser />
          </ProtectedRoute>
        }
      />

      {/* supervisor */}
      <Route
        path="/supervisor-dashboard"
        element={
          <ProtectedRoute allowedRole="supervisor">
            <SupervisorDashboard />
          </ProtectedRoute>
        }
      >
        <Route path="createnewproject" element={<CreateNewProject />} />
        <Route path="evaluation" element={<EvaluationList />} />
        <Route path="supervisor-projects" element={<SupervisorProjects />} />
        <Route path="cosupervisor-projects" element={<CoSupervisorProjects/>} />
      </Route>

      {/* student */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      >
        <Route path="filesubmission" element={<FileSubmission />} />
        <Route path="myprojectdetail" element={<MyProjectDetail />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
