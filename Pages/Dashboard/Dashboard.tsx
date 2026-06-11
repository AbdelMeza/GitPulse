
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

    const activity = user_data?.recent_activities

    console.log(activity)

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
                <div className="activities-container">
                    <div className="header">
                        <span className="header-text">Recent activity</span>
                    </div>
                    <div className="activities-wrapper">
                        {activity && activity.length > 0 ?
                            activity.map((a, i) => (
                                <a href={a.url} target="_blank" rel="noopener noreferrer" className="activity-item" key={i}>

                                    {/* Ligne 1 : Dépôt et Date (Métadonnées) */}
                                    <div className="meta-content">
                                        <div className="repo-info">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                                                <path d="M9 18c-4.51 2-5-2-7-2"></path>
                                            </svg>
                                            <span className="repo">{a.repo}</span>
                                        </div>
                                        <span className="date">
                                            {new Date(a.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>

                                    {/* Ligne 2 : Titre principal (Le commit / l'action) */}
                                    <div className="main-content">
                                        <span className="activity-title">{a.title}</span>
                                    </div>

                                    {/* Ligne 3 : Le badge du type d'événement */}
                                    <div className="footer-content">
                                        <span className="activity-type badge">{a.type}</span>
                                    </div>

                                </a>
                            ))
                            : null
                        }
                    </div>
                </div>
            </div>
        </div>

    )
}