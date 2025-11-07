'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Exam, Subject, Student } from '@/lib/types';

export default function ExamsPage() {
  const queryClient = useQueryClient();

  const [subjectId, setSubjectId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [session, setSession] = useState<'Morning' | 'Afternoon' | ''>('');

  const [showRegister, setShowRegister] = useState(false);
  const [registerExamId, setRegisterExamId] = useState<number | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => (await apiClient.get('/api/subjects')).data,
  });

  const { data: exams, isLoading } = useQuery<Exam[]>({
    queryKey: ['exams'],
    queryFn: async () => (await apiClient.get('/api/exams')).data,
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editSession, setEditSession] = useState<'Morning' | 'Afternoon' | ''>('');

  const { data: students } = useQuery<{ data: Student[]; total: number}>({
    queryKey: ['students', 'register'],
    queryFn: async () => (await apiClient.get('/api/students?page=1&limit=1000')).data,
  });

  const createExamMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        subjectId: parseInt(subjectId),
        examDate,
        startTime,
        endTime,
        session: session || undefined,
      };
      return (await apiClient.post('/api/exams', payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setSubjectId(''); setExamDate(''); setStartTime(''); setEndTime(''); setSession('');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ examId, studentIds }: { examId: number; studentIds: string[] }) => {
      return (await apiClient.post(`/api/exams/${examId}/register`, { studentIds })).data;
    },
    onSuccess: () => {
      setShowRegister(false);
      setSelectedStudentIds(new Set());
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => (await apiClient.delete(`/api/exams/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exams'] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => (await apiClient.put(`/api/exams/${id}`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setEditingId(null);
      setEditStart(''); setEditEnd(''); setEditSession('');
    },
  });

  const toggleStudent = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedStudentIds(next);
  };

  const openRegister = (examId: number) => {
    setRegisterExamId(examId);
    setShowRegister(true);
  };

  const submitRegister = () => {
    if (!registerExamId) return;
    registerMutation.mutate({ examId: registerExamId, studentIds: Array.from(selectedStudentIds) });
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Exams</h1>

      {/* Create Exam */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Create New Exam</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-extrabold text-gray-900 mb-2">Subject</label>
            <select
              className={`w-full px-3 py-2 border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${subjectId ? 'font-bold text-gray-900' : 'font-bold text-gray-500'}`}
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value="" disabled className="font-bold text-gray-500">Select Subject</option>
              {subjects?.map((s) => (
                <option key={s.subjectId} value={s.subjectId}>{s.subjectCode} - {s.subjectName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-extrabold text-gray-900 mb-2">Date</label>
            <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="w-full px-3 py-2 border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900 placeholder:font-bold placeholder:text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-extrabold text-gray-900 mb-2">Start Time</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2 border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900 placeholder:font-bold placeholder:text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-extrabold text-gray-900 mb-2">End Time</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2 border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900 placeholder:font-bold placeholder:text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-extrabold text-gray-900 mb-2">Session</label>
            <select className={`w-full px-3 py-2 border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${session ? 'font-bold text-gray-900' : 'font-bold text-gray-500'}`} value={session} onChange={(e) => setSession(e.target.value as any)}>
              <option value="" disabled className="font-bold text-gray-500">Select Session</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button onClick={() => createExamMutation.mutate()} disabled={!subjectId || !examDate || !startTime || !endTime || createExamMutation.isPending} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold disabled:opacity-50">
            {createExamMutation.isPending ? 'Creating…' : 'Create Exam'}
          </button>
        </div>
      </div>

      {/* Exams List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Exams</h2>
        {isLoading ? (
          <div className="text-gray-500">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-gray-900 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-gray-900 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-gray-900 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-gray-900 uppercase">Session</th>
                  <th className="px-6 py-3 text-right text-xs font-extrabold text-gray-900 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exams?.map((exam) => (
                  <tr key={exam.examId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{exam.subject?.subjectCode} - {exam.subject?.subjectName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{exam.examDate}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {editingId === exam.examId ? (
                        <div className="flex items-center gap-2">
                          <input type="time" value={editStart} onChange={(e) => setEditStart(e.target.value)} className="px-2 py-1 border-2 rounded font-semibold" />
                          <span className="font-bold">-</span>
                          <input type="time" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} className="px-2 py-1 border-2 rounded font-semibold" />
                        </div>
                      ) : (
                        `${exam.startTime} - ${exam.endTime}`
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {editingId === exam.examId ? (
                        <select value={editSession} onChange={(e) => setEditSession(e.target.value as any)} className="px-2 py-1 border-2 rounded font-semibold">
                          <option value="Morning">Morning</option>
                          <option value="Afternoon">Afternoon</option>
                        </select>
                      ) : (
                        exam.session || '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="inline-flex gap-3">
                        {editingId === exam.examId ? (
                          <>
                            <button onClick={() => updateMutation.mutate({ id: exam.examId, payload: { startTime: editStart || exam.startTime, endTime: editEnd || exam.endTime, session: (editSession || exam.session) as any } })} className="text-green-600 hover:text-green-900 font-semibold">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-gray-600 hover:text-gray-900 font-semibold">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => openRegister(exam.examId)} className="text-blue-600 hover:text-blue-900 font-semibold">Register Students</button>
                            <button onClick={() => { setEditingId(exam.examId); setEditStart(exam.startTime); setEditEnd(exam.endTime); setEditSession((exam.session as any) || ''); }} className="text-blue-600 hover:text-blue-900 font-semibold">Edit</button>
                            <button onClick={() => { if (confirm('Delete this exam?')) deleteMutation.mutate(exam.examId); }} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showRegister && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-2xl font-extrabold text-gray-900">Register Students</h3>
              <button onClick={() => setShowRegister(false)} className="text-gray-600 hover:text-gray-800 font-semibold">✕</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-120px)]">
              <div className="border rounded">
                <div className="bg-gray-50 px-4 py-2 text-sm font-extrabold text-gray-900">Select students (click to toggle)</div>
                <div className="max-h-80 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-extrabold text-gray-900 uppercase">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-extrabold text-gray-900 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-extrabold text-gray-900 uppercase">Department</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students?.data.map((s) => (
                        <tr key={s.studentId} className={`cursor-pointer hover:bg-gray-50 ${selectedStudentIds.has(s.studentId) ? 'bg-blue-50' : ''}`} onClick={() => toggleStudent(s.studentId)}>
                          <td className="px-4 py-2 text-sm font-semibold text-gray-900">{s.studentId}</td>
                          <td className="px-4 py-2 text-sm font-semibold text-gray-900">{s.studentName}</td>
                          <td className="px-4 py-2 text-sm font-semibold text-gray-900">{s.department?.departmentName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowRegister(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold">Cancel</button>
              <button onClick={submitRegister} disabled={registerMutation.isPending || selectedStudentIds.size === 0} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50">{registerMutation.isPending ? 'Registering…' : 'Register Selected'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

