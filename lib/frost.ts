// Representative minimum footing depths (inches below grade) by US state, used to
// set deck pier depth below the frost line per IRC R403.1.4 / R507.3. Frost depth
// varies within a state (elevation, microclimate) so these are typical permit
// values; every state page tells the reader to confirm with their local building
// department. Anchored to published references (Decks.com frost map, state amendments).
// Frost-free southern states still require ≥12" to reach stable bearing soil (IBC).

export interface StateInfo {
  slug: string;
  name: string;
  abbr: string;
  frost: number; // typical minimum footing depth, inches
}

export const US_STATES: StateInfo[] = [
  { slug: "alabama", name: "Alabama", abbr: "AL", frost: 12 },
  { slug: "alaska", name: "Alaska", abbr: "AK", frost: 100 },
  { slug: "arizona", name: "Arizona", abbr: "AZ", frost: 18 },
  { slug: "arkansas", name: "Arkansas", abbr: "AR", frost: 14 },
  { slug: "california", name: "California", abbr: "CA", frost: 18 },
  { slug: "colorado", name: "Colorado", abbr: "CO", frost: 36 },
  { slug: "connecticut", name: "Connecticut", abbr: "CT", frost: 42 },
  { slug: "delaware", name: "Delaware", abbr: "DE", frost: 30 },
  { slug: "florida", name: "Florida", abbr: "FL", frost: 12 },
  { slug: "georgia", name: "Georgia", abbr: "GA", frost: 12 },
  { slug: "hawaii", name: "Hawaii", abbr: "HI", frost: 12 },
  { slug: "idaho", name: "Idaho", abbr: "ID", frost: 24 },
  { slug: "illinois", name: "Illinois", abbr: "IL", frost: 42 },
  { slug: "indiana", name: "Indiana", abbr: "IN", frost: 36 },
  { slug: "iowa", name: "Iowa", abbr: "IA", frost: 48 },
  { slug: "kansas", name: "Kansas", abbr: "KS", frost: 30 },
  { slug: "kentucky", name: "Kentucky", abbr: "KY", frost: 24 },
  { slug: "louisiana", name: "Louisiana", abbr: "LA", frost: 12 },
  { slug: "maine", name: "Maine", abbr: "ME", frost: 60 },
  { slug: "maryland", name: "Maryland", abbr: "MD", frost: 30 },
  { slug: "massachusetts", name: "Massachusetts", abbr: "MA", frost: 48 },
  { slug: "michigan", name: "Michigan", abbr: "MI", frost: 42 },
  { slug: "minnesota", name: "Minnesota", abbr: "MN", frost: 60 },
  { slug: "mississippi", name: "Mississippi", abbr: "MS", frost: 12 },
  { slug: "missouri", name: "Missouri", abbr: "MO", frost: 30 },
  { slug: "montana", name: "Montana", abbr: "MT", frost: 48 },
  { slug: "nebraska", name: "Nebraska", abbr: "NE", frost: 42 },
  { slug: "nevada", name: "Nevada", abbr: "NV", frost: 24 },
  { slug: "new-hampshire", name: "New Hampshire", abbr: "NH", frost: 60 },
  { slug: "new-jersey", name: "New Jersey", abbr: "NJ", frost: 36 },
  { slug: "new-mexico", name: "New Mexico", abbr: "NM", frost: 18 },
  { slug: "new-york", name: "New York", abbr: "NY", frost: 48 },
  { slug: "north-carolina", name: "North Carolina", abbr: "NC", frost: 15 },
  { slug: "north-dakota", name: "North Dakota", abbr: "ND", frost: 60 },
  { slug: "ohio", name: "Ohio", abbr: "OH", frost: 32 },
  { slug: "oklahoma", name: "Oklahoma", abbr: "OK", frost: 18 },
  { slug: "oregon", name: "Oregon", abbr: "OR", frost: 18 },
  { slug: "pennsylvania", name: "Pennsylvania", abbr: "PA", frost: 36 },
  { slug: "rhode-island", name: "Rhode Island", abbr: "RI", frost: 40 },
  { slug: "south-carolina", name: "South Carolina", abbr: "SC", frost: 12 },
  { slug: "south-dakota", name: "South Dakota", abbr: "SD", frost: 48 },
  { slug: "tennessee", name: "Tennessee", abbr: "TN", frost: 15 },
  { slug: "texas", name: "Texas", abbr: "TX", frost: 12 },
  { slug: "utah", name: "Utah", abbr: "UT", frost: 30 },
  { slug: "vermont", name: "Vermont", abbr: "VT", frost: 60 },
  { slug: "virginia", name: "Virginia", abbr: "VA", frost: 18 },
  { slug: "washington", name: "Washington", abbr: "WA", frost: 18 },
  { slug: "west-virginia", name: "West Virginia", abbr: "WV", frost: 30 },
  { slug: "wisconsin", name: "Wisconsin", abbr: "WI", frost: 48 },
  { slug: "wyoming", name: "Wyoming", abbr: "WY", frost: 48 },
];

export function getState(slug: string): StateInfo | undefined {
  return US_STATES.find((s) => s.slug === slug);
}

export function frostDepth(slug: string): number {
  return getState(slug)?.frost ?? 36;
}
