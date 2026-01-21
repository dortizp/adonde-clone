import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-semibold text-secondary">
                A Donde Vivir
              </span>
            </Link>
            <p className="text-muted text-sm max-w-md">
              Encuentra tu hogar ideal en Lima. Departamentos, casas y más
              propiedades de las mejores inmobiliarias.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-secondary mb-4">Explorar</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-muted hover:text-secondary text-sm transition-colors"
                >
                  Propiedades
                </Link>
              </li>
              <li>
                <Link
                  to="/?district=Miraflores"
                  className="text-muted hover:text-secondary text-sm transition-colors"
                >
                  Miraflores
                </Link>
              </li>
              <li>
                <Link
                  to="/?district=San Isidro"
                  className="text-muted hover:text-secondary text-sm transition-colors"
                >
                  San Isidro
                </Link>
              </li>
              <li>
                <Link
                  to="/?district=Surco"
                  className="text-muted hover:text-secondary text-sm transition-colors"
                >
                  Surco
                </Link>
              </li>
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h3 className="font-semibold text-secondary mb-4">Cuenta</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/login"
                  className="text-muted hover:text-secondary text-sm transition-colors"
                >
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-muted hover:text-secondary text-sm transition-colors"
                >
                  Registrarse
                </Link>
              </li>
              <li>
                <Link
                  to="/favorites"
                  className="text-muted hover:text-secondary text-sm transition-colors"
                >
                  Favoritos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted text-sm">
            &copy; {new Date().getFullYear()} A Donde Vivir. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
