
import "./Dashboard.scss"
import { useEffect } from "react"
import useUserDataStore from "../../Stores/userData.store"
import { CommitChartInteractive } from "./CommitChartInteractive/CommitChartInteractive"

export default function Dashboard() {
    const { user_data, get_user_data } = useUserDataStore()

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
            {user_data ? (
                <CommitChartInteractive data={(user_data as any)?.commit_comparison_data} performanceDelta={(user_data as any)?.stats.performance_delta_percent}/>
            ) : (
                <div className="flex h-[350px] w-full items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/20">
                    <span className="text-sm text-neutral-500 animate-pulse">
                        Loading production metrics...
                    </span>
                </div>
            )}
        </div>

    )
}