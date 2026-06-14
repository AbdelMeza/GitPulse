interface ContributionDay {
  date: string
  contributionCount: number
}

export const calculateStreaks = (allDays: ContributionDay[]) => {
  let longestStreak = 0
  let currentStreak = 0
  let tempStreak = 0
  let countStreak = 0

  allDays.forEach((day) => {
    if (day.contributionCount > 0) {
      tempStreak++
      countStreak = tempStreak
    } else {
      if (tempStreak > longestStreak) longestStreak = tempStreak
      tempStreak = 0
    }
  })
  if (tempStreak > longestStreak) longestStreak = tempStreak
  currentStreak = countStreak

  return { longestStreak, currentStreak }
}

export const getContributionTotalForPeriod = (
  allDays: ContributionDay[],
  daysOffset: number,
) => {
  const start = new Date()
  start.setDate(new Date().getDate() - (daysOffset + 30))
  const end = new Date()
  end.setDate(new Date().getDate() - daysOffset)

  return allDays
    .filter((d) => new Date(d.date) >= start && new Date(d.date) <= end)
    .reduce((acc, curr) => acc + curr.contributionCount, 0)
}

export const generateComparisonData = (allDays: ContributionDay[]) => {
  return Array.from({ length: 30 })
    .map((_, i) => {
      const dCur = new Date()
      dCur.setDate(dCur.getDate() - i)
      const dLast = new Date()
      dLast.setDate(dLast.getDate() - (i + 30))

      return {
        dayIndex: i + 1,
        currentMonthDate: dCur.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
        }),
        lastMonthDate: dLast.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
        }),
        currentContributions:
          allDays.find((d) => d.date === dCur.toISOString().split("T")[0])
            ?.contributionCount || 0,
        lastContributions:
          allDays.find((d) => d.date === dLast.toISOString().split("T")[0])
            ?.contributionCount || 0,
      }
    })
    .reverse()
}
