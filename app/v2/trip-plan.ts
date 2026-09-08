export const TRIP_PLAN_KEY = 'vacasky-v2-trip-plan';
const TRIP_PLAN_CHANGED = 'vacasky-v2-trip-plan-changed';

export type TripPlan = {
  destination: string;
  packageId: string;
  date: string;
  travelers: string;
  email: string;
  savedAt: string;
};

export function getTripPlanSnapshot(): string | null {
  try {
    return localStorage.getItem(TRIP_PLAN_KEY);
  } catch {
    return null;
  }
}

export function subscribeTripPlan(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === TRIP_PLAN_KEY || event.key === null) onChange();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(TRIP_PLAN_CHANGED, onChange);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(TRIP_PLAN_CHANGED, onChange);
  };
}

export function saveTripPlan(plan: TripPlan): boolean {
  try {
    localStorage.setItem(TRIP_PLAN_KEY, JSON.stringify(plan));
    window.dispatchEvent(new Event(TRIP_PLAN_CHANGED));
    return true;
  } catch {
    return false;
  }
}

export function parseTripPlan(raw: string | null): TripPlan | null {
  try {
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    if (
      !('destination' in value) ||
      typeof value.destination !== 'string' ||
      !value.destination.trim() ||
      !('date' in value) ||
      typeof value.date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value.date) ||
      !('travelers' in value) ||
      typeof value.travelers !== 'string' ||
      !Number.isInteger(Number(value.travelers)) ||
      Number(value.travelers) < 1 ||
      Number(value.travelers) > 20 ||
      !('email' in value) ||
      typeof value.email !== 'string' ||
      !('savedAt' in value) ||
      typeof value.savedAt !== 'string'
    ) {
      return null;
    }
    return {
      destination: value.destination,
      // Plans saved before package IDs were added still open normally.
      packageId:
        'packageId' in value && typeof value.packageId === 'string'
          ? value.packageId
          : '',
      date: value.date,
      travelers: value.travelers,
      email: value.email,
      savedAt: value.savedAt,
    };
  } catch {
    return null;
  }
}
