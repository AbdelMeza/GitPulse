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
    const baseResponse = await fetch("https://api.github.com/user", {
      method: "GET",
      headers,
    });
    if (!baseResponse.ok)
      return res
        .status(baseResponse.status)
        .json({ error: "Failed to fetch user" });

    const userData = await baseResponse.json();
    const username: string = userData.login;

    const [reposRes, eventsRes, commitsSearchRes, lifetimeData] =
      await Promise.all([
        fetch(`https://api.github.com/user/repos?per_page=50&sort=updated`, {
          method: "GET",
          headers,
        }),
        fetch(
          `https://api.github.com/users/${username}/events/public?per_page=30`,
          { method: "GET", headers },
        ),
        fetch(
          `https://api.github.com/search/commits?q=author:${username}+author-date:>=${new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}&per_page=100&sort=author-date&order=desc`,
          {
            method: "GET",
            headers: {
              ...headers,
              Accept: "application/vnd.github.cloak-preview+json",
            },
          },
        ),
        getLifetimeStats(username, token),
      ]);

    const eventsData: any[] = eventsRes.ok ? await eventsRes.json() : [];
    const reposData: any[] = reposRes.ok ? await reposRes.json() : [];
    const commitsSearchData: any = commitsSearchRes.ok
      ? await commitsSearchRes.json()
      : { items: [] };

    const calendar =
      lifetimeData.data?.user?.contributionsCollection?.contributionCalendar;
    const totalLifetime = calendar?.totalContributions || 0;

    let longestStreak = 0;
    let currentStreak = 0;
    let tempStreak = 0;
    let countStreak = 0;

    calendar?.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        if (day.contributionCount > 0) {
          tempStreak++;
          countStreak = tempStreak;
        } else {
          if (tempStreak > longestStreak) longestStreak = tempStreak;
          tempStreak = 0;
        }
      });
    });
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    currentStreak = countStreak;

    const rawCommitsMap: Record<string, number> = {};
    (commitsSearchData.items as any[]).forEach((item: any) => {
      const rawDate = item.commit?.author?.date || item.commit?.committer?.date;
      if (rawDate) {
        const dateKey = rawDate.split("T")[0];
        rawCommitsMap[dateKey] = (rawCommitsMap[dateKey] || 0) + 1;
      }
    });

    const currentMonthData: { dateLabel: string; count: number }[] = [];
    const lastMonthData: { dateLabel: string; count: number }[] = [];
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
    });

    for (let i = 0; i < 30; i++) {
      const dateCur = new Date();
      dateCur.setDate(dateCur.getDate() - i);
      const curKey = dateCur.toISOString().split("T")[0];
      currentMonthData.push({
        dateLabel: dateFormatter.format(dateCur),
        count: rawCommitsMap[curKey] || 0,
      });

      const dateLast = new Date();
      dateLast.setDate(dateLast.getDate() - (i + 30));
      const lastKey = dateLast.toISOString().split("T")[0];
      lastMonthData.push({
        dateLabel: dateFormatter.format(dateLast),
        count: rawCommitsMap[lastKey] || 0,
      });
    }

    const currentMonthTotal = currentMonthData.reduce(
      (acc, curr) => acc + curr.count,
      0,
    );
    const lastMonthTotal = lastMonthData.reduce(
      (acc, curr) => acc + curr.count,
      0,
    );

    // Filtrage des 5 activités les plus pertinentes
    const topEvents = eventsData
      .filter((e: any) =>
        [
          "PushEvent",
          "CreateEvent",
          "IssueCommentEvent",
          "PullRequestEvent",
        ].includes(e.type),
      )
      .slice(0, 5);

    // Résolution asynchrone des détails de chaque activité
    const recentActivities = await Promise.all(
      topEvents.map(async (e: any) => {
        let title = e.type;
        let activityUrl = `https://github.com/${e.repo.name}`;

        if (e.type === "PushEvent") {
          const commits = e.payload.commits || [];
          // Récupération du commit le plus récent (le dernier du tableau)
          const latestCommit = commits[commits.length - 1];
          const sha = latestCommit?.sha || e.payload.head;

          if (sha) {
            activityUrl = `https://github.com/${e.repo.name}/commit/${sha}`;
            try {
              // Requête ciblée directe sur l'API du commit pour obtenir le vrai titre
              const commitRes = await fetch(
                `https://api.github.com/repos/${e.repo.name}/commits/${sha}`,
                { headers },
              );

              if (commitRes.ok) {
                const commitData = await commitRes.json();
                // Extraction de la première ligne (sujet du commit)
                title = commitData.commit.message.split("\n")[0];
              } else {
                title = latestCommit?.message?.split("\n")[0] || "Pushed code";
              }
            } catch (err) {
              title = latestCommit?.message?.split("\n")[0] || "Pushed code";
            }
          } else {
            const branch = e.payload.ref?.replace("refs/heads/", "");
            title = `Pushed to ${branch || "repository"}`;
            activityUrl = `https://github.com/${e.repo.name}/tree/${branch || ""}`;
          }
        } else if (e.type === "PullRequestEvent") {
          title = e.payload.pull_request?.title || "Opened PR";
          activityUrl = e.payload.pull_request?.html_url;
        } else if (e.type === "IssueCommentEvent") {
          title = e.payload.issue?.title || "Commented on issue";
          activityUrl = e.payload.comment?.html_url;
        } else if (e.type === "CreateEvent") {
          title = `Created ${e.payload.ref_type} ${e.payload.ref || ""}`.trim();
        }

        return {
          type: e.type,
          repo: e.repo.name,
          title,
          date: e.created_at,
          url: activityUrl,
        };
      }),
    );

    return res.json({
      identity: {
        id: userData.id,
        username,
        name: userData.name || username,
        avatar: userData.avatar_url,
      },
      stats: {
        public_repos_count: userData.public_repos,
        total_stars_received: reposData.reduce(
          (acc: number, repo: any) => acc + repo.stargazers_count,
          0,
        ),
        total_lifetime_contributions: totalLifetime,
        current_month_contributions: currentMonthTotal,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        performance_delta_percent:
          lastMonthTotal > 0
            ? Math.round(
                ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100,
              )
            : 0,
      },
      commit_comparison_data: currentMonthData
        .map((d, i) => ({
          dayIndex: i + 1,
          currentMonthDate: d.dateLabel,
          lastMonthDate: lastMonthData[i].dateLabel,
          currentCommits: d.count,
          lastCommits: lastMonthData[i].count,
        }))
        .reverse(),
      recent_activities: recentActivities,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}