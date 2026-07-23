import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Sound Shepherd:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 selection:bg-blue-600 selection:text-white">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <AlertTriangle size={32} />
            </div>

            <h1 className="text-xl font-black uppercase tracking-wider text-white mb-2">
              Application Notice
            </h1>
            <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">
              Sound Shepherd encountered an unexpected runtime state. You can reload the workspace or reset session parameters below.
            </p>

            {this.state.error && (
              <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 text-left mb-6 font-mono text-[11px] text-red-300 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} className="animate-spin-slow" />
                Reload App
              </button>
              <a
                href="mailto:himpower2025@gmail.com"
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-700"
              >
                <Mail size={14} />
                Report Issue
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono tracking-widest">
              SOUND SHEPHERD • HIMPOWER PVT. LTD.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
