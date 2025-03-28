import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Search, ChevronDown, X } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { getUsers, updateUser, deleteUser } from '../utils/api';
import type { User } from '../types';
import { useDebounce } from '../hooks/useDebounce';

interface UsersProps {
  darkMode: boolean;
}

type SortDirection = 'asc' | 'desc';

const Users: React.FC<UsersProps> = ({ darkMode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  // Save filter preferences to localStorage
  useEffect(() => {
    const savedFilters = {
      selectedLetter,
      sortDirection,
      selectedDomains: Array.from(selectedDomains)
    };
    localStorage.setItem('userFilters', JSON.stringify(savedFilters));
  }, [selectedLetter, sortDirection, selectedDomains]);

  // Load saved filters on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('userFilters');
    if (savedFilters) {
      const { selectedLetter, sortDirection, selectedDomains } = JSON.parse(savedFilters);
      setSelectedLetter(selectedLetter);
      setSortDirection(sortDirection);
      setSelectedDomains(new Set(selectedDomains));
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getUsers(currentPage);
      setUsers(response.data);
      setTotalPages(response.total_pages);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique email domains
  const emailDomains = useMemo(() => {
    const domains = new Set<string>();
    users.forEach(user => {
      const domain = user.email.split('@')[1];
      domains.add(domain);
    });
    return Array.from(domains);
  }, [users]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        const email = user.email.toLowerCase();
        const searchMatch = debouncedSearchTerm
          ? fullName.includes(debouncedSearchTerm.toLowerCase()) ||
            email.includes(debouncedSearchTerm.toLowerCase())
          : true;

        const letterMatch = selectedLetter
          ? user.first_name.charAt(0).toLowerCase() === selectedLetter.toLowerCase()
          : true;

        const domainMatch = selectedDomains.size > 0
          ? selectedDomains.has(user.email.split('@')[1])
          : true;

        return searchMatch && letterMatch && domainMatch;
      })
      .sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return sortDirection === 'asc'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
  }, [users, debouncedSearchTerm, selectedLetter, selectedDomains, sortDirection]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (userId: number) => {
    try {
      await deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, {
        first_name: selectedUser.first_name,
        last_name: selectedUser.last_name,
        email: selectedUser.email
      });
      setUsers(users.map(user => 
        user.id === selectedUser.id ? selectedUser : user
      ));
      setIsEditModalOpen(false);
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const toggleDomain = (domain: string) => {
    const newDomains = new Set(selectedDomains);
    if (newDomains.has(domain)) {
      newDomains.delete(domain);
    } else {
      newDomains.add(domain);
    }
    setSelectedDomains(newDomains);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      {/* Search and Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-8 p-6 rounded-xl backdrop-blur-lg ${
          darkMode
            ? 'bg-gray-800/80 text-white'
            : 'bg-white/80'
        } shadow-lg`}
      >
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name or email..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
        </div>

        {/* Filter Toggle */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              darkMode
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100'
            }`}
          >
            <span>Filters</span>
            <ChevronDown
              className={`transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
              size={16}
            />
          </motion.button>

          {/* Filter Panel */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute left-0 right-0 mt-2 p-4 rounded-lg shadow-lg z-10 ${
                  darkMode
                    ? 'bg-gray-700'
                    : 'bg-white'
                }`}
              >
                {/* First Letter Filter */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Filter by First Letter</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
                      <motion.button
                        key={letter}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedLetter(selectedLetter === letter ? '' : letter)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          selectedLetter === letter
                            ? 'bg-blue-500 text-white'
                            : darkMode
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        {letter}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Sort Direction */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Sort Direction</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSortDirection('asc')}
                      className={`px-4 py-2 rounded-lg ${
                        sortDirection === 'asc'
                          ? 'bg-blue-500 text-white'
                          : darkMode
                          ? 'bg-gray-600 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      A to Z
                    </button>
                    <button
                      onClick={() => setSortDirection('desc')}
                      className={`px-4 py-2 rounded-lg ${
                        sortDirection === 'desc'
                          ? 'bg-blue-500 text-white'
                          : darkMode
                          ? 'bg-gray-600 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      Z to A
                    </button>
                  </div>
                </div>

                {/* Email Domain Filter */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Filter by Email Domain</h3>
                  <div className="flex flex-wrap gap-2">
                    {emailDomains.map((domain) => (
                      <motion.button
                        key={domain}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleDomain(domain)}
                        className={`px-3 py-1 rounded-full flex items-center ${
                          selectedDomains.has(domain)
                            ? 'bg-blue-500 text-white'
                            : darkMode
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        {domain}
                        {selectedDomains.has(domain) && (
                          <X size={14} className="ml-2" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Users Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-6 rounded-xl shadow-lg ${
                  darkMode
                    ? 'bg-gray-800 text-white'
                    : 'bg-white'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={user.avatar}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(user)}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-8"
            >
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No users found matching your search criteria
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <motion.button
            key={page}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === page
                ? 'bg-blue-500 text-white'
                : darkMode
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-800'
            } shadow-md transition-colors`}
          >
            {page}
          </motion.button>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`w-full max-w-md p-6 rounded-xl shadow-xl ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h2 className="text-2xl font-bold mb-4">Edit User</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  value={selectedUser.first_name}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, first_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  value={selectedUser.last_name}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, last_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Users;