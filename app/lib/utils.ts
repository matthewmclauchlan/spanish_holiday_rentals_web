// /app/lib/utils.ts

import { Amenity } from "./types";

export interface AmenitySection {
  title: string;
  data: Amenity[];
}

/**
 * Groups amenities by the first letter of their name (capitalized).
 */
export function groupAmenitiesByFirstLetter(amenities: Amenity[]): AmenitySection[] {
  const groups: { [key: string]: Amenity[] } = {};
  amenities.forEach((amenity) => {
    // Guard against empty names
    if (!amenity.name) return;
    const firstLetter = amenity.name[0].toUpperCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }
    groups[firstLetter].push(amenity);
  });

  // Convert to an array of sections sorted by the letter.
  const sections: AmenitySection[] = Object.keys(groups)
    .sort()
    .map((letter) => ({
      title: letter,
      data: groups[letter].sort((a, b) => a.name.localeCompare(b.name)),
    }));
  return sections;
}

/**
 * Returns an array of date strings (in YYYY-MM-DD format) between the start and end dates (inclusive).
 * Throws an error if the start date is after the end date.
 */
export function getDatesInRange(startDate: string, endDate: string): string[] {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    throw new Error("Start date must be before end date.");
  }

  const dates: string[] = [];
  const current = new Date(start);
  while (current <= end) {
    const year = current.getFullYear();
    const month = ("0" + (current.getMonth() + 1)).slice(-2);
    const day = ("0" + current.getDate()).slice(-2);
    dates.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Normalizes a string by trimming whitespace and converting to lower case.
 */
export function normalizeString(str: string): string {
  return str.trim().toLowerCase();
}

/**
 * Normalizes an amenity string.
 * (This is a specialized alias to `normalizeString` for clarity.)
 */
export function normalizeAmenity(amenity: string): string {
  return normalizeString(amenity);
}
