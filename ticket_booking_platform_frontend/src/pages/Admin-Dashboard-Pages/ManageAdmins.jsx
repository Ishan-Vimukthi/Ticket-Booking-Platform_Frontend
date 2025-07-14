import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/dashboard_Components/Sidebar";
import D_Navbar from "../../components/dashboard_Components/D_Navbar";
import { toast } from "react-toastify";

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    userName: "",
    email: "",
    password: "",
    mobile: "",
    role: "admin",
  });
  const [currentAdmin, setCurrentAdmin] = useState(null);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get("/api/admins", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAdmins(response.data.data.admins);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch admins.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showAddModal) {
      setNewAdmin({ ...newAdmin, [name]: value });
    } else if (showEditModal) {
      setCurrentAdmin({ ...currentAdmin, [name]: value });
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/admins", newAdmin, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setShowAddModal(false);
      fetchAdmins();
      toast.success("Admin added successfully!");
    } catch (err) {
      toast.error("Failed to add admin.");
    }
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admins/${currentAdmin._id}`, currentAdmin, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setShowEditModal(false);
      fetchAdmins();
      toast.success("Admin updated successfully!");
    } catch (err) {
      toast.error("Failed to update admin.");
    }
  };

  const handleDeleteAdmin = async () => {
    try {
      await axios.delete(`/api/admins/${currentAdmin._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setShowDeleteModal(false);
      fetchAdmins();
      toast.success("Admin deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete admin.");
    }
  };

  const openEditModal = (admin) => {
    setCurrentAdmin(admin);
    setShowEditModal(true);
  };

  const openDeleteModal = (admin) => {
    setCurrentAdmin(admin);
    setShowDeleteModal(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <D_Navbar />
        <div className="p-5">
          <h1 className="text-2xl font-semibold">Manage Admins</h1>
          <div className="mt-5">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add Admin
            </button>
          </div>
          <div className="mt-5">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2">Username</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin._id}>
                    <td className="border px-4 py-2">{admin.userName}</td>
                    <td className="border px-4 py-2">{admin.email}</td>
                    <td className="border px-4 py-2">{admin.role}</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => openEditModal(admin)}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(admin)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Add New Admin
            </h3>
            <form onSubmit={handleAddAdmin} className="mt-2">
              <input
                type="text"
                name="userName"
                placeholder="Username"
                onChange={handleInputChange}
                className="w-full p-2 mb-3 border rounded"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleInputChange}
                className="w-full p-2 mb-3 border rounded"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleInputChange}
                className="w-full p-2 mb-3 border rounded"
              />
              <input
                type="text"
                name="mobile"
                placeholder="Mobile"
                onChange={handleInputChange}
                className="w-full p-2 mb-3 border rounded"
              />
              <select
                name="role"
                onChange={handleInputChange}
                className="w-full p-2 mb-3 border rounded"
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
              <div className="items-center px-4 py-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Edit Admin
            </h3>
            <form onSubmit={handleEditAdmin} className="mt-2">
              <input
                type="text"
                name="userName"
                value={currentAdmin.userName}
                onChange={handleInputChange}
                className="w-full p-2 mb-3 border rounded"
              />
              <input
                type="text"
                name="mobile"
                value={currentAdmin.mobile}
                onChange={handleInputChange}
                className="w-full p-2 mb-3 border rounded"
              />
              <select
                name="role"
                value={currentAdmin.role}
                onChange={handleInputChange}
                className="w-full p-2 mb-3 border rounded"
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
              <div className="items-center px-4 py-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Delete Admin
            </h3>
            <div className="mt-2">
              <p>Are you sure you want to delete this admin?</p>
            </div>
            <div className="items-center px-4 py-3">
              <button
                onClick={handleDeleteAdmin}
                className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAdmins;
