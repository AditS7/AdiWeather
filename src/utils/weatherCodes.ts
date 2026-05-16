import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  Moon,
  type LucideIcon,
} from 'lucide-react';

export interface WeatherCondition {
  description: string;
  icon: LucideIcon;
  nightIcon?: LucideIcon;
}

export const getWeatherCondition = (code: number, isDay = 1): WeatherCondition => {
  switch (code) {
    case 0:
      return { description: 'Clear sky', icon: Sun, nightIcon: Moon };
    case 1:
      return { description: 'Mainly clear', icon: Sun, nightIcon: Moon };
    case 2:
      return { description: 'Partly cloudy', icon: Cloud, nightIcon: Cloud };
    case 3:
      return { description: 'Overcast', icon: Cloud };
    case 45:
    case 48:
      return { description: 'Fog', icon: CloudFog };
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return { description: 'Drizzle', icon: CloudDrizzle };
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
      return { description: 'Rain', icon: CloudRain };
    case 71:
    case 73:
    case 75:
    case 77:
      return { description: 'Snow', icon: CloudSnow };
    case 80:
    case 81:
    case 82:
      return { description: 'Rain showers', icon: CloudRain };
    case 85:
    case 86:
      return { description: 'Snow showers', icon: CloudSnow };
    case 95:
    case 96:
    case 99:
      return { description: 'Thunderstorm', icon: CloudLightning };
    default:
      return { description: 'Unknown', icon: Cloud };
  }
};
