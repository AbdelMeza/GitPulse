import "./KPI.scss"
import { TrendingDown, TrendingUp } from "lucide-react"

type KPIdata = {
    title: string
    data: any
    loadingState: boolean
}

export default function KPI({ title, data, loadingState }: KPIdata) {
    return (
        <div className={`KPI-container ${loadingState ? "loading" : ""}`}>
            <div className="content">
                <span className="title-container">{title}</span>
            </div>
            <div className="content">
                <span className="data-container">
                    {loadingState ? "" : Array.isArray(data) ?
                        <span className="data-content">
                            <span className="data-value">{data[0]}</span>
                            <span className="performance-delta-pourcent">{data[1] > 0 ? <TrendingUp size={15}/> : <TrendingDown size={15} />} {data[1]}%</span>
                        </span>
                        : data
                    }
                </span>
            </div>
        </div>
    )
}