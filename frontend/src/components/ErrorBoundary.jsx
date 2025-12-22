import React from 'react'
import { AlertCircle } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    this.setState({ error, info })
    console.error('Captured error in ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      const { error, info } = this.state
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
          <div className="max-w-3xl bg-white rounded-2xl shadow-lg border border-red-200 p-6">
            <div className="flex items-start space-x-4">
              <AlertCircle className="text-red-500" size={32} />
              <div>
                <h2 className="text-lg font-bold text-red-700">Une erreur est survenue</h2>
                <p className="text-sm text-gray-700 mt-2">L'application a rencontré une erreur de rendu. Voir les détails ci-dessous et rechargez la page.</p>
                <pre className="mt-4 bg-gray-100 p-3 rounded text-xs overflow-auto max-h-48">{error?.toString()}{info?.componentStack ? '\n\n' + info.componentStack : ''}</pre>
                <div className="mt-4 flex space-x-3">
                  <button onClick={() => window.location.reload()} className="px-3 py-2 bg-red-500 text-white rounded">Recharger</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
