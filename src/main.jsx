import React from 'react';
import ReactDOM from 'react-dom/client';
import { ToastProvider } from './contexts/ToastContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import { AuthProvider } from './contexts/AuthContext';
import { TeacherProvider } from './contexts/TeacherContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
          <TeacherProvider>
            <App />
          </TeacherProvider>
        </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  </React.StrictMode>
);