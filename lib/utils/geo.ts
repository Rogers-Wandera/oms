/**
 * Resolves latitude and longitude to a human-readable address.
 * Since this is a demo/office system, we'll use a simple formatter or a mock
 * reverse geocoding approach. In production, this would call Google Maps or similar.
 */
export async function resolveLocation(
  lat: string | null,
  long: string | null,
): Promise<string> {
  if (!lat || !long) return "Unknown Location";

  try {
    // For now, return a formatted string.
    // You could fetch from an API here:
    // const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}`);
    // const data = await res.json();
    // return data.display_name;

    return `${parseFloat(lat).toFixed(4)}, ${parseFloat(long).toFixed(4)}`;
  } catch (e) {
    return "Invalid Coordinates";
  }
}

export function formatLocation(
  lat: string | null,
  long: string | null,
): string {
  if (!lat || !long) return "Location Not Shared";
  return `${parseFloat(lat).toFixed(3)}°, ${parseFloat(long).toFixed(3)}°`;
}
