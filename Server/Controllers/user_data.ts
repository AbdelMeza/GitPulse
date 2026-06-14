import type { Response, Request } from "express"
import { calculateStreaks, getContributionTotalForPeriod, generateComparisonData } from "../Utils/stats.utils.ts"

interface GraphQLResponse {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number
          weeks: { contributionDays: { date: string; contributionCount: number }[] }[]
        }
      }
    }
  }
}

async function getLifetimeStats(username: string, token: string) {
  const query = `query($username: String!) { user(login: $username) { contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } } } }`
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { username } }),
  })
  return (await response.json()) as GraphQLResponse
}

export async function get_user_data(req: Request, res: Response): Promise<Response | void> {
  const token = req.cookies.github_token
  if (!token) return res.status(401).json({ error: "Unauthorized" })

  const headers = { Authorization: `Bearer ${token}`, Accept: "application/json", "User-Agent": "GitPulse-App" }

  try {
    const baseResponse = await fetch("https://api.github.com/user", { method: "GET", headers })
    if (!baseResponse.ok) return res.status(baseResponse.status).json({ error: "Failed to fetch user" })

    const userData = await baseResponse.json()
    const [reposRes, eventsRes, lifetimeData] = await Promise.all([
      fetch(`https://api.github.com/user/repos?per_page=50&sort=updated`, { method: "GET", headers }),
      fetch(`https://api.github.com/users/${userData.login}/events/public?per_page=30`, { method: "GET", headers }),
      getLifetimeStats(userData.login, token),
    ])

    const eventsData = eventsRes.ok ? await eventsRes.json() : []
    const reposData = reposRes.ok ? await reposRes.json() : []
    const calendar = lifetimeData.data?.user?.contributionsCollection?.contributionCalendar
    const allDays = calendar?.weeks.flatMap((w) => w.contributionDays) || []

    const { longestStreak, currentStreak } = calculateStreaks(allDays)
    const currentTotal = getContributionTotalForPeriod(allDays, 0)
    const lastTotal = getContributionTotalForPeriod(allDays, 30)

    const recentActivities = await Promise.all(
      eventsData.filter((e: any) => ["PushEvent", "CreateEvent", "IssueCommentEvent", "PullRequestEvent"].includes(e.type))
        .slice(0, 5)
        .map(async (e: any) => {
          let title = e.type
          if (e.type === "PushEvent") {
            const sha = e.payload.commits?.[e.payload.commits.length - 1]?.sha || e.payload.head
            const commitRes = await fetch(`https://api.github.com/repos/${e.repo.name}/commits/${sha}`, { headers })
            if (commitRes.ok) title = (await commitRes.json()).commit.message.split("\n")[0]
          }
          return { type: e.type, repo: e.repo.name, title, date: e.created_at, url: `https://github.com/${e.repo.name}` }
        })
    )

    return res.json({
      identity: { id: userData.id, username: userData.login, name: userData.name || userData.login, avatar: userData.avatar_url },
      stats: {
        public_repos_count: userData.public_repos,
        total_stars_received: reposData.reduce((acc: number, r: any) => acc + r.stargazers_count, 0),
        total_lifetime_contributions: calendar?.totalContributions || 0,
        current_month_contributions: currentTotal,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        performance_delta_percent: lastTotal > 0 ? Math.round(((currentTotal - lastTotal) / lastTotal) * 100) : 0,
      },
      contribution_comparison_data: generateComparisonData(allDays),
      recent_activities: recentActivities,
    })
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" })
  }
}