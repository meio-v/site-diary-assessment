import type { Incident, ResourceUtilization, SiteDiary, Visitor } from '@/types/diary'

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

export interface FetchDiaryDataResult {
    diaries: DiariesResult
    visitors: VisitorsResult
    resourceUtilization: ResourceUtilizationResult
    incidents: IncidentsResult
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

