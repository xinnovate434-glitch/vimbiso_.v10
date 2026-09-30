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

function parseWeather(data: Record<string, unknown>, fallbackCity: string): WeatherNow {
  const weather = (data.weather as { main?: string; description?: string; icon?: string }[] | undefined)?.[0];
  const main = data.main as { temp?: number; feels_like?: number; humidity?: number } | undefined;
  const wind = data.wind as { speed?: number } | undefined;
  return {
    name: weather?.main ?? "Unknown",
    temp: Math.round(main?.temp ?? 0),
    feelsLike: Math.round(main?.feels_like ?? 0),
    humidity: main?.humidity ?? 0,
    description: weather?.description ?? "",
    icon: weather?.icon ?? "01d",
    windSpeed: wind?.speed ?? 0,
    city: (data.name as string) || fallbackCity,
  };
}

export async function fetchWeatherByCoords(lat: number, lon: number): Promise<WeatherNow | null> {
  const key = config.weather.apiKey;
  if (!key) return null;
  try {
    const url =
      "https://api.openweathermap.org/data/2.5/weather" +
      "?lat=" + lat + "&lon=" + lon + "&units=metric&appid=" + key;
    const res = await fetch(url);
    if (!res.ok) return null;
    return parseWeather((await res.json()) as Record<string, unknown>, "Your location");
  } catch {
    return null;
  }
}

export async function fetchWeather(city = config.weather.defaultCity): Promise<WeatherNow | null> {
  const key = config.weather.apiKey;
  if (!key) return null;
  try {
    const url =
      "https://api.openweathermap.org/data/2.5/weather" +
      "?q=" + encodeURIComponent(city) + ",ZW&units=metric&appid=" + key;
    const res = await fetch(url);
    if (!res.ok) return null;
    return parseWeather((await res.json()) as Record<string, unknown>, city);
  } catch {
    return null;
  }
}

export function weatherAdvice(w: WeatherNow | null, role: "buyer" | "trader" | "delivery"): string {
  if (!w) return "";
  const rainy = /rain|drizzle|thunder/i.test(w.description + w.name);
  const hot = w.temp >= 30;
  if (role === "buyer") {
    if (rainy) return "Rain expected — prefer delivery over collection.";
    if (hot) return "Hot day — fresh produce moves fast. Bid early.";
    return w.temp + "°C near " + w.city + " — good day to stock up.";
  }
  if (role === "trader") {
    if (rainy) return "Rain may delay walk-ins — push delivery offers.";
    if (hot) return "Heat increases demand for cold drinks & fresh veg.";
    return "Market weather: " + w.name + ", " + w.temp + "°C.";
  }
  if (rainy) return "Wet roads — allow extra time and confirm safe points.";
  return w.temp + "°C · " + w.description + ". Drive safe.";
}
