/**
 * App.jsx
 * Main application shell with routing, layout, and error boundary.
 */
import { Component, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppProvider } from './context/AppContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import PageTransition from './components/PageTransition.jsx'

// ─── Lazy-loaded Pages ────────────────────────────────────────────────────────

const Landing = lazy(() => import('./pages/Landing.jsx'))
const DataUpload = lazy(() => import('./pages/DataUpload.jsx'))
const DataCleaning = lazy(() => import('./pages/DataCleaning.jsx'))
const EDA = lazy(() => import('./pages/EDA.jsx'))
const Recommendation = lazy(() => import('./pages/Recommendation.jsx'))
const Training = lazy(() => import('./pages/Training.jsx'))
const CodeGenerator = lazy(() => import('./pages/CodeGenerator.jsx'))
const AIAssistant = lazy(() => import('./pages/AIAssistant.jsx'))
const ModelExport = lazy(() => import('./pages/ModelExport.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))

// ─── Error Boundary ───────────────────────────────────────────────────────────

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-8"
          style={{ backgroundColor: 'var(--color-bg-primary)' }}
        >
          <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Something went wrong
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)' }}
            >
              Reload Application
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Loading Fallback ─────────────────────────────────────────────────────────

function LoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
        />
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Loading...
        </p>
      </div>
    </div>
  )
}

// ─── Animated Routes ──────────────────────────────────────────────────────────

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Landing />
            </PageTransition>
          }
        />
        <Route
          path="/upload"
          element={
            <PageTransition>
              <DataUpload />
            </PageTransition>
          }
        />
        <Route
          path="/cleaning"
          element={
            <PageTransition>
              <DataCleaning />
            </PageTransition>
          }
        />
        <Route
          path="/eda"
          element={
            <PageTransition>
              <EDA />
            </PageTransition>
          }
        />
        <Route
          path="/recommendation"
          element={
            <PageTransition>
              <Recommendation />
            </PageTransition>
          }
        />
        <Route
          path="/training"
          element={
            <PageTransition>
              <Training />
            </PageTransition>
          }
        />
        <Route
          path="/code"
          element={
            <PageTransition>
              <CodeGenerator />
            </PageTransition>
          }
        />
        <Route
          path="/assistant"
          element={
            <PageTransition>
              <AIAssistant />
            </PageTransition>
          }
        />
        <Route
          path="/export"
          element={
            <PageTransition>
              <ModelExport />
            </PageTransition>
          }
        />
        <Route
          path="/settings"
          element={
            <PageTransition>
              <Settings />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

// ─── App Layout ───────────────────────────────────────────────────────────────

function AppLayout() {
  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <Sidebar />
      <main className="flex-1 overflow-auto md:ml-0">
        <Suspense fallback={<LoadingFallback />}>
          <AnimatedRoutes />
        </Suspense>
      </main>
    </div>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  )
}
