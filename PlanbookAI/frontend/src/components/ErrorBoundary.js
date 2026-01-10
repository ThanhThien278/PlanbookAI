import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // ✅ Đảm bảo error message luôn là string
      const errorMessage = this.state.error?.message || 
        (typeof this.state.error === 'string' 
          ? this.state.error 
          : 'Có lỗi xảy ra khi tải trang');
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              ⚠️ Đã xảy ra lỗi
            </h1>
            <p className="text-gray-700 mb-4">
              {errorMessage}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tải lại trang
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-600">
                  Chi tiết lỗi (Dev only)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

