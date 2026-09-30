/** Shared safe meet points — Zimbabwe informal trade friendly */

export type MeetPoint = {
  id: string;
  name: string;
  area: string;
  city: string;
  note: string;
};

export const MEET_POINTS: MeetPoint[] = [
  { id: "shell-avondale", name: "Shell Avondale", area: "Avondale", city: "Harare", note: "Lit forecourt · public" },
  { id: "ok-chitungwiza", name: "OK Chitungwiza", area: "Town centre", city: "Chitungwiza", note: "Busy · daytime best" },
  { id: "eastgate", name: "Eastgate car park", area: "Enterprise", city: "Harare", note: "Security present" },
  { id: "roadport", name: "Harare Roadport", area: "CBD", city: "Harare", note: "Buses · public" },
  { id: "gweru-ok", name: "OK Gweru", area: "Main street", city: "Gweru", note: "Daytime" },
  { id: "byo-econet", name: "Econet shop centre", area: "City centre", city: "Bulawayo", note: "Public" },
];

export function meetPointsForCity(city?: string): MeetPoint[] {
  if (!city) return MEET_POINTS;
  const c = city.toLowerCase();
  const local = MEET_POINTS.filter((m) => m.city.toLowerCase() === c);
  return local.length ? local : MEET_POINTS;
}
