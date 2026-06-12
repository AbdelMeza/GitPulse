
import "./Dashboard.scss"
import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "../../Components/SideBar/SideBar"
import useUserDataStore from "../../Stores/userData.store"

export default function Dashboard() {
    const { get_user_data } = useUserDataStore()

    useEffect(() => {
        const fetchData = async () => {
            try {
                await get_user_data()
            } catch (err) {
                console.error("Failed to load user in dashboard", err)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="dashboard-page">
            <Sidebar />
            <div className="content">
                <Outlet />
            </div>
        </div>

    )
}