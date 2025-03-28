import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/dashboard_Components/Sidebar';
import D_Navbar from '../../components/dashboard_Components/D_Navbar';
import AdminTable from '../../components/dashboard_Components/adminTable';
import AddAdminForm from '../../components/dashboard_Components/addAdminForm';

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch admins from API with improved error handling
  const fetchAdmins = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE}/api/admins`, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // If using cookies/sessions
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    const loadAdmins = async () => {
      try {
        const data = await fetchAdmins();
        if (mounted) {
          setAdmins(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    loadAdmins();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [retryCount]);

  const handleAddAdmin = (newAdmin) => {
    setAdmins([newAdmin, ...admins]); // Add new admin at the beginning
    setShowAddForm(false);
  };

  const handleUpdateAdmin = (updatedAdmin) => {
    setAdmins(admins.map(admin => 
      admin._id === updatedAdmin._id ? updatedAdmin : admin
    ));
  };

  const handleDeleteAdmin = async (id) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE}/api/admins/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // If using cookies/sessions
      });

      if (!response.ok) {
        throw new Error('Failed to delete admin');
      }

      setAdmins(admins.filter(admin => admin._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete admin. Please try again.');
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <D_Navbar />
        <div className="p-5">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Manage Admins</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Add New Admin
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto p-6 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-red-800">Error Loading Admins</h3>
              </div>
              <p className="mt-2 text-red-700">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {showAddForm && (
                <AddAdminForm 
                  onAdd={handleAddAdmin}
                  onCancel={() => setShowAddForm(false)}
                />
              )}
              <AdminTable 
                admins={admins}
                onUpdate={handleUpdateAdmin}
                onDelete={handleDeleteAdmin}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAdmins;