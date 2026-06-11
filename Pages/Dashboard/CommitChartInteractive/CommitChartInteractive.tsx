import { useRef } from "react"
import * as React from "react"
import "./CommitChartInteractive.scss"
import c from "../../../src/Style/_config.module.scss"
import chart from "./CommitChart.module.scss"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip } from "recharts"

interface ComparisonData {
  dayIndex: number;
  currentMonthDate: string;
  lastMonthDate: string;
  currentCommits: number;
  lastCommits: number;
}

interface CommitChartInteractiveProps {
  data: ComparisonData[];
  performanceDelta?: number;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null
  const data = payload[0].payload
  return (
    <div className="custom-chart-tooltip">
      <div className="tooltip-section current">
        <span className="color" style={{ backgroundColor: chart.currentDataColor }}></span>
        <span className="tooltip-period">{data.currentMonthDate}</span>
        <span className="tooltip-value">{data.currentCommits} {data.currentCommits > 1 ? "commits" : "commit"}</span>
      </div>
      <div className="tooltip-section last">
        <span className="color" style={{ backgroundColor: chart.lastDataColor }}></span>
        <span className="tooltip-period">{data.lastMonthDate}</span>
        <span className="tooltip-value">{data.lastCommits} {data.lastCommits > 1 ? "commits" : "commit"}</span>
      </div>
    </div>
  )
}

export function CommitChartInteractive({ data = [], performanceDelta = 0 }: CommitChartInteractiveProps) {
  const [timeRange, setTimeRange] = React.useState("30d")
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const filteredData = React.useMemo(() => {
    const daysToKeep = timeRange === "7d" ? 7 : 30
    if (!data || data.length === 0) return []
    return data.slice(-daysToKeep).map((item, index) => ({
      ...item,
      displayIndex: index + 1
    }))
  }, [data, timeRange])

  const isUp = performanceDelta >= 0

  const chartChart = useRef<null | HTMLDivElement>(null)

  return (
    <div className="gitpulse-chart-card" ref={chartChart}>
      <div className="chart-header">
        <div className="header-info">
          <span className="chart-title">Compare your performance</span>
          <div className="chart-infos">
            <div className="chart-data">
              <span className="data-color" style={{ backgroundColor: chart.currentDataColor }}></span>
              <span className="data-value">This month</span>
            </div>
            <div className="chart-data">
              <span className="data-color" style={{ backgroundColor: chart.lastDataColor }}></span>
              <span className="data-value">Last month</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <div className={`performance-badge ${isUp ? 'up' : 'down'}`}>
            {isUp ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            <span>{isUp ? `+${performanceDelta}` : performanceDelta}%</span>
          </div>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="chart-select">
            <option value="30d">Month</option>
            <option value="7d">Week</option>
          </select>
        </div>
      </div>
      <div className="chart-content">
        <div className="chart-wrapper">
          {isMounted && filteredData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <AreaChart data={filteredData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chart.currentDataColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={chart.currentDataColor} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillLast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chart.lastDataColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={chart.lastDataColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={c.strokeColor} strokeDasharray="4 4" />
                <XAxis
                  dataKey="displayIndex"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  interval="preserveStartEnd"
                  minTickGap={30}
                  tickFormatter={(val) => `Day ${val}`}
                />
                <Tooltip cursor={false} content={<CustomTooltip />} />
                <Area dataKey="currentCommits" type="monotone" fill="url(#fillCurrent)" stroke={chart.currentDataColor} strokeWidth={2} />
                <Area dataKey="lastCommits" type="monotone" fill="url(#fillLast)" stroke={chart.lastDataColor} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-loading-placeholder" style={{ width: "100%", height: "250px", display: "flex", alignItems: "center", justifyContent: "center", color: "#737373", fontSize: "13px" }}>
              {isMounted ? "No commit data available" : "Loading metrics..."}
            </div>
          )}
        </div>
      </div>
    </div >
  )
}
