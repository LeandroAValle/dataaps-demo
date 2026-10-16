import type { Team } from './demo-data'

export type ApiDashboard = {
  team: Team
  period: string
  source: string
  source_status: string
  rule_status: string
  last_loaded_at: string | null
  metrics: {
    people_followed: number
    units_and_teams: number
    data_inconsistencies: number
    care_opportunities: number
    follow_up_rate: number
    data_quality: number
    follow_up_change: number
    trend: number[]
  }
}

export type ApiOpportunity = {
  id: string
  title: string
  group: string
  count: number
  reason: string
}

const apiBaseUrl = (import.meta.env.VITE_DATAAPS_API_URL || '').replace(/\/$/, '')

type Snapshot = {
  teams: Record<Team, { summary: ApiDashboard; opportunities: ApiOpportunity[] }>
}

let snapshotPromise: Promise<Snapshot> | null = null

function getSnapshot(): Promise<Snapshot> {
  snapshotPromise ??= fetch(`${import.meta.env.BASE_URL}dashboard.json`).then(response => {
    if (!response.ok) throw new Error(`Snapshot respondeu ${response.status}`)
    return response.json() as Promise<Snapshot>
  })
  return snapshotPromise
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, { signal })
  if (!response.ok) throw new Error(`API respondeu ${response.status}`)
  return response.json() as Promise<T>
}

export function fetchDashboard(team: Team, signal?: AbortSignal) {
  if (!apiBaseUrl) return getSnapshot().then(data => data.teams[team].summary)
  return getJson<ApiDashboard>(`/api/v1/dashboard/summary?team=${encodeURIComponent(team)}`, signal)
}

export function fetchOpportunities(team: Team, signal?: AbortSignal) {
  if (!apiBaseUrl) return getSnapshot().then(data => data.teams[team].opportunities)
  return getJson<ApiOpportunity[]>(`/api/v1/opportunities?team=${encodeURIComponent(team)}`, signal)
}

export const dataSource = apiBaseUrl ? 'api' : 'snapshot'
