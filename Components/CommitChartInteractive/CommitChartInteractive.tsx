import "./CommitChartInteractive.scss"
import chart from "./CommitChart.module.scss"
import { TrendingDown, TrendingUp } from "lucide-react"
import { useRef, useState, useEffect, useMemo } from "react"
import { Area, AreaChart, XAxis, ResponsiveContainer, Tooltip } from "recharts"

interface ComparisonData {
  dayIndex: number;
  currentMonthDate: string;
  lastMonthDate: string;
  currentCommits: number;
  lastCommits: number;
}

interface CommitChartInteractiveProps {
  data: ComparisonData[];
  performanceDelta?: number | undefined;
  loadingState: boolean;
}

type FilteredData = {
  currentCommits: number
  currentMonthDate: string
  dayIndex: number
  displayIndex: number
  lastCommits: number
  lastMonthDate: string
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

export function CommitChartInteractive({ data = [], performanceDelta, loadingState }: CommitChartInteractiveProps) {
  const [timeRange, setTimeRange] = useState("30d")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const filteredData = useMemo(() => {
    const daysToKeep = timeRange === "7d" ? 7 : 30
    if (!data || data.length === 0) return []
    return data.slice(-daysToKeep).map((item, index) => ({
      ...item,
      displayIndex: index + 1
    }))
  }, [data, timeRange])

  const chartChart = useRef<null | HTMLDivElement>(null)

  return (
    <div className="gitpulse-chart-card" ref={chartChart}>
      <ChartHeader performanceDelta={performanceDelta} timeRange={timeRange} setTimeRange={setTimeRange} loadingState={loadingState} />
      <div className="chart-content">
        <div className="chart-wrapper">
          {loadingState ? <LoadingChart /> :
            isMounted && filteredData.length > 0 ? <CommitsChart filteredData={filteredData} /> :
              <div className="empty-data">
                <span className="text">No data available</span>
              </div>
          }
        </div>
      </div>
    </div>
  )
}

interface ChartHeaderProps {
  performanceDelta: number | undefined
  timeRange: string
  setTimeRange: (range: string) => void
  loadingState: boolean
}

function ChartHeader({ performanceDelta, timeRange, setTimeRange, loadingState }: ChartHeaderProps) {
  const isUp = (performanceDelta ?? 0) >= 0

  return (
    <div className="chart-header">
      <div className="header-info">
        <span className="chart-title">Compare your performance</span>
        <div className="chart-infos">
          <div className="chart-data">
            <span className="data-color" style={{ backgroundColor: chart.currentDataColor }}></span>
            <span className="data-value">Current period</span>
          </div>
          <div className="chart-data">
            <span className="data-color" style={{ backgroundColor: chart.lastDataColor }}></span>
            <span className="data-value">Last period</span>
          </div>
        </div>
      </div>
      <div className="header-actions">
        <div className={`performance-badge ${loadingState ? "loading" : ""} ${loadingState ? '' : (isUp ? 'up' : 'down')}`}>
          {loadingState ? "" : (
            <>
              {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{isUp ? `+${performanceDelta}` : performanceDelta}%</span>
            </>
          )}
        </div>
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="chart-select">
          <option value="30d">Month</option>
          <option value="7d">Week</option>
        </select>
      </div>
    </div>
  )
}

function LoadingChart() {
  return <div className="loading-chart"></div>
}

function CommitsChart({ filteredData }: { filteredData: FilteredData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%" debounce={50}>
      <AreaChart data={filteredData} margin={{ top: 10, right: 5, left: 5, bottom: 0 }}>
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
  )
}