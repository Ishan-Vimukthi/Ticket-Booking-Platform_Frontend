import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

const AdminListWithCrud = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    clearErrors,
    getValues,
    setValue,
  } = useForm();

  // API base URL
  const API_URL = "http://localhost:3000/api/admins";

  // Show simple notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000
    );
  };

  // Fetch all admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get(API_URL);
        setAdmins(response.data.data?.admins || []);
      } catch (err) {
        showNotification("Failed to load admins", "error");
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
      // Set form values for editing
      setValue("userName", admin.userName);
      setValue("email", admin.email);
      setValue("mobile", admin.mobile);
      setValue("role", admin.role);
    } else if (type === "create") {
      reset({
        userName: "",
        email: "",
        mobile: "",
        role: "",
        password: "",
      });
    } else if (type === "password" && admin) {
      reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
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
      const response = await axios.post(API_URL, data);
      setAdmins([...admins, response.data.data]);
      showNotification("Admin created successfully");
      closeModal();
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to create admin",
        "error"
      );
      console.error(err);
    }
  };

  // Update admin details
  const handleUpdate = async (data) => {
    try {
      const response = await axios.put(`${API_URL}/${selectedAdmin._id}`, data);
      setAdmins(
        admins.map((admin) =>
          admin._id === selectedAdmin._id ? response.data.data : admin
        )
      );
      showNotification("Admin updated successfully");
      closeModal();
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to update admin",
        "error"
      );
      console.error(err);
    }
  };

  // Delete admin
  const handleDelete = async () => {
    if (!adminToDelete) return;

    try {
      await axios.delete(`${API_URL}/${adminToDelete._id}`);
      setAdmins(admins.filter((admin) => admin._id !== adminToDelete._id));
      showNotification("Admin deleted successfully");
      closeDeleteModal();
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to delete admin",
        "error"
      );
      console.error(err);
    }
  };

  // Update admin password
  const handlePasswordChange = async (data) => {
    try {
      if (data.newPassword !== data.confirmPassword) {
        setError("confirmPassword", {
          type: "manual",
          message: "Passwords don't match",
        });
        return;
      }

      const response = await axios.patch(
        `${API_URL}/${selectedAdmin._id}/change-password`,
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }
      );

      if (response.data.status === "success") {
        showNotification("Password updated successfully");
        closeModal();
      } else {
        setError("currentPassword", {
          type: "manual",
          message: response.data.message || "Invalid current password",
        });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update password";
      setError("currentPassword", {
        type: "manual",
        message: errorMessage.includes("current")
          ? errorMessage
          : "Invalid current password",
      });
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading admins...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Simple Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${
            notification.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {notification.message}
        </div>
      )}

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
                          onClick={() => openModal("password", admin)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                          Password
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
                  : modalType === "edit"
                  ? `Edit Admin: ${selectedAdmin?.userName}`
                  : `Change Password for ${selectedAdmin?.userName}`}
              </h2>

              <form
                onSubmit={handleSubmit(
                  modalType === "create"
                    ? handleCreate
                    : modalType === "edit"
                    ? handleUpdate
                    : handlePasswordChange
                )}
                className="space-y-4"
              >
                {modalType !== "password" ? (
                  <>
                    <div>
                      <label className="block text-gray-700 mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        {...register("userName", {
                          required: "Username is required",
                          minLength: {
                            value: 3,
                            message: "Username must be at least 3 characters",
                          },
                          maxLength: {
                            value: 30,
                            message: "Username must be at most 30 characters",
                          },
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
                      <select
                        {...register("role", {
                          required: "Role is required",
                        })}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Role</option>
                        <option value="superadmin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                      </select>
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
                          pattern: {
                            value: /^[0-9]{10,15}$/,
                            message:
                              "Please enter a valid mobile number (10-15 digits)",
                          },
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
                ) : (
                  <>
                    <div>
                      <label className="block text-gray-700 mb-1">
                        Current Password *
                      </label>
                      <input
                        type="password"
                        {...register("currentPassword", {
                          required: "Current password is required",
                        })}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.currentPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-1">
                        New Password *
                      </label>
                      <input
                        type="password"
                        {...register("newPassword", {
                          required: "New password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.newPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === getValues("newPassword") ||
                            "Passwords don't match",
                        })}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </>
                )}

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
                    {modalType === "create"
                      ? "Create"
                      : modalType === "edit"
                      ? "Update"
                      : "Change Password"}
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
                <strong>{adminToDelete?.userName}</strong> ({adminToDelete?.email})?
                This action cannot be undone.
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