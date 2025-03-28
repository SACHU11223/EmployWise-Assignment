import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      } shadow-lg backdrop-blur-sm bg-opacity-80`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`text-xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            User Management
          </motion.div>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${
                darkMode ? 'text-yellow-400' : 'text-gray-600'
              }`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className={`p-2 rounded-lg ${
                darkMode ? 'text-red-400' : 'text-red-600'
              }`}
            >
              <LogOut size={20} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;