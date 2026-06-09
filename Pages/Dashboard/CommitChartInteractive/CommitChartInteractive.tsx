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
        <span className="color" style={{ backgroundColor: "#19ff97" }}></span>
        <span className="tooltip-period">{data.currentMonthDate}</span>
        <span className="tooltip-value">{data.currentCommits} {data.currentCommits > 1 ? "commits" : "commit"}</span>
      </div>
      <div className="tooltip-section last">
        <span className="color" style={{ backgroundColor: "#636363" }}></span>
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

  const totalCommitsOnPeriod = React.useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.currentCommits, 0)
  }, [filteredData])

  const isUp = performanceDelta >= 0

  const chartChart = useRef<null | HTMLDivElement>(null)

  return (
    <div className="gitpulse-chart-card" ref={chartChart}>
      <div className="chart-header">
        <div className="header-info">
          <span className="chart-title">Compare your performance</span>
          <p className="chart-description">
            {totalCommitsOnPeriod} {totalCommitsOnPeriod > 1 ? "commits" : "commit"} registered this period
          </p>
        </div>
        <div className="header-actions">
          <div className={`performance-badge ${isUp ? 'up' : 'down'}`}>
            {isUp ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            <span>{isUp ? `+${performanceDelta}` : performanceDelta}%</span>
          </div>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="chart-select">
            <option value="30d">Last 30 days</option>
            <option value="7d">Last 7 days</option>
          </select>
        </div>
      </div>
      <div className="chart-content">
        <div className="chart-wrapper">
          {isMounted && filteredData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <AreaChart data={filteredData} margin={{ top: 10, right: 25, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#19ff97" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#19ff97" stopOpacity={0} />
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
                <Area dataKey="currentCommits" type="monotone" fill="url(#fillCurrent)" stroke="#19ff97" strokeWidth={2} />
                <Area dataKey="lastCommits" type="monotone" fill="url(#fillLast)" stroke={chart.dataStrokeColor} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-loading-placeholder" style={{ width: "100%", height: "250px", display: "flex", alignItems: "center", justifyContent: "center", color: "#737373", fontSize: "13px" }}>
              {isMounted ? "No commit data available" : "Loading metrics..."}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}