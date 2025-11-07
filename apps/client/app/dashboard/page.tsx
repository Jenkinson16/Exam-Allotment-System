'use client';

import { useAuthStore } from '@/lib/stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data: studentsResp } = useQuery({
    queryKey: ['dashboard','students'],
    queryFn: async () => (await apiClient.get('/api/students?page=1&limit=1')).data as { data: any[]; total: number },
  });
  const { data: exams } = useQuery({
    queryKey: ['dashboard','exams'],
    queryFn: async () => (await apiClient.get('/api/exams')).data as any[],
  });
  const { data: rooms } = useQuery({
    queryKey: ['dashboard','rooms'],
    queryFn: async () => (await apiClient.get('/api/rooms')).data as any[],
  });
  const { data: staff } = useQuery({
    queryKey: ['dashboard','staff'],
    queryFn: async () => (await apiClient.get('/api/staff')).data as any[],
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{studentsResp?.total ?? '-'}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Exams</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{exams?.length ?? '-'}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Rooms</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{rooms?.length ?? '-'}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Staff</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{staff?.length ?? '-'}</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome, {user?.username}!</h2>
        <p className="text-gray-600">
          Use the navigation menu to manage students, exams, rooms, and generate seating allotments.
        </p>
      </div>
    </div>
  );
}

