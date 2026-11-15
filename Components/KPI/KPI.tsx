import "./KPI.scss"

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
                    {loadingState ? "" :
                        <span className="data-content">
                            <span className="data-value">{data}</span>
                        </span>
                    }
                </span>
            </div>
        </div>
    )
}