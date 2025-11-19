import { weatherOptions, type WeatherCondition } from '@/lib/weather'

interface WeatherDisplayProps {
  weather: WeatherCondition
  temperature?: number | null
  className?: string
}

export function WeatherDisplay({ weather, temperature, className }: WeatherDisplayProps) {
  const { label, icon: Icon } = weatherOptions[weather] || weatherOptions.sunny

  // Weather-specific badge colors (saturated backgrounds with white text)
  const badgeColors: Record<WeatherCondition, string> = {
    sunny: 'bg-yellow-500 text-white',
    'partly-cloudy': 'bg-blue-400 text-white',
    cloudy: 'bg-gray-500 text-white',
    rainy: 'bg-blue-600 text-white',
    stormy: 'bg-purple-600 text-white',
    windy: 'bg-gray-400 text-white',
    foggy: 'bg-gray-400 text-white',
    snowy: 'bg-sky-300 text-white',
  }

  const badgeClass = badgeColors[weather] || badgeColors.sunny

  return (
    <div className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs font-medium ${badgeClass} ${className}`}>
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {temperature !== null && temperature !== undefined && (
        <span className="text-xs opacity-90">{temperature}°C</span>
      )}
    </div>
  )
}