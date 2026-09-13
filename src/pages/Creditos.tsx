import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Creditos() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-3xl mx-auto px-4">

          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block bg-brand-teal text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full mb-4">
              Equipo creativo
            </span>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
              🏔️ Peru In Travel
            </h1>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Sitio web de turismo diseñado para conectar a los viajeros con las experiencias más
              auténticas del Perú. Desde las alturas de los nevados hasta las profundidades de la
              selva, Peru In Travel nace con la misión de hacer el turismo local más accesible,
              confiable y memorable para todos.
            </p>
          </div>

          {/* Creadores */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              💡 Creadores de la Idea
            </h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4 p-4 bg-brand-teal/5 rounded-xl border border-brand-teal/20">
                <div className="w-10 h-10 bg-brand-teal rounded-full flex items-center justify-center text-white font-bold shrink-0">
                  AG
                </div>
                <div>
                  <p className="font-bold text-gray-900">Anthony Galvan</p>
                  <p className="text-sm text-brand-teal font-medium">Desarrollador del sistema web</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Estudiante de Ingeniería — Universidad Ricardo Palma
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-brand-yellow/5 rounded-xl border border-brand-yellow/20">
                <div className="w-10 h-10 bg-brand-yellow rounded-full flex items-center justify-center text-white font-bold shrink-0">
                  EL
                </div>
                <div>
                  <p className="font-bold text-gray-900">Elian Liz Eugenio Saldaña</p>
                  <p className="text-sm text-brand-yellow-d font-medium">Creadora de la idea del sitio web</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Estudiante de Administración de Turismo — Universidad Nacional Mayor de San Marcos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Co-creadores */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              🤝 Co-Creadores y Colaboradores
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { initials: 'JC', name: 'Jhennyfer Isabel Corcino Cochachin' },
                { initials: 'AP', name: 'Anthony Brian Picon Villacis' },
                { initials: 'NB', name: 'Nicole Alexandra Bolívar Chofa' },
                { initials: 'CR', name: 'Claudia Daniela Ramos Molina' },
              ].map((c) => (
                <div key={c.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs shrink-0">
                    {c.initials}
                  </div>
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer nota */}
          <div className="text-center text-xs text-gray-400 mt-8">
            <p>📅 Proyecto desarrollado en 2026 · 🇵🇪 Hecho con amor desde Perú</p>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
