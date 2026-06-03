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
        <div className="min-h-screen flex items-center justify-center p-6 bg-cream-light">
          <div className="bg-white rounded-2xl border border-border shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={26} className="text-accent" />
            </div>
            <h2 className="font-display text-xl text-primary mb-2">
              Oops! Terjadi Kesalahan
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              Sepertinya ada yang tidak beres. Coba muat ulang halaman atau kembali ke beranda.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 h-11 px-5 text-sm font-semibold text-cream bg-primary rounded-xl hover:bg-primary-hover active:scale-95 transition-all"
              >
                <RefreshCw size={15} />
                Coba Lagi
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 h-11 px-5 text-sm font-semibold text-text-secondary bg-surface-alt border border-border rounded-xl hover:bg-cream active:scale-95 transition-all"
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
