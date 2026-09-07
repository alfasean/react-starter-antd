import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorPage } from './error-page';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

/**
 * The one class component in this codebase — React has no hook equivalent for
 * `componentDidCatch`. Everything else is a function component; see
 * .claude/rules/components-and-logic.md.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Replace with your error reporting service.
    console.error('Uncaught render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <ErrorPage status="500" />;
    }

    return this.props.children;
  }
}
