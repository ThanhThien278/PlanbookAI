import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { examService } from '../../services/examService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ExamDetail() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExam();
  }, [id]);

  const loadExam = async () => {
    try {
      setLoading(true);
      const response = await examService.getById(id);
      setExam(response.data);
    } catch (error) {
      toast.error('Không thể tải đề thi');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      await examService.publish(id);
      toast.success('Đã xuất bản đề thi');
      loadExam();
    } catch (error) {
      toast.error('Không thể xuất bản đề thi');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!exam) {
    return <div className="text-center py-12">Không tìm thấy đề thi</div>;
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
          <p className="text-gray-600">{exam.description}</p>
        </div>
        <div className="flex gap-2">
          {exam.status !== 'published' && (
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Xuất bản
            </button>
          )}
          <Link
            to={`/exams/${id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Chỉnh sửa
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Môn học</p>
            <p className="text-lg font-semibold">{exam.subject}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Thời gian</p>
            <p className="text-lg font-semibold">{exam.duration_minutes} phút</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tổng điểm</p>
            <p className="text-lg font-semibold">{exam.total_points}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Trạng thái</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
              exam.status === 'published' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {exam.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
            </span>
          </div>
        </div>

        {exam.instructions && (
          <div>
            <h3 className="font-semibold mb-2">Hướng dẫn:</h3>
            <p className="text-gray-700">{exam.instructions}</p>
          </div>
        )}

        {exam.questions && exam.questions.length > 0 && (
          <div>
            <h3 className="font-semibold mb-4">
              Danh sách câu hỏi ({exam.questions.length})
            </h3>
            <div className="space-y-4">
              {exam.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      Câu {index + 1} ({question.points} điểm)
                    </span>
                    <span className="text-xs text-gray-500">
                      {question.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{question.question_text}</p>
                  {question.options && (
                    <div className="space-y-1 text-sm text-gray-600 ml-4">
                      {Object.entries(question.options).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}.</span> {value}
                          {key === question.correct_answer && (
                            <span className="ml-2 text-green-600">✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




