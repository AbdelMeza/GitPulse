import "./RecentAcitivites.scss"
import ActivityItem from "./AcitvityItem/AcitivityItem"
import useUserDataStore from "../../Stores/userData.store"

export default function RecentActivities() {
    const { user_data, loading_state } = useUserDataStore()
    const activity = user_data?.recent_activities

    return <div className="recent-activities">
        {loading_state ? [0, 0, 0, 0].map((_, i) => (
            <div className="loading-item" key={i}></div>
        )) : activity && activity.length > 0 ?
            activity.map((a, i) => (
                <ActivityItem data={a} />
            ))
            : <div className="empty-data">
                <span className="text">No data available</span>
            </div>
        }
    </div>
}