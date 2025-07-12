import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";

const AdminListWithCrud = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    clearErrors,
    getValues,
  } = useForm();

  // API base URL
  const API_URL = "/api/admins";

  // Fetch all admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmins(response.data.data?.admins || []);
      } catch (err) {
        toast.error("Failed to load admins");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  // Open modal with type and optional admin data
  const openModal = (type, admin = null) => {
    setModalType(type);
    setSelectedAdmin(admin);

    if (type === "edit" && admin) {
      reset({
        userName: admin.userName,
        email: admin.email,
        mobile: admin.mobile,
        role: admin.role,
      });
    } else if (type === "create") {
      reset({
        userName: "",
        email: "",
        mobile: "",
        password: "",
        role: "admin",
      });
    }

    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
    setModalType(null);
    clearErrors();
  };

  // Open delete confirmation modal
  const openDeleteModal = (admin) => {
    setAdminToDelete(admin);
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setAdminToDelete(null);
  };

  // Create new admin
  const handleCreate = async (data) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(API_URL, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins([...admins, response.data.data.admin]);
      toast.success("Admin created successfully");
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create admin");
      console.error(err);
    }
  };

  // Update admin details
  const handleUpdate = async (data) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/${selectedAdmin._id}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAdmins(
        admins.map((admin) =>
          admin._id === selectedAdmin._id ? response.data.data.admin : admin
        )
      );
      toast.success("Admin updated successfully");
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update admin");
      console.error(err);
    }
  };

  // Delete admin
  const handleDelete = async () => {
    if (!adminToDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${adminToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(admins.filter((admin) => admin._id !== adminToDelete._id));
      toast.success("Admin deleted successfully");
      closeDeleteModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete admin");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading admins...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Admin Management</h1>
        <button
          onClick={() => openModal("create")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto"
        >
          Add New Admin
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Username</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Mobile</th>
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.length > 0 ? (
                admins.map((admin) => (
                  <tr key={admin._id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">{admin.userName}</td>
                    <td className="py-3 px-4 break-all">{admin.email}</td>
                    <td className="py-3 px-4">{admin.mobile}</td>
                    <td className="py-3 px-4 capitalize">{admin.role}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openModal("edit", admin)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(admin)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr key="no-admins">
                  <td colSpan="5" className="py-4 text-center text-gray-500">
                    No admins found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Combined Modal for all operations */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-2">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl font-bold mb-4">
                {modalType === "create"
                  ? "Create New Admin"
                  : `Edit Admin: ${selectedAdmin?.userName}`}
              </h2>

              <form
                onSubmit={handleSubmit(
                  modalType === "create" ? handleCreate : handleUpdate
                )}
                className="space-y-4"
              >
                <>
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      {...register("userName", {
                        required: "Username is required",
                      })}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.userName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.userName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={modalType === "edit"}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Role *</label>
                    <input
                      type="text"
                      {...register("role", {
                        required: "Role is required",
                      })}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter role (e.g., admin)"
                    />
                    {errors.role && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.role.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">
                      Mobile *
                    </label>
                    <input
                      type="tel"
                      {...register("mobile", {
                        required: "Mobile number is required",
                      })}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.mobile && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.mobile.message}
                      </p>
                    )}
                  </div>

                  {modalType === "create" && (
                    <div>
                      <label className="block text-gray-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                  )}
                </>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {modalType === "create" ? "Create" : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-2">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
              <p className="mb-6">
                Are you sure you want to delete admin{" "}
                <strong>{adminToDelete?.userName}</strong> (
                {adminToDelete?.email})? This action cannot be undone.
              </p>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminListWithCrud;