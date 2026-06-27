"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center bg-white border border-red-200 rounded-lg shadow-sm max-w-lg mx-auto my-12">
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-950 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-6">
            An unexpected client-side error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-black bg-[#FF9900] hover:bg-[#e8890a] shadow-sm transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2 animate-spin-hover" />
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
