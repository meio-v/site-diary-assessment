import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WeatherDisplay } from '@/components/shared/weather-display'
import { Separator } from '@/components/ui/separator'
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
    <Link href={`/diary/${diary.id}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl h-full w-full flex">
      <Card className="transition-all duration-200 cursor-pointer h-full w-full flex flex-col hover:-translate-y-1 hover:shadow-md motion-reduce:transition-none">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-2xl text-primary font-logo font-semibold tracking-tight">
              {formattedDate}
            </CardTitle>
            <WeatherDisplay 
              weather={diary.weather} 
              temperature={diary.temperature}
            />
          </div>
          <Separator className="bg-border/80" />
          <div className="flex items-center gap-4">
            {visitorCount > 0 && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-blue-600">
                <Users className="h-4 w-4" />
                <span>{visitorCount}</span>
              </div>
            )}
            {incidentCount > 0 && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                <AlertTriangle className="h-4 w-4" />
                <span>{incidentCount}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <p className="text-[0.95rem] text-muted-foreground/90 line-clamp-3 leading-relaxed flex-1">
            {preview}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}