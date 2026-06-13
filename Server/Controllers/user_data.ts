import type { Response, Request } from "express";

interface ContributionDay {
  date: string;
  contributionCount: number;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface GraphQLResponse {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: ContributionWeek[];
        };
      };
    };
  };
}

async function getLifetimeStats(username: string, token: string) {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { username } }),
  });
  return (await response.json()) as GraphQLResponse;
}

export async function get_user_data(
  req: Request,
  res: Response,
): Promise<Response | void> {
  const token = req.cookies.github_token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "User-Agent": "GitPulse-App",
  };

  try {
    const baseResponse = await fetch("https://api.github.com/user", { method: "GET", headers });
    if (!baseResponse.ok) return res.status(baseResponse.status).json({ error: "Failed to fetch user" });

    const userData = await baseResponse.json();
    const username: string = userData.login;

    const [reposRes, eventsRes, lifetimeData] = await Promise.all([
      fetch(`https://api.github.com/user/repos?per_page=50&sort=updated`, { method: "GET", headers }),
      fetch(`https://api.github.com/users/${username}/events/public?per_page=30`, { method: "GET", headers }),
      getLifetimeStats(username, token),
    ]);

    const eventsData: any[] = eventsRes.ok ? await eventsRes.json() : [];
    const reposData: any[] = reposRes.ok ? await reposRes.json() : [];
    const calendar = lifetimeData.data?.user?.contributionsCollection?.contributionCalendar;
    
    // 1. Calcul des Stats et Streaks
    const allDays = calendar?.weeks.flatMap((w) => w.contributionDays) || [];
    let longestStreak = 0, currentStreak = 0, tempStreak = 0, countStreak = 0;

    allDays.forEach((day) => {
      if (day.contributionCount > 0) {
        tempStreak++;
        countStreak = tempStreak;
      } else {
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = 0;
      }
    });
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    currentStreak = countStreak;

    // 2. Comparaison des contributions (Mois actuel vs Mois précédent)
    const getContributionTotal = (daysOffset: number) => {
      const start = new Date(); start.setDate(new Date().getDate() - (daysOffset + 30));
      const end = new Date(); end.setDate(new Date().getDate() - daysOffset);
      return allDays.filter(d => new Date(d.date) >= start && new Date(d.date) <= end)
                    .reduce((acc, curr) => acc + curr.contributionCount, 0);
    };

    const comparisonData = Array.from({ length: 30 }).map((_, i) => {
      const dCur = new Date(); dCur.setDate(dCur.getDate() - i);
      const dLast = new Date(); dLast.setDate(dLast.getDate() - (i + 30));
      return {
        dayIndex: i + 1,
        currentMonthDate: dCur.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
        lastMonthDate: dLast.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
        currentContributions: allDays.find(d => d.date === dCur.toISOString().split("T")[0])?.contributionCount || 0,
        lastContributions: allDays.find(d => d.date === dLast.toISOString().split("T")[0])?.contributionCount || 0,
      };
    }).reverse();

    // 3. Activités récentes
    const recentActivities = await Promise.all(
      eventsData.filter(e => ["PushEvent", "CreateEvent", "IssueCommentEvent", "PullRequestEvent"].includes(e.type))
        .slice(0, 5)
        .map(async (e: any) => {
          let title = e.type, activityUrl = `https://github.com/${e.repo.name}`;
          if (e.type === "PushEvent") {
            const sha = e.payload.commits?.[e.payload.commits.length - 1]?.sha || e.payload.head;
            if (sha) {
              activityUrl = `https://github.com/${e.repo.name}/commit/${sha}`;
              const commitRes = await fetch(`https://api.github.com/repos/${e.repo.name}/commits/${sha}`, { headers });
              if (commitRes.ok) title = (await commitRes.json()).commit.message.split("\n")[0];
            }
          }
          return { type: e.type, repo: e.repo.name, title, date: e.created_at, url: activityUrl };
        })
    );

    return res.json({
      identity: { id: userData.id, username, name: userData.name || username, avatar: userData.avatar_url },
      stats: {
        public_repos_count: userData.public_repos,
        total_stars_received: reposData.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0),
        total_lifetime_contributions: calendar?.totalContributions || 0,
        current_month_contributions: getContributionTotal(0),
        current_streak: currentStreak,
        longest_streak: longestStreak,
        performance_delta_percent: getContributionTotal(30) > 0 ? Math.round(((getContributionTotal(0) - getContributionTotal(30)) / getContributionTotal(30)) * 100) : 0,
      },
      contribution_comparison_data: comparisonData,
      recent_activities: recentActivities,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}