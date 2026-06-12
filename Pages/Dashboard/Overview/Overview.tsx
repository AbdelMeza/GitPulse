import "./Overview.scss"
import { Flame } from "lucide-react"
import KPI from "../../../Components/KPI/KPI"
import c from "../../../src/Style/_config.module.scss"
import useUserDataStore from "../../../Stores/userData.store"
import { CommitChartInteractive } from "../../../Components/CommitChartInteractive/CommitChartInteractive"

export default function Overview() {
    const { user_data, loading_state } = useUserDataStore()
    const activity = user_data?.recent_activities

    return <div className="overview-page">
        <div className="KPIs-wrapper">
            <KPI title={"Total public repos"} data={user_data?.stats?.public_repos_count} loadingState={loading_state} />
            <KPI title={"Total contributions"} data={user_data?.stats?.total_lifetime_contributions} loadingState={loading_state} />
            <KPI title={"Monthly contributions"} data={[user_data?.stats?.current_month_contributions, user_data?.stats?.performance_delta_percent]} loadingState={loading_state} />
            <KPI title={"Longest streak"} data={
                <>
                    <Flame strokeWidth={1.5} color={c.textColorShade200} />
                    {user_data?.stats?.longest_streak}
                </>
            } loadingState={loading_state} />
        </div>
        <div className="performance-chart">
            <CommitChartInteractive data={(user_data as any)?.commit_comparison_data} performanceDelta={(user_data as any)?.stats.performance_delta_percent} loadingState={loading_state} />
        </div>
        <div className="activities-container">
            <div className="header">
                <span className="header-text">Recent activity</span>
            </div>
            <div className="activities-wrapper">
                {loading_state ? [0, 0, 0].map((_, i) => (
                    <div className="loading-item" key={i}></div>
                )) : activity && activity.length > 0 ?
                    activity.map((a, i) => (
                        <a href={a.url} target="_blank" rel="noopener noreferrer" className="activity-item" key={i}>
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
                            <div className="main-content">
                                <span className="activity-title">{a.title}</span>
                            </div>
                            <div className="footer-content">
                                <span className="activity-type badge">{a.type}</span>
                            </div>

                        </a>
                    ))
                    : <div className="empty-data">
                        <span className="text">No data available</span>
                    </div>
                }
            </div>
        </div>
    </div>
}