import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiUser, FiTag } from 'react-icons/fi';

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: 'Hướng dẫn sử dụng PlanbookAI cho giáo viên mới',
      excerpt: 'Tìm hiểu cách sử dụng các tính năng cơ bản của PlanbookAI để tối ưu hóa công việc giảng dạy của bạn.',
      author: 'Admin',
      date: '2024-01-15',
      category: 'Hướng dẫn',
      image: 'https://via.placeholder.com/400x250?text=Blog+Post+1'
    },
    {
      id: 2,
      title: 'Cách tạo đề thi trắc nghiệm hiệu quả',
      excerpt: 'Chia sẻ các mẹo và thủ thuật để tạo đề thi trắc nghiệm chất lượng, đảm bảo đánh giá đúng năng lực học sinh.',
      author: 'Quản lý',
      date: '2024-01-10',
      category: 'Mẹo & Thủ thuật',
      image: 'https://via.placeholder.com/400x250?text=Blog+Post+2'
    },
    {
      id: 3,
      title: 'Tận dụng công nghệ OCR trong chấm bài tự động',
      excerpt: 'Khám phá cách công nghệ OCR giúp giáo viên tiết kiệm thời gian và nâng cao độ chính xác khi chấm bài.',
      author: 'Nhân viên',
      date: '2024-01-05',
      category: 'Công nghệ',
      image: 'https://via.placeholder.com/400x250?text=Blog+Post+3'
    },
    {
      id: 4,
      title: 'Xây dựng ngân hàng câu hỏi chất lượng',
      excerpt: 'Hướng dẫn chi tiết về cách xây dựng và quản lý ngân hàng câu hỏi hiệu quả, đảm bảo chất lượng giáo dục.',
      author: 'Admin',
      date: '2024-01-01',
      category: 'Giáo dục',
      image: 'https://via.placeholder.com/400x250?text=Blog+Post+4'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blog PlanbookAI</h1>
              <p className="text-gray-600 mt-2">Chia sẻ kiến thức, mẹo và cập nhật mới nhất</p>
            </div>
            <Link
              to="/admin"
              className="flex items-center text-indigo-600 hover:text-indigo-700"
            >
              <FiArrowLeft className="mr-2" />
              Quay lại
            </Link>
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{post.id}</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                    {post.category}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
                  <div className="flex items-center">
                    <FiUser className="mr-1" size={14} />
                    {post.author}
                  </div>
                  <div className="flex items-center">
                    <FiCalendar className="mr-1" size={14} />
                    {new Date(post.date).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <Link
                  to={`/blog/${post.id}`}
                  className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  Đọc thêm →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

