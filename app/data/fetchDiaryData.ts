import { supabase } from '@/lib/supabase'
import { Incident, ResourceUtilization, SiteDiary, Visitor } from '@/types/diary'

interface DiaryCardProps extends SiteDiary {
    visitorCount: number
    incidentCount: number
}

interface DiariesResult {
    data: SiteDiary[]
    error?: Error | null
}

interface VisitorsResult {
    data: Visitor[]
    error?: Error | null
}

interface ResourceUtilizationResult {
    data: ResourceUtilization[]
    error?: Error | null
}

interface IncidentsResult {
    data: Incident[]
    error?: Error | null
}

interface FetchDiaryDataResult {
    diaries: DiariesResult
    visitors: VisitorsResult
    resourceUtilization: ResourceUtilizationResult
    incidents: IncidentsResult
}

export type WithCountsResult<T extends object> = T & { count: number }
interface FetchDiaryDataWithCounts {
    diaries: WithCountsResult<DiariesResult>
    visitors: WithCountsResult<VisitorsResult>
    incidents: WithCountsResult<IncidentsResult>
    resourceUtilization: ResourceUtilizationResult
}

export async function fetchDiaryData(): Promise<FetchDiaryDataResult> {
    const [diariesResult, visitorsResult, resourceUtilizationResult, incidentsResult] = await Promise.all([
        supabase.from('site_diaries').select('*').order('date', { ascending: false }),
        supabase.from('visitors').select('*').order('created_at', { ascending: false }),
        supabase.from('resource_utilization').select('*').order('created_at', { ascending: false }),
        supabase.from('incidents').select('*').order('created_at', { ascending: false }),
    ])

    return {
        diaries: {
            data: diariesResult.data || [],
            error: diariesResult.error || null,
        },
        visitors: {
            data: visitorsResult.data || [],
            error: visitorsResult.error || null,
        },
        resourceUtilization: {
            data: resourceUtilizationResult.data || [],
            error: resourceUtilizationResult.error || null,
        },
        incidents: {
            data: incidentsResult.data || [],
            error: incidentsResult.error || null,
        },
    }
}

export function buildDiaryCardProps(result: FetchDiaryDataResult): DiaryCardProps[] {
    const visitorsByDiaryId = result.visitors.data.reduce((acc, visitor) => {
        if (!acc.has(visitor.site_diary_id)) {
            acc.set(visitor.site_diary_id, [])
        }
        acc.get(visitor.site_diary_id)?.push(visitor)
        return acc
    }, new Map<number, Visitor[]>())
    
    const incidentsByDiaryId = result.incidents.data.reduce((acc, incident) => {
        if (!acc.has(incident.site_diary_id)) {
            acc.set(incident.site_diary_id, [])
        }
        acc.get(incident.site_diary_id)?.push(incident)
        return acc
    }, new Map<number, Incident[]>())
    return result.diaries.data.map(diary => ({
        ...diary,
        visitorCount: visitorsByDiaryId.get(diary.id)?.length || 0,
        incidentCount: incidentsByDiaryId.get(diary.id)?.length || 0,
    })) as DiaryCardProps[]
}