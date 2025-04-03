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
    setValue,
  } = useForm();

  const API_URL = "http://localhost:3000/api/admins";

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

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

  const openModal = (type, admin = null) => {
    setModalType(type);
    setSelectedAdmin(admin);

    if (type === "edit" && admin) {
      setValue("userName", admin.userName);
      setValue("email", admin.email);
      setValue("mobile", admin.mobile);
      setValue("role", admin.role);
    } else if (type === "create") {
      reset({ userName: "", email: "", mobile: "", role: "", password: "" });
    } else if (type === "password" && admin) {
      reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
    setModalType(null);
    clearErrors();
  };

  const openDeleteModal = (admin) => {
    setAdminToDelete(admin);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setAdminToDelete(null);
  };

  const handleCreate = async (data) => {
    try {
      const response = await axios.post(API_URL, data);
      setAdmins([...admins, response.data.data]);
      showNotification("Admin created successfully");
      closeModal();
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to create admin", "error");
      console.error(err);
    }
  };

  const handleUpdate = async (data) => {
    try {
      const response = await axios.put(`${API_URL}/${selectedAdmin._id}`, data);
      setAdmins(admins.map((admin) => (admin._id === selectedAdmin._id ? response.data.data : admin)));
      showNotification("Admin updated successfully");
      closeModal();
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to update admin", "error");
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!adminToDelete) return;

    try {
      await axios.delete(`${API_URL}/${adminToDelete._id}`);
      setAdmins(admins.filter((admin) => admin._id !== adminToDelete._id));
      showNotification("Admin deleted successfully");
      closeDeleteModal();
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to delete admin", "error");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading admins...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${notification.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {notification.message}
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Admin Management</h1>
        <button onClick={() => openModal("create")} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto">
          Add New Admin
        </button>
      </div>
      {/* Admin list table here */}
    </div>
  );
};

export default AdminListWithCrud;