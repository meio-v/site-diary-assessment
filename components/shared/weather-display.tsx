import { weatherOptions, type WeatherCondition } from '@/lib/weather'

interface WeatherDisplayProps {
  weather: WeatherCondition
  temperature?: number | null
  className?: string
}

export function WeatherDisplay({ weather, temperature, className }: WeatherDisplayProps) {
  const { label, icon: Icon } = weatherOptions[weather] || weatherOptions.sunny

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Icon className="h-5 w-5" />
      <span>{label}</span>
      {temperature !== null && temperature !== undefined && (
        <span className="text-muted-foreground">({temperature}°C)</span>
      )}
    </div>
  )
}