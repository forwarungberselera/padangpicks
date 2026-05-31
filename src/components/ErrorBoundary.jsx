import { Component } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-white rounded-[22px] shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-black text-[#58151c] mb-2">
              Oops! Terjadi Kesalahan
            </h2>
            <p className="text-muted mb-6 text-sm">
              Sepertinya ada yang tidak beres. Coba muat ulang halaman atau kembali ke beranda.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-accent-dark transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </button>
              <a
                href="/"
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-text-main font-bold rounded-full hover:bg-gray-200 transition-colors text-sm"
              >
                Ke Beranda
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
