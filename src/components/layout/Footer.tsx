// Footer — Server Component
export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <span className="text-[10px] font-bold text-white">HC</span>
              </div>
              <span className="text-sm font-bold text-text-main">Hub Convocatorias</span>
            </div>
            <p className="text-xs text-text-muted">
              Plataforma de gestión de convocatorias y postulaciones.
            </p>
          </div>
          <div className="flex gap-6 text-xs text-text-muted">
            <a href="/convocatorias" className="hover:text-text-main transition-colors">
              Convocatorias
            </a>
            <a href="/auth/login" className="hover:text-text-main transition-colors">
              Iniciar sesión
            </a>
            <a href="/auth/register" className="hover:text-text-main transition-colors">
              Registrarse
            </a>
          </div>
        </div>
        <div className="mt-6 border-t border-border pt-4">
          <p className="text-center text-xs text-text-muted">
            © {year} Hub Convocatorias. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
