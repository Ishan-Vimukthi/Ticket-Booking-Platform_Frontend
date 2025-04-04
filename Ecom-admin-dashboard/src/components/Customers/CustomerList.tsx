import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import DataTable from '../Common/Table/DataTable';
import LoadingSpinner from '../Loading/LoadingSpinner';
import ConfirmationModal from '../Common/Modal/ConfirmationModal';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  createdAt: string;
  deletedAt: number;
}

interface ConfirmationConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
  itemToDelete?: Customer;
  onConfirm: () => void;
}

const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationConfig>({
    isOpen: false,
    title: '',
    message: '',
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3000/customer/all-customers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        setError('Your session has expired. Please log in again.');
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (data.status === "SUCCESS") {
        setCustomers(data.data);
      } else {
        setError(data.message || 'Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('An error occurred while fetching customers');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      header: '#',
      accessor: (item: Customer, index: number) => index + 1 // Display item count
    },
    {
      header: 'Name',
      accessor: (item: Customer) => `${item.firstName} ${item.lastName}`
    },
    {
      header: 'Contact',
      accessor: (item: Customer) => (
        <div>
          {item.email && <div className="text-sm text-gray-600">{item.email}</div>}
          <div className="text-sm">{item.phone}</div>
        </div>
      )
    },
    {
      header: 'Location',
      accessor: (item: Customer) => `${item.city}, ${item.state}`
    },
    {
      header: 'Created',
      accessor: (item: Customer) => new Date(item.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
    },
  ];

  const handleDelete = (customer: Customer) => {
    setConfirmation({
      isOpen: true,
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete customer "${customer.firstName} ${customer.lastName}"? This action can be reversed later.`,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      itemToDelete: customer,
      onConfirm: () => performSoftDelete(customer)
    });
  };

  const performSoftDelete = async (customer: Customer) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      const response = await fetch(`http://localhost:3000/customer/delete-customer/${customer._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        setError('Your session has expired. Please log in again.');
        return;
      }

      const data = await response.json();

      if (data.status === "SUCCESS") {
        setCustomers(prevCustomers => prevCustomers.filter(c => c._id !== customer._id));
        console.log('Customer deleted successfully');
      } else {
        setError(data.message || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      setError('An error occurred while deleting the customer');
    } finally {
      closeConfirmationModal();
    }
  };

  const closeConfirmationModal = () => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="p-6">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
              <AlertTriangle size={20} className="mr-2" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-6 flex items-center justify-end space-x-4">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          {!error && customers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No customers found.</p>
            </div>
          ) : !error ? (
            <DataTable
              columns={columns}
              data={customers}
              onDelete={handleDelete}
            />
          ) : null}

          <ConfirmationModal
            isOpen={confirmation.isOpen}
            title={confirmation.title}
            message={confirmation.message}
            confirmButtonText={confirmation.confirmButtonText}
            cancelButtonText={confirmation.cancelButtonText}
            onConfirm={confirmation.onConfirm}
            onCancel={closeConfirmationModal}
          />
        </>
      )}
    </div>
  );
};

export default CustomerList;
