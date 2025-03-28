import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Users from './pages/Users';
import Navbar from './components/Navbar';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Router>
      <div className={darkMode ? 'dark' : ''}>
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/users"
              element={
                <PrivateRoute>
                  <>
                    <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                    <Users darkMode={darkMode} />
                  </>
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/users" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;