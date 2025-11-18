import { 
    Sun, 
    Cloud, 
    CloudRain, 
    CloudLightning, 
    Wind, 
    CloudSnow,
    Eye
  } from 'lucide-react'
  
  export type WeatherCondition = 
    | 'sunny'
    | 'partly-cloudy'
    | 'cloudy'
    | 'rainy'
    | 'stormy'
    | 'windy'
    | 'foggy'
    | 'snowy'
  
  export const weatherOptions: Record<WeatherCondition, { label: string; icon: typeof Sun }> = {
    sunny: {
      label: 'Sunny',
      icon: Sun,
    },
    'partly-cloudy': {
      label: 'Partly Cloudy',
      icon: Cloud,
    },
    cloudy: {
      label: 'Cloudy',
      icon: Cloud,
    },
    rainy: {
      label: 'Rainy',
      icon: CloudRain,
    },
    stormy: {
      label: 'Stormy',
      icon: CloudLightning,
    },
    windy: {
      label: 'Windy',
      icon: Wind,
    },
    foggy: {
      label: 'Foggy',
      icon: Eye,
    },
    snowy: {
      label: 'Snowy',
      icon: CloudSnow,
    },
  }
  
  export const weatherConditions = Object.keys(weatherOptions) as WeatherCondition[]