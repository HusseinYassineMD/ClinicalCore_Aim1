"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

export default class ChartErrorBoundary extends Component<
  { children: ReactNode; fallbackTitle?: string },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ChartErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-6 text-center text-sm text-red-900">
          <p className="font-semibold">
            {this.props.fallbackTitle ?? "Charts could not load"}
          </p>
          <p className="mt-1 text-xs text-red-800/80">
            Refresh the page. If this persists, run{" "}
            <code className="font-mono">npm run dev:clean</code>.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
