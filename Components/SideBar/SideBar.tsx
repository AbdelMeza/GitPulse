import "./Sidebar.scss"
import c from "../../src/Style/_config.module.scss"
import { Link, useLocation } from "react-router-dom"
import GitPulseIcon from "../GitPulseIcon/GitPulseIcon"
import useUserDataStore from "../../Stores/userData.store"

const menuItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Analytics", href: "/analytics" },
    { name: "Commits", href: "/commits" },
    { name: "Profile", href: "/profile" },
    { name: "Settings", href: "/settings" },
]

export function Sidebar() {
    const location = useLocation()
    const user = useUserDataStore((state) => state.user_data)

    return (
        <aside className="sidebar-container">
            <div className="upper-content">
                <div className="sidebar-logo">
                    <GitPulseIcon fill={c.textColorShade100} width={30}/>
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
                <div className="profile-icon-container">
                    <img width={25} src={user?.identity.avatar} alt="" className="profile-icon" />
                </div>
                <span className="profile-username">{user?.identity.username}</span>
            </div>
        </aside>
    )
}