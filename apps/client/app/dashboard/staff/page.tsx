'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Staff, Department } from '@/lib/types';

export default function StaffPage() {
  const [showForm, setShowForm] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStaffName, setEditStaffName] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState('');
  const queryClient = useQueryClient();

  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const response = await apiClient.get('/api/staff');
      return response.data as Staff[];
    },
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await apiClient.get('/api/departments');
      return response.data as Department[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/api/staff', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setStaffName('');
      setDepartmentId('');
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiClient.put(`/api/staff/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setEditingId(null);
      setEditStaffName('');
      setEditDepartmentId('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/staff/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      staffName,
      departmentId: parseInt(departmentId),
    });
  };

  const handleEdit = (s: Staff) => {
    setEditingId(s.staffId);
    setEditStaffName(s.staffName);
    setEditDepartmentId(String(s.departmentId));
  };

  const handleUpdate = (id: number) => {
    updateMutation.mutate({
      id,
      data: { staffName: editStaffName, departmentId: parseInt(editDepartmentId) },
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Staff</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold"
        >
          {showForm ? 'Cancel' : 'Add Staff'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Staff Name
              </label>
              <input
                type="text"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-semibold placeholder:font-semibold placeholder:text-gray-400"
                placeholder="Enter staff name (e.g., Dr. John Smith)"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900"
                required
              >
                <option value="">Select Department</option>
                {departments?.map((dept) => (
                  <option key={dept.departmentId} value={dept.departmentId}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {createMutation.isPending ? 'Creating...' : 'Add Staff'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : staff && staff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Department
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staff.map((s) => (
                  <tr key={s.staffId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {editingId === s.staffId ? (
                        <input
                          type="text"
                          value={editStaffName}
                          onChange={(e) => setEditStaffName(e.target.value)}
                          className="px-3 py-1 border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        s.staffName
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === s.staffId ? (
                        <select
                          value={editDepartmentId}
                          onChange={(e) => setEditDepartmentId(e.target.value)}
                          className="px-3 py-1 border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {departments?.map((dept) => (
                            <option key={dept.departmentId} value={dept.departmentId}>
                              {dept.departmentName}
                            </option>
                          ))}
                        </select>
                      ) : (
                        s.department?.departmentName
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="inline-flex gap-3">
                        {editingId === s.staffId ? (
                          <>
                            <button onClick={() => handleUpdate(s.staffId)} className="text-green-600 hover:text-green-900 font-semibold">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-gray-600 hover:text-gray-900 font-semibold">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-900 font-semibold">Edit</button>
                            <button onClick={() => handleDelete(s.staffId)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No staff yet. Click "Add Staff" to create one.
          </div>
        )}
      </div>
    </div>
  );
}

