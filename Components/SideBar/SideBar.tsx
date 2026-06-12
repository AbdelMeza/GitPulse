import "./Sidebar.scss"
import { Contrast } from "lucide-react"
import useTheme from "../../Stores/useTheme"
import c from "../../src/Style/_config.module.scss"
import { Link, useLocation } from "react-router-dom"
import GitPulseIcon from "../GitPulseIcon/GitPulseIcon"
import useUserDataStore from "../../Stores/userData.store"

const menuItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Analytics", href: "/dashboard/analytics" },
    { name: "Commits", href: "/dashboard/commits" },
    { name: "Profile", href: "/dashboard/profile" },
    { name: "Settings", href: "/dashboard/settings" },
]

export function Sidebar() {
    const location = useLocation()
    const user = useUserDataStore((state) => state.user_data)
    const loading = useUserDataStore((state) => state.loading_state)
    const { switchTheme } = useTheme()

    return (
        <aside className="sidebar-container">
            <div className="upper-content">
                <div className="sidebar-logo">
                    <GitPulseIcon fill={c.textColorShade100} width={30} />
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
            </div>

            <div className="lower-content profile">
                <div className="content">
                    <div className={`profile-icon-container ${loading ? "loading" : ""}`}>
                        <img width={25} src={user?.identity.avatar} alt="" className="profile-icon" />
                    </div>
                    <span className={`profile-username ${loading ? "loading" : ""}`}>{user?.identity.username}</span>
                </div>
                <div className="content">
                    <div className="switch-theme-btn" onClick={() => switchTheme()}>
                        <Contrast width={20} strokeWidth={1.5} color={c.textColorShade200} />
                    </div>
                </div>
            </div>
        </aside>
    )
}