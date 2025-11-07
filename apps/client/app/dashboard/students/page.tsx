'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Student, Department } from '@/lib/types';
import { StudentCsvImportV2 } from '@/components/features/StudentCsvImportV2';

export default function StudentsPage() {
  const [showImportV2, setShowImportV2] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [page, setPage] = useState(1);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState('');
  const queryClient = useQueryClient();

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['students', page],
    queryFn: async () => {
      const response = await apiClient.get(`/api/students?page=${page}&limit=50`);
      return response.data as { data: Student[]; total: number };
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
    mutationFn: async (data: { studentId: string; studentName: string; departmentId: number }) => {
      const response = await apiClient.post('/api/students', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setStudentId('');
      setStudentName('');
      setDepartmentId('');
      setShowAddForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { studentName?: string; departmentId?: number } }) => {
      const response = await apiClient.put(`/api/students/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setEditingId(null);
      setEditName('');
      setEditDepartmentId('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentId.trim() && studentName.trim() && departmentId) {
      createMutation.mutate({
        studentId: studentId.trim(),
        studentName: studentName.trim(),
        departmentId: parseInt(departmentId),
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(`Are you sure you want to delete student ${id}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.studentId);
    setEditName(student.studentName);
    setEditDepartmentId(String(student.departmentId));
  };

  const handleUpdate = (id: string) => {
    const payload: { studentName?: string; departmentId?: number } = {};
    if (editName.trim()) payload.studentName = editName.trim();
    if (editDepartmentId) payload.departmentId = parseInt(editDepartmentId);
    updateMutation.mutate({ id, data: payload });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Students</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-semibold"
          >
            {showAddForm ? 'Cancel' : 'Add Student'}
          </button>
          <button onClick={() => setShowImportV2(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold">Import from CSV</button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Add New Student</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:font-bold placeholder:text-gray-500 text-gray-900 font-semibold"
                  placeholder="Enter student ID (e.g., CS001)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:font-bold placeholder:text-gray-500 text-gray-900 font-semibold"
                  placeholder="Enter full name (e.g., John Doe)"
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
                  className={`w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    departmentId ? 'text-gray-900 font-bold' : 'text-gray-500 font-bold'
                  }`}
                  required
                >
                  <option value="" disabled className="font-bold text-gray-500">Select Department</option>
                  {departments?.map((dept) => (
                    <option key={dept.departmentId} value={dept.departmentId}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 font-semibold"
            >
              {createMutation.isPending ? 'Adding...' : 'Add Student'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.data.map((student) => (
                    <tr key={student.studentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingId === student.studentId ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-3 py-1 border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          student.studentName
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingId === student.studentId ? (
                          <select
                            value={editDepartmentId}
                            onChange={(e) => setEditDepartmentId(e.target.value)}
                            className="px-3 py-1 border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                          >
                            {departments?.map((dept) => (
                              <option key={dept.departmentId} value={dept.departmentId}>
                                {dept.departmentName}
                              </option>
                            ))}
                          </select>
                        ) : (
                          student.department?.departmentName
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="inline-flex gap-3">
                          {editingId === student.studentId ? (
                            <>
                              <button onClick={() => handleUpdate(student.studentId)} className="text-green-600 hover:text-green-900 font-semibold">Save</button>
                              <button onClick={() => setEditingId(null)} className="text-gray-600 hover:text-gray-900 font-semibold">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEdit(student)} className="text-blue-600 hover:text-blue-900 font-semibold">Edit</button>
                              <button onClick={() => handleDelete(student.studentId)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
              <div className="text-sm text-gray-700">
                Showing {data?.data.length || 0} of {data?.total || 0} students
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!data || data.data.length < 50}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showImportV2 && (
        <StudentCsvImportV2
          onClose={() => setShowImportV2(false)}
          onSuccess={() => {
            refetch();
            setShowImportV2(false);
          }}
        />
      )}
    </div>
  );
}

