import "./PerformanceDelta.scss"
import { TrendingDown, TrendingUp } from "lucide-react"
import useUserDataStore from "../../Stores/userData.store"

export default function PerformanceDelta({ loadingState }: { loadingState: boolean }) {
    const performanceDelta = useUserDataStore((state) => state.user_data?.stats?.performance_delta_percent)
    const isUp = (performanceDelta ?? 0) > 0

    return <div className={`performance-badge ${loadingState ? "loading" : ""} ${performanceDelta == 0 ? "" : loadingState ? '' : (isUp ? 'up' : 'down')}`}>
        {loadingState ? "" : (
            <>
                {performanceDelta !== undefined ? (performanceDelta == 0 ? "" : isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />) : ""}
                <span>{performanceDelta !== undefined ? (isUp ? `+${performanceDelta}` : performanceDelta) : "0"}%</span>
            </>
        )}
    </div>
}