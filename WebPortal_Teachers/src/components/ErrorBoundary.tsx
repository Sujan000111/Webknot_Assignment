import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: any };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error("App error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h1 style={{ fontSize: 20, marginBottom: 12 }}>Something went wrong.</h1>
          <pre style={{ whiteSpace: "pre-wrap", color: "#b91c1c" }}>
            {String(this.state.error?.message || this.state.error || "Unknown error")}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;



