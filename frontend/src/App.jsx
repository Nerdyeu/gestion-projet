import { Truck } from 'lucide-react'
import ErrorBoundary from './components/ErrorBoundary'
import SamsaraReport from './components/SamsaraReport'

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/40 to-red-50/40">
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow">
              <Truck className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800 leading-tight">Samsara Reports</h1>
              <p className="text-xs text-slate-400">Rapports de consommation de flotte</p>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <SamsaraReport />
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App
