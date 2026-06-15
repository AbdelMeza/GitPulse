import "./Overview.scss"
import { Flame } from "lucide-react"
import g from "./Overview.module.scss"
import KPI from "../../../Components/KPI/KPI"
import c from "../../../src/Style/_config.module.scss"
import { GitHubCalendar } from "react-github-calendar"
import useUserDataStore from "../../../Stores/userData.store"
import PerformanceDelta from "../../../Components/PerformanceDelta/PerformanceDelta"
import RecentActivities from "../../../Components/RecentActivities/RecentAcitivites"
import { CommitChartInteractive } from "../../../Components/CommitChartInteractive/CommitChartInteractive"

export default function Overview() {
    const { user_data, loading_state } = useUserDataStore()
    const activity = user_data?.recent_activities
    const githubCalenderData = {
        username: user_data?.identity?.username || "",
        year: new Date().getFullYear(),
        showColorLegend: false,
        showTotalCount: false,
        showWeekdayLabels: true,
        theme: {
            dark: [
                g.contributionLvl1,
                g.contributionLvl2,
                g.contributionLvl3,
                g.contributionLvl4,
                g.contributionLvl5,
            ],
        },
    }

    return <div className="overview-page">
        <div className="KPIs-wrapper">
            <KPI title={"Total public repos"} data={user_data?.stats?.public_repos_count} loadingState={loading_state} />
            <KPI title={"Total contributions"} data={user_data?.stats?.total_lifetime_contributions} loadingState={loading_state} />
            <KPI title={"Monthly contributions"} data={
                <>
                    {user_data?.stats.current_month_contributions}
                    <PerformanceDelta loadingState={loading_state} />
                </>
            } loadingState={loading_state} />
            <KPI title={"Longest streak"} data={
                <>
                    {user_data?.stats?.longest_streak}
                    <Flame strokeWidth={1.5} color={c.textColorShade200} />
                </>
            } loadingState={loading_state} />
        </div>
        <div className="contributions-grid">
            <div className={`grid-container ${loading_state ? "loading" : ""}`}>
                {!loading_state && user_data?.identity?.username ? (
                    <GitHubCalendar
                        loading={loading_state}
                        username={githubCalenderData.username}
                        year={githubCalenderData.year}
                        theme={githubCalenderData.theme}
                        showColorLegend={githubCalenderData.showColorLegend}
                        showTotalCount={githubCalenderData.showTotalCount}
                        showWeekdayLabels={githubCalenderData.showWeekdayLabels}
                        blockSize={13}
                        tooltips={{
                            activity: {
                                text: activity => <>
                                    <span>
                                        <span className="color" style={{ backgroundColor: githubCalenderData.theme.dark[activity.level] }}></span>
                                        {activity.count} contributions on {activity.date}
                                    </span>
                                </>,
                                placement: 'right',
                                offset: 6,
                                transitionStyles: {
                                    duration: 100,
                                },
                            },
                        }}
                    />
                ) : (
                    loading_state ? "" :
                        <div className="empty-data">
                            <span className="text">No data available</span>
                        </div>
                )}
            </div>
            <span className={`update-note ${loading_state ? "loading" : ""}`}>{loading_state ? "" : "Update may take a few minutes"}</span>
        </div>
        <div className="performance-chart">
            <CommitChartInteractive data={(user_data as any)?.contribution_comparison_data} performanceDelta={(user_data as any)?.stats.performance_delta_percent} loadingState={loading_state} />
        </div>
        <div className="activities-container">
            <div className="header">
                <span className="header-text">Recent activities</span>
            </div>
            <RecentActivities />
        </div>
    </div>
}