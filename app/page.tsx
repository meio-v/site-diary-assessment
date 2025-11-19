import { supabase } from '@/lib/supabase'
import { DiaryCard } from '@/components/diary/diary-card'
import type { SiteDiary } from '@/types/diary'

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

export default async function Home() {
  const [diariesResult, visitorsResult, equipmentResult, incidentsResult] = await Promise.all([
    supabase
      .from('site_diaries')
      .select('*')
      .order('date', { ascending: false }),
    supabase
      .from('visitors')
      .select('site_diary_id'),
    supabase
      .from('resource_utilization')
      .select('site_diary_id'),
    supabase
      .from('incidents')
      .select('site_diary_id')
  ])

  if (diariesResult.error) {
    console.error('Error fetching diaries:', diariesResult.error)
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading diary entries. Please try again later.</p>
      </div>
    )
  }

  const diaries: SiteDiary[] = diariesResult.data || []

  if (diaries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No diary entries yet.</p>
        <p className="text-sm text-muted-foreground">
          Create your first entry to get started.
        </p>
      </div>
    )
  }

  const visitorCounts = new Map<number, number>()
  ;(visitorsResult.data as VisitorCount[] | null)?.forEach(visitor => {
    const count = visitorCounts.get(visitor.site_diary_id) || 0
    visitorCounts.set(visitor.site_diary_id, count + 1)
  })

  const equipmentCounts = new Map<number, number>()
  ;(equipmentResult.data as EquipmentCount[] | null)?.forEach(equipment => {
    const count = equipmentCounts.get(equipment.site_diary_id) || 0
    equipmentCounts.set(equipment.site_diary_id, count + 1)
  })

  const incidentCounts = new Map<number, number>()
  ;(incidentsResult.data as IncidentCount[] | null)?.forEach(incident => {
    const count = incidentCounts.get(incident.site_diary_id) || 0
    incidentCounts.set(incident.site_diary_id, count + 1)
  })

  const diariesWithCounts: SiteDiaryWithCounts[] = diaries.map(diary => ({
    ...diary,
    visitorCount: visitorCounts.get(diary.id) || 0,
    equipmentCount: equipmentCounts.get(diary.id) || 0,
    incidentCount: incidentCounts.get(diary.id) || 0
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="text-3xl md:text-4xl font-logo font-bold text-foreground tracking-tight">Daily Site Diaries</h2>
        <p className="text-base text-muted-foreground/90 max-w-2xl">
          Stay on top of visitors, equipment, and incidents across {diaries.length} tracked day{diaries.length === 1 ? '' : 's'}.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {diariesWithCounts.map(diary => (
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