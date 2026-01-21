import { Link } from 'react-router-dom'
import { Heart, User, Menu, X, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'

function Header() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-semibold text-secondary hidden sm:block">
              A Donde Vivir
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-secondary hover:text-primary transition-colors font-medium"
            >
              Propiedades
            </Link>
            {user && (
              <Link
                to="/favorites"
                className="text-secondary hover:text-primary transition-colors font-medium flex items-center gap-1"
              >
                <Heart className="w-4 h-4" />
                Favoritos
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-full border border-border hover:shadow-md transition-shadow"
                >
                  <User className="w-5 h-5 text-muted" />
                  <span className="text-sm font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-muted hover:text-secondary transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-secondary"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              className="block px-3 py-2 text-secondary hover:bg-surface rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Propiedades
            </Link>
            {user ? (
              <>
                <Link
                  to="/favorites"
                  className="block px-3 py-2 text-secondary hover:bg-surface rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Favoritos
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-secondary hover:bg-surface rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mi perfil
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:bg-surface rounded-lg"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link
                  to="/login"
                  className="block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="secondary" className="w-full">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link
                  to="/register"
                  className="block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
