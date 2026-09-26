import { config } from "./config";

export type WeatherNow = {
  name: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  city: string;
};

/**
 * Live weather for a city (OpenWeatherMap).
 * Falls back gracefully if key missing or request fails.
 */
export async function fetchWeather(
  city = config.weather.defaultCity,
): Promise<WeatherNow | null> {
  const key = config.weather.apiKey;
  if (!key) return null;

  try {
    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?q=${encodeURIComponent(city)},ZW&units=metric&appid=${key}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      name: data.weather?.[0]?.main ?? "Unknown",
      temp: Math.round(data.main?.temp ?? 0),
      feelsLike: Math.round(data.main?.feels_like ?? 0),
      humidity: data.main?.humidity ?? 0,
      description: data.weather?.[0]?.description ?? "",
      icon: data.weather?.[0]?.icon ?? "01d",
      windSpeed: data.wind?.speed ?? 0,
      city: data.name ?? city,
    };
  } catch {
    return null;
  }
}

/** Simple guidance for buyers/sellers from weather conditions */
export function weatherAdvice(w: WeatherNow | null, role: "buyer" | "trader" | "delivery"): string {
  if (!w) return "";
  const rainy = /rain|drizzle|thunder/i.test(w.description + w.name);
  const hot = w.temp >= 30;
  if (role === "buyer") {
    if (rainy) return "Rain expected — prefer delivery over collection.";
    if (hot) return "Hot day — fresh produce moves fast. Bid early.";
    return `${w.temp}°C in ${w.city} — good day to stock up.`;
  }
  if (role === "trader") {
    if (rainy) return "Rain may delay walk-ins — push delivery offers.";
    if (hot) return "Heat increases demand for cold drinks & fresh veg.";
    return `Market weather: ${w.name}, ${w.temp}°C.`;
  }
  // delivery
  if (rainy) return "Wet roads — allow extra time and confirm safe points.";
  return `${w.temp}°C · ${w.description}. Drive safe.`;
}
