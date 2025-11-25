import { supabase } from '@/lib/supabase'
import { DiaryCard } from '@/components/diary/diary-card'
import type { SiteDiary } from '@/types/diary'
import { buildDiaryCardProps as buildDiaryCardProps, fetchDiaryData } from './data/fetchDiaryData'

interface VisitorCount {
  site_diary_id: number
}

interface EquipmentCount {
  site_diary_id: number
}

interface IncidentCount {
  site_diary_id: number
}

interface SiteDiaryWithCounts extends SiteDiary {
  visitorCount: number
  equipmentCount: number
  incidentCount: number
}

// Revalidate the page every 10 seconds to show new entries quickly
export const revalidate = 10

function DiaryLoadingError() {
  return (
    <div className="text-center py-12">
      <p className="text-destructive">Error loading diary entries. Please try again later.</p>
    </div>
  )
}

function NoDiaryEntries() {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">No diary entries yet.</p>
      <p className="text-sm text-muted-foreground">
        Create your first entry to get started.
      </p>
    </div>
  )
}

export default async function Home() {
  const { 
    diaries: diariesResult, 
    visitors: visitorsResult, 
    resourceUtilization: equipmentResult, 
    incidents: incidentsResult 
  } = await fetchDiaryData()

  if (diariesResult.error) {
    console.error('Error fetching diaries:', diariesResult.error)
    return <DiaryLoadingError />
  }

  const diaries: SiteDiary[] = diariesResult.data || []

  if (diaries.length === 0) {
    return (
      <NoDiaryEntries />
    )
  }

  const diaryCardProps = buildDiaryCardProps({
    diaries: diariesResult,
    visitors: visitorsResult,
    resourceUtilization: equipmentResult,
    incidents: incidentsResult
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="text-3xl md:text-4xl font-logo font-bold text-foreground tracking-tight">Daily Site Diaries</h2>
        <p className="text-base text-muted-foreground/90 max-w-2xl">
          Stay on top of visitors, equipment, and incidents across {diaries.length} tracked day{diaries.length === 1 ? '' : 's'}.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {diaryCardProps.map(diary => (
          <DiaryCard 
            key={diary.id} 
            diary={diary} 
            visitorCount={diary.visitorCount}
            incidentCount={diary.incidentCount}
          />
        ))}
      </div>
    </div>
  )
}