import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const AdminListWithEditModal = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Fetch all admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/admins');
        setAdmins(response.data.data.admins || []);
      } catch (err) {
        setError('Failed to load admins');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  // Open edit modal with admin data
  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    reset({
      name: admin.name,
      mobile: admin.mobile
    });
    setIsModalOpen(true);
  };

  // Open password change modal
  const openPasswordModal = (admin) => {
    setSelectedAdmin(admin);
    setIsPasswordModalOpen(true);
  };

  // Close all modals
  const closeModal = () => {
    setIsModalOpen(false);
    setIsPasswordModalOpen(false);
    setSelectedAdmin(null);
    setPasswordError('');
    setPasswordSuccess('');
  };

  // Update admin details
  const onSubmit = async (data) => {
    try {
      setUpdating(true);
      setError('');
      
      const response = await axios.patch(
        `http://localhost:3000/api/admins/${selectedAdmin._id}`,
        {
          name: data.name,
          mobile: data.mobile
        }
      );

      if (response.data.status === 'success') {
        setAdmins(admins.map(admin => 
          admin._id === selectedAdmin._id ? response.data.data.admin : admin
        ));
        closeModal();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update admin');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  // Update admin password
  const onPasswordSubmit = async (data) => {
    try {
      setUpdating(true);
      setPasswordError('');
      
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("New passwords don't match");
      }

      const response = await axios.patch(
        `http://localhost:3000/api/admins/${selectedAdmin._id}/password`,
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        }
      );

      if (response.data.status === 'success') {
        setPasswordSuccess('Password updated successfully!');
        setTimeout(() => {
          closeModal();
        }, 1500);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || err.message || 'Failed to update password');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading admins...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Management</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Mobile</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin._id} className="border-t">
                <td className="py-3 px-4">{admin.name}</td>
                <td className="py-3 px-4">{admin.email}</td>
                <td className="py-3 px-4">{admin.mobile}</td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(admin)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openPasswordModal(admin)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                      Change Password
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                Edit Admin: {selectedAdmin?.name}
              </h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    {...register('name', { 
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={selectedAdmin?.email || ''}
                    disabled
                    className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Mobile</label>
                  <input
                    type="tel"
                    {...register('mobile', {
                      required: 'Mobile number is required',
                      pattern: {
                        value: /^[0-9]{10,15}$/,
                        message: 'Please enter a valid mobile number (10-15 digits)'
                      }
                    })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.mobile && (
                    <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                Change Password for {selectedAdmin?.name}
              </h2>
              
              {passwordError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                  {passwordSuccess}
                </div>
              )}
              
              <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    {...register('currentPassword', { 
                      required: 'Current password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    {...register('newPassword', { 
                      required: 'New password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    {...register('confirmPassword', { 
                      required: 'Please confirm your new password'
                    })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updating ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminListWithEditModal;