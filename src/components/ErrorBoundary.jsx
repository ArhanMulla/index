import { Component } from 'react';
import { C, F } from '../theme';

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error('[INDEX] Caught an unexpected error:', error, info); }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: C.canvas, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: F.body }}>
          <div style={{ maxWidth: 440, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h1 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 600, color: C.text, marginBottom: 10 }}>Something went wrong</h1>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 24 }}>
              An unexpected error occurred. This has been logged — refreshing the page usually fixes it.
            </p>
            <button onClick={() => window.location.reload()} style={{ padding: '11px 28px', background: C.signal, border: 'none', borderRadius: 999, color: C.ink, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F.body }}>
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
