import React from "react";

type RuntimeErrorBoundaryState = {
  hasError: boolean;
};

type RuntimeErrorBoundaryProps = {
  children: React.ReactNode;
};

export default class RuntimeErrorBoundary extends React.Component<
  RuntimeErrorBoundaryProps,
  RuntimeErrorBoundaryState
> {
  state: RuntimeErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): RuntimeErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("RuntimeErrorBoundary intercepted a render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "#0b0b0b",
            color: "#fff",
            textAlign: "center",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 24 }}>Errore runtime</h1>
            <p style={{ marginTop: 12, color: "#d1d5db" }}>
              Si e verificato un problema in pagina. Ricarica per riprovare.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
