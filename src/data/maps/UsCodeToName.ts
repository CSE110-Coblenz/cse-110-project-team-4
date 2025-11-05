// src/data/maps/UsCodeToName.ts
// -----------------------------------------------------------------------------
// Data-only module: mapping from US state codes (e.g., "CA") to full names
// (e.g., "California"), plus a Tiny States set for NE states.
// -----------------------------------------------------------------------------

// A const object with literal types preserved keys/values
export const FULL_NAME_BY_CODE = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
} as const;

// Derive a union type like "CA" | "NY" | 
export type StateCode = keyof typeof FULL_NAME_BY_CODE;

/** Return the full state name given a code. Falls back to the input if unknown. */
export function codeToFullName(code: string): string {
  return FULL_NAME_BY_CODE[code as StateCode] ?? code;
}

/** Tiny NE states that are hard to label/hover on the map; useful for external labels. */
export const TINY_STATES: ReadonlySet<StateCode> = new Set([
  "CT","RI","DE","DC","MD","MA","NH","VT","NJ",
]) as ReadonlySet<StateCode>;

/** Convenience export: all codes as an array (e.g., for iteration/tests). */
export const ALL_STATE_CODES: StateCode[] = Object.keys(FULL_NAME_BY_CODE) as StateCode[];
