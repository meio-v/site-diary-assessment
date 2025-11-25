'use server'

import { supabase } from '@/lib/supabase'
import type { Incident, ResourceUtilization, SiteDiary, Visitor } from '@/types/diary'

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

/**
 * Unified function to fetch diary data for a specific diary entry or all diary entries
 * @param diaryId - The ID of the diary entry to fetch data for. If not provided, all diary entries will be fetched.
 * @returns An object containing the fetched data for diaries, visitors, resource utilization, and incidents.
 */
export async function fetchDiaryData(diaryId?: number): Promise<FetchDiaryDataResult> {
    let diariesQuery = supabase.from('site_diaries').select('*').order('date', { ascending: false });
    let visitorsQuery = supabase.from('visitors').select('*').order('created_at', { ascending: false });
    let resourceUtilizationQuery = supabase.from('resource_utilization').select('*').order('created_at', { ascending: false });
    let incidentsQuery = supabase.from('incidents').select('*').order('created_at', { ascending: false });

    if (diaryId) {
        diariesQuery = diariesQuery.eq('id', diaryId);
        visitorsQuery = visitorsQuery.eq('site_diary_id', diaryId);
        resourceUtilizationQuery = resourceUtilizationQuery.select('*, resource:resources(*)').eq('site_diary_id', diaryId);
        incidentsQuery = incidentsQuery.select('*').eq('site_diary_id', diaryId);
    }

    const [diariesResult, visitorsResult, resourceUtilizationResult, incidentsResult] = await Promise.all([
        diariesQuery,
        visitorsQuery,
        resourceUtilizationQuery,
        incidentsQuery,
    ]);

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

