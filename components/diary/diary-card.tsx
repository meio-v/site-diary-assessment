import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WeatherDisplay } from '@/components/shared/weather-display'
import { Users, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import type { SiteDiary } from '@/types/diary'

interface DiaryCardProps {
  diary: SiteDiary
  visitorCount?: number
  incidentCount?: number
}

export function DiaryCard({ diary, visitorCount = 0, incidentCount = 0 }: DiaryCardProps) {
  const formattedDate = format(new Date(diary.date), 'MMM d, yyyy')
  const preview = diary.description.length > 150 
    ? diary.description.substring(0, 150) + '...' 
    : diary.description

  return (
    <Link href={`/diary/${diary.id}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
      <Card className="hover:shadow-md transition-shadow cursor-pointer min-h-[200px] motion-reduce:transition-none">
        <CardHeader>
          <CardTitle>{formattedDate}</CardTitle>
          <div className="flex items-center gap-3 mt-2">
            {visitorCount > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{visitorCount}</span>
              </div>
            )}
            {incidentCount > 0 && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span>{incidentCount}</span>
              </div>
            )}
            <WeatherDisplay 
              weather={diary.weather} 
              temperature={diary.temperature}
              className="text-sm text-muted-foreground"
            />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {preview}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}