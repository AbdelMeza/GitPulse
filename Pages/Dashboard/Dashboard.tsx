
import "./Dashboard.scss"
import { useEffect } from "react"
import useUserDataStore from "../../Stores/userData.store"
import { CommitChartInteractive } from "./CommitChartInteractive/CommitChartInteractive"
import { Sidebar } from "../../Components/SideBar/SideBar"
import KPI from "../../Components/KPI/KPI"

export default function Dashboard() {
    const { user_data, get_user_data, loading_state } = useUserDataStore()

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
            {/* <Sidebar /> */}
            <div className="content">
                <div className="KPIs-wrapper">
                    <KPI title={"Total public repos"} data={user_data?.stats?.public_repos_count} loadingState={loading_state} />
                    <KPI title={"Total contributions"} data={user_data?.stats?.total_lifetime_contributions} loadingState={loading_state} />
                    <KPI title={"Monthly contributions"} data={[user_data?.stats?.current_month_contributions, user_data?.stats?.performance_delta_percent]} loadingState={loading_state} />
                    <KPI title={"Longest streak"} data={
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                            </svg>
                            {user_data?.stats?.longest_streak}
                        </>
                    } loadingState={loading_state} />
                </div>
                <div className="performance-chart">
                    <CommitChartInteractive data={(user_data as any)?.commit_comparison_data} performanceDelta={(user_data as any)?.stats.performance_delta_percent} />
                </div>
            </div>
        </div>

    )
}