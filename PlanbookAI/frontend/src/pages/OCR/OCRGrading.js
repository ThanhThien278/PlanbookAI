import React, { useState } from 'react';
import { ocrService } from '../../services/ocrService';
import { examService } from '../../services/examService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function OCRGrading() {
  const [selectedExam, setSelectedExam] = useState('');
  const [exams, setExams] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  React.useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const response = await examService.getAll({ status: 'published' });
      setExams(response.data);
    } catch (error) {
      console.error('Error loading exams:', error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedExam || !file) {
      toast.error('Vui lòng chọn đề thi và tệp ảnh');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await ocrService.uploadForGrading(selectedExam, formData);
      setResult(response.data);
      toast.success('Đã tải lên thành công, đang xử lý...');
    } catch (error) {
      toast.error('Không thể tải lên tệp');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" />
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chấm điểm tự động</h1>
        <p className="text-gray-600">Tải lên ảnh bài làm để chấm điểm tự động</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn đề thi *
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn đề thi --</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tải lên ảnh bài làm *
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Tải lên tệp</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">hoặc kéo thả</p>
                </div>
                {file && (
                  <p className="text-xs text-gray-500 mt-2">
                    Đã chọn: {file.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || !selectedExam || !file}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Đang xử lý...' : 'Chấm điểm'}
          </button>
        </form>

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-semibold text-green-900 mb-2">Kết quả chấm điểm:</h3>
            <p className="text-green-800">
              Điểm số: {result.score} / {result.total_points}
            </p>
            <p className="text-green-800">
              Tỷ lệ: {result.percentage}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}




