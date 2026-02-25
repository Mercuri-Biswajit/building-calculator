// ═══════════════════════════════════════════════════════════════════════════
// ADVANCED CALCULATOR CONSTANTS
// Construction thumb rules, building types, and material rates
// ═══════════════════════════════════════════════════════════════════════════

export const THUMB_RULES = {
  cement_bags_per_sqft: 0.4,
  steel_kg_per_sqft: 4.0,
  sand_cft_per_sqft: 1.5,
  aggregate_cft_per_sqft: 3.0,
  bricks_per_sqft: 8,
  paint_ltr_per_sqft: 0.1,
  tiles_sqft_per_sqft: 1.15,
  labour_days_per_sqft: 0.5,
};

export const BUILDING_TYPES = {
  residential: { label: "Residential (RCC)", costFactor: 1.0 },
  commercial: { label: "Commercial", costFactor: 1.25 },
  industrial: { label: "Industrial / Factory", costFactor: 0.85 },
  villa: { label: "Luxury Villa", costFactor: 1.6 },
  apartment: { label: "Multi-storey Apartment", costFactor: 1.15 },
};

export const FINISH_GRADES = {
  economy: { label: "Economy", factor: 0.80 },
  standard: { label: "Standard", factor: 1.00 },
  premium: { label: "Premium", factor: 1.35 },
  luxury: { label: "Luxury", factor: 1.80 },
};

export const SOIL_CONDITIONS = {
  hard_rock: { label: "Hard Rock", factor: 0.90 },
  soft_rock: { label: "Soft Rock", factor: 0.95 },
  normal: { label: "Normal Soil", factor: 1.00 },
  black_cotton: { label: "Black Cotton Soil", factor: 1.12 },
  loose_fill: { label: "Loose / Fill Soil", factor: 1.20 },
};

export const REGIONS = {
  tier1: { label: "Tier 1 City (Mumbai, Delhi, Bangalore)", baseCost: 2200 },
  tier2: { label: "Tier 2 City (Pune, Hyderabad, Chennai)", baseCost: 1800 },
  tier3: { label: "Tier 3 City / Town", baseCost: 1600 },
  rural: { label: "Rural / Village", baseCost: 1200 },
};

export const MATERIAL_RATES = {
  cement: { rate: 380 },
  steel: { rate: 72 },
  sand: { rate: 55 },
  aggregate: { rate: 45 },
  bricks: { rate: 9 },
  paint: { rate: 220 },
  tiles: { rate: 65 },
  labour: { rate: 600 },
};