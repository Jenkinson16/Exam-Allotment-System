'use client';

import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Department } from '@/lib/types';

type PreviewRow = { studentId: string; studentName: string; departmentName: string };

export function StudentCsvImportV2({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'upload' | 'map' | 'finalize' | 'importing'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [unmatchedDepartments, setUnmatchedDepartments] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, number>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: departments } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => (await apiClient.get('/api/departments')).data,
  });

  const uploadMutation = useMutation({
    mutationFn: async (fileToUpload: File) => {
      const form = new FormData();
      form.append('file', fileToUpload);
      const res = await apiClient.post('/api/students/import-csv', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data as { previewRows: PreviewRow[]; unmatchedDepartments: string[]; totalRows: number };
    },
    onSuccess: (data) => {
      setPreviewRows(data.previewRows || []);
      setUnmatchedDepartments(data.unmatchedDepartments || []);
      setMapping({});
      setErrorMsg(null);
      setStep(data.unmatchedDepartments?.length ? 'map' : 'finalize');
    },
    onError: (e: any) => {
      setErrorMsg(e?.response?.data?.message || e?.message || 'Upload failed');
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      // Resolve departmentId via mapping or by matching existing departments
      const rows = previewRows.map((r) => {
        const mapped = mapping[r.departmentName];
        const fromList = departments?.find(
          (d) => d.departmentName.toLowerCase() === r.departmentName.toLowerCase(),
        )?.departmentId;
        return {
          studentId: r.studentId,
          studentName: r.studentName,
          departmentId: mapped || fromList || 0,
        };
      });
      const res = await apiClient.post('/api/students/import-finalize', { rows, upsert: true });
      return res.data as { imported: number; updated: number; failed: number };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'], exact: false });
      onSuccess();
      onClose();
    },
    onError: (e: any) => setErrorMsg(e?.response?.data?.message || e?.message || 'Import failed'),
  });

  const allMapped = unmatchedDepartments.every((name) => mapping[name]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-gray-900">Import Students from CSV</h2>
          <button className="text-gray-600 hover:text-gray-800 font-semibold" onClick={onClose}>✕</button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 font-semibold">{errorMsg}</div>
          )}

          {step === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input id="csvv2-upload" type="file" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <label htmlFor="csvv2-upload" className="cursor-pointer">
                  <div className="text-gray-700">
                    <p className="text-xl font-bold mb-1">Click to upload CSV file</p>
                    <p className="text-sm font-semibold text-gray-500">or drag and drop</p>
                  </div>
                </label>
                {file && (
                  <p className="mt-3 text-sm font-semibold text-gray-800">Selected: <span className="font-bold">{file.name}</span></p>
                )}
              </div>

              <button
                onClick={() => file && uploadMutation.mutate(file)}
                disabled={!file || uploadMutation.isPending}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 font-semibold disabled:opacity-50"
              >
                {uploadMutation.isPending ? 'Uploading…' : 'Parse File'}
              </button>
            </div>
          )}

          {step === 'map' && (
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-gray-900">Map Departments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unmatchedDepartments.map((name) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className="flex-1 text-gray-900 font-semibold">{name}</div>
                    <select
                      className="flex-1 px-3 py-2 border-2 rounded-md font-semibold"
                      value={mapping[name] || ''}
                      onChange={(e) => setMapping((m) => ({ ...m, [name]: Number(e.target.value) }))}
                    >
                      <option value="" disabled className="font-semibold">Select Department</option>
                      {departments?.map((d) => (
                        <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('upload')} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold">Back</button>
                <button
                  onClick={() => setStep('finalize')}
                  disabled={!allMapped}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 'finalize' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xl font-extrabold text-gray-900">{previewRows.length} students ready to import</p>
              </div>
              <div className="border rounded overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-extrabold text-gray-700 uppercase">Student ID</th>
                        <th className="px-6 py-3 text-left text-xs font-extrabold text-gray-700 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-extrabold text-gray-700 uppercase">Department</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewRows.slice(0, 100).map((r, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{r.studentId}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{r.studentName}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{r.departmentName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(unmatchedDepartments.length ? 'map' : 'upload')} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold">Back</button>
                <button
                  onClick={() => finalizeMutation.mutate()}
                  disabled={finalizeMutation.isPending}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
                >
                  {finalizeMutation.isPending ? 'Importing…' : 'Import Students'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


