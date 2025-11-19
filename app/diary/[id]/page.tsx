import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { WeatherDisplay } from '@/components/shared/weather-display'
import { VisitorsList } from '@/components/lists/visitors-list'
import { EquipmentList } from '@/components/lists/equipment-list'
import { IncidentsList } from '@/components/lists/incidents-list'
import { Users, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import type { Visitor, ResourceUtilizationWithResource, Incident } from '@/types/diary'

interface PageProps {
  params: Promise<{ id: string }>
}

export const revalidate = 30
export default async function DiaryPage({ params }: PageProps) {
  const { id } = await params
  const diaryId = parseInt(id)

  if (isNaN(diaryId)) {
    notFound()
  }

  // Fetch all data in parallel
  const [diaryResult, visitorsResult, equipmentResult, incidentsResult] = await Promise.all([
    supabase
      .from('site_diaries')
      .select('*')
      .eq('id', diaryId)
      .single(),
    supabase
      .from('visitors')
      .select('*')
      .eq('site_diary_id', diaryId)
      .order('created_at', { ascending: false }),
    supabase
      .from('resource_utilization')
      .select(`
        *,
        resource:resources(*)
      `)
      .eq('site_diary_id', diaryId)
      .order('created_at', { ascending: false }),
    supabase
      .from('incidents')
      .select('*')
      .eq('site_diary_id', diaryId)
      .order('created_at', { ascending: false })
  ])

  if (diaryResult.error || !diaryResult.data) {
    notFound()
  }

  const diary = diaryResult.data
  const visitors = visitorsResult.data || []
  const equipment = equipmentResult.data || []
  const incidents = incidentsResult.data || []
  const visitorCount = visitors.length
  const incidentCount = incidents.length

  const formattedDate = format(new Date(diary.date), 'PPP')

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md">
          <Button variant="outline">← Back to List</Button>
        </Link>
        <Link href={`/diary/${diary.id}/edit`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md">
          <Button variant="outline">Edit</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{formattedDate}</CardTitle>
          <div className="mt-2 flex items-center gap-4">
            <WeatherDisplay 
              weather={diary.weather} 
              temperature={diary.temperature}
              className="text-muted-foreground"
            />
            {visitorCount > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-5 w-5" />
                <span>{visitorCount} visitor{visitorCount !== 1 ? 's' : ''}</span>
              </div>
            )}
            {incidentCount > 0 && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <span>{incidentCount} incident{incidentCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="my-4" />
          
          <VisitorsList
            diaryId={diaryId}
            initialVisitors={visitors as Visitor[]}
          />

          <Separator className="my-4" />

          <EquipmentList
            diaryId={diaryId}
            initialEquipment={equipment as ResourceUtilizationWithResource[]}
          />

          <Separator className="my-4" />

          <IncidentsList
            diaryId={diaryId}
            initialIncidents={incidents as Incident[]}
          />

          <Separator className="my-4" />
          
          <div>
            <h3 className="font-semibold mb-3">Summary of Work Done</h3>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {diary.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}