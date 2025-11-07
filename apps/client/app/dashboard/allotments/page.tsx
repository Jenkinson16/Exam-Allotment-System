'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Exam, Room, Staff } from '@/lib/types';

export default function AllotmentsPage() {
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<number>>(new Set());
  const [staffAssignments, setStaffAssignments] = useState<Record<number, number[]>>({});

  const { data: exams } = useQuery<Exam[]>({
    queryKey: ['exams'],
    queryFn: async () => (await apiClient.get('/api/exams')).data,
  });

  const { data: rooms } = useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: async () => (await apiClient.get('/api/rooms')).data,
  });
  const { data: staff } = useQuery<Staff[]>({
    queryKey: ['staff'],
    queryFn: async () => (await apiClient.get('/api/staff')).data,
  });

  const allotMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        examId: parseInt(selectedExamId),
        roomIds: Array.from(selectedRoomIds),
        staffAssignments,
      };
      return (await apiClient.post('/api/allotments', payload)).data;
    },
  });

  const toggleRoom = (id: number) => {
    const next = new Set(selectedRoomIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedRoomIds(next);
    setStaffAssignments((prev) => {
      const copy = { ...prev };
      if (!next.has(id)) delete copy[id];
      else if (!copy[id]) copy[id] = [];
      return copy;
    });
  };

  const toggleStaffForRoom = (roomId: number, staffId: number) => {
    setStaffAssignments((prev) => {
      const current = prev[roomId] ? [...prev[roomId]] : [];
      const idx = current.indexOf(staffId);
      if (idx >= 0) current.splice(idx, 1); else current.push(staffId);
      return { ...prev, [roomId]: current };
    });
  };

  const viewAllotment = async () => {
    if (!selectedExamId) return;
    try {
      const res = await apiClient.get(`/api/allotments/${selectedExamId}`);
      console.log(res.data);
      alert('Allotment found. You can now download PDF from Reporting or extend this page to render details.');
    } catch (error: any) {
      if (error?.response?.status === 404) {
        if (selectedRoomIds.size === 0) {
          alert('No allotment found for this exam. Please select rooms and click "Generate Allotment" first.');
          return;
        }
        try {
          await allotMutation.mutateAsync();
          const res2 = await apiClient.get(`/api/allotments/${selectedExamId}`);
          console.log(res2.data);
          alert('Allotment generated successfully.');
        } catch (e: any) {
          alert(e?.response?.data?.message || 'Failed to generate or fetch allotment. Ensure students are registered and room capacity is sufficient.');
        }
      } else {
        alert(error?.message || 'Failed to fetch allotment.');
      }
    }
  };

  const downloadPdf = async () => {
    if (!selectedExamId) return;
    try {
      const res = await apiClient.get(`/api/reports/allotment/${selectedExamId}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exam-${selectedExamId}-allotment.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to download PDF. Ensure an allotment exists.');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Allotments</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Generate Allotment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-extrabold text-gray-900 mb-2">Exam</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className={`w-full px-3 py-2 border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${selectedExamId ? 'font-bold text-gray-900' : 'font-bold text-gray-500'}`}
            >
              <option value="" disabled className="font-bold text-gray-500">Select Exam</option>
              {exams?.map((ex) => (
                <option key={ex.examId} value={ex.examId}>
                  {ex.subject?.subjectCode} - {ex.subject?.subjectName} ({ex.examDate})
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-extrabold text-gray-900 mb-2">Rooms (toggle to select)</label>
            <div className="flex flex-wrap gap-2">
              {rooms?.map((r) => {
                const active = selectedRoomIds.has(r.roomId);
                return (
                  <button
                    key={r.roomId}
                    onClick={() => toggleRoom(r.roomId)}
                    className={`px-3 py-1 rounded border-2 font-semibold ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`}
                  >
                    {r.roomNumber} ({r.capacity})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {selectedRoomIds.size > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-extrabold text-gray-900 mb-3">Assign Staff to Selected Rooms (optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from(selectedRoomIds).map((roomId) => {
                const room = rooms?.find((r) => r.roomId === roomId);
                return (
                  <div key={roomId} className="bg-gray-50 rounded p-3 border">
                    <div className="mb-2 text-sm font-extrabold text-gray-900">Room: {room?.roomNumber}</div>
                    <div className="flex flex-wrap gap-2">
                      {staff?.map((s) => {
                        const active = (staffAssignments[roomId] || []).includes(s.staffId);
                        return (
                          <button
                            key={s.staffId}
                            type="button"
                            onClick={() => toggleStaffForRoom(roomId, s.staffId)}
                            className={`px-3 py-1 rounded border-2 text-sm font-semibold ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`}
                            title={s.department?.departmentName || ''}
                          >
                            {s.staffName}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Click to toggle staff for this room.</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="mt-4 flex gap-3">
          <button onClick={() => allotMutation.mutate()} disabled={!selectedExamId || selectedRoomIds.size === 0 || allotMutation.isPending} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold disabled:opacity-50">
            {allotMutation.isPending ? 'Generating…' : 'Generate Allotment'}
          </button>
          
          <button onClick={downloadPdf} disabled={!selectedExamId} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-semibold disabled:opacity-50">Download PDF</button>
        </div>
      </div>
    </div>
  );
}

