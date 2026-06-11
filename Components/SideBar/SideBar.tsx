    import { Link, useLocation } from "react-router-dom"
import "./Sidebar.scss"

const menuItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Analytics", href: "/analytics" },
  { name: "Commits", href: "/commits" },
  { name: "Profile", href: "/profile" },
  { name: "Settings", href: "/settings" },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar-container">
      <div className="sidebar-logo">
        <span className="logo-text">GitPulse</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <p>© 2026 GitPulse Corp</p>
      </div>
    </aside>
  )
}