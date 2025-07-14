import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditProfileForm = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const adminId = decodedToken.id;

        const response = await axios.get(`/api/admins/${adminId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmin(response.data.data.admin);
        reset(response.data.data.admin);
      } catch (error) {
        toast.error('Failed to fetch admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/admins/${admin._id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Profile updated successfully');
      setAdmin(response.data.data.admin);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Username</label>
            <input
              type="text"
              {...register('userName', { required: 'Username is required' })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.userName && (
              <p className="text-red-500 text-sm mt-1">{errors.userName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full p-2 border rounded bg-gray-100"
              disabled
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Mobile</label>
            <input
              type="text"
              {...register('mobile', { required: 'Mobile number is required' })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.mobile && (
              <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileForm;
