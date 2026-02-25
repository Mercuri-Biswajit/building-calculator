// ═══════════════════════════════════════════════════════════════════════════
// CALCULATOR UTILITIES - REFACTORED
// Breaking down validation and helper functions into reusable modules
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validation result object
 */
class ValidationResult {
  constructor(isValid, errors = []) {
    this.isValid = isValid;
    this.errors = errors;
  }

  get message() {
    return this.errors.join('\n');
  }

  addError(error) {
    this.errors.push(error);
    this.isValid = false;
  }
}

/**
 * Validate building dimensions
 */
export function validateBuildingDimensions(inputs) {
  const result = new ValidationResult(true);
  const { length, breadth, floors, floorHeight } = inputs;

  if (!length || parseFloat(length) <= 0) {
    result.addError('Length must be greater than 0');
  }
  
  if (!breadth || parseFloat(breadth) <= 0) {
    result.addError('Breadth must be greater than 0');
  }

  if (floors < 1 || floors > 10) {
    result.addError('Floors must be between 1 and 10');
  }

  if (floorHeight && (parseFloat(floorHeight) < 8 || parseFloat(floorHeight) > 15)) {
    result.addError('Floor height must be between 8ft and 15ft');
  }

  return result;
}

/**
 * Validate material rates
 */
export function validateMaterialRates(rates) {
  const result = new ValidationResult(true);

  Object.entries(rates).forEach(([material, rate]) => {
    if (rate !== null && rate !== '' && rate !== undefined) {
      const numRate = parseFloat(rate);
      if (isNaN(numRate) || numRate < 0) {
        result.addError(`Invalid rate for ${material}: must be a positive number`);
      }
    }
  });

  return result;
}

/**
 * Validate complete calculator inputs
 */
export function validateCalculatorInputs(inputs) {
  const dimensionValidation = validateBuildingDimensions(inputs);
  
  if (!dimensionValidation.isValid) {
    return dimensionValidation;
  }

  if (inputs.customRates) {
    const rateValidation = validateMaterialRates(inputs.customRates);
    if (!rateValidation.isValid) {
      return rateValidation;
    }
  }

  return new ValidationResult(true);
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIT CONVERSION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert square feet to square meters
 */
export function sqftToSqm(sqft) {
  return sqft * 0.092903;
}

/**
 * Convert feet to meters
 */
export function ftToM(ft) {
  return ft * 0.3048;
}

/**
 * Convert cubic feet to cubic meters
 */
export function cftToCum(cft) {
  return cft * 0.0283168;
}

/**
 * Convert square meters to square feet
 */
export function sqmToSqft(sqm) {
  return sqm / 0.092903;
}

/**
 * Convert meters to feet
 */
export function mToFt(m) {
  return m / 0.3048;
}

/**
 * Convert cubic meters to cubic feet
 */
export function cumToCft(cum) {
  return cum / 0.0283168;
}

/**
 * Round to specified decimal places
 */
export function roundTo(value, decimals = 2) {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

// ═══════════════════════════════════════════════════════════════════════════
// CALCULATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate area from dimensions
 */
export function calcArea(length, breadth) {
  return parseFloat(length) * parseFloat(breadth);
}

/**
 * Calculate total built-up area
 */
export function calcTotalArea(plotArea, floors, includeBasement = false) {
  const baseArea = plotArea * floors;
  return includeBasement ? baseArea + plotArea : baseArea;
}

/**
 * Calculate volume
 */
export function calcVolume(area, height) {
  return parseFloat(area) * parseFloat(height);
}

/**
 * Apply factor to value
 */
export function applyFactor(value, factor) {
  return value * factor;
}

/**
 * Calculate percentage
 */
export function calcPercentage(value, percent) {
  return (value * percent) / 100;
}

/**
 * Add percentage to value
 */
export function addPercentage(value, percent) {
  return value + calcPercentage(value, percent);
}

// ═══════════════════════════════════════════════════════════════════════════
// RATE SETUP HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Setup rates with defaults and custom overrides
 */
export function setupRates(customRates, defaultRates) {
  const rates = { ...defaultRates };
  
  if (customRates) {
    Object.entries(customRates).forEach(([key, value]) => {
      if (value !== null && value !== '' && value !== undefined) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
          rates[key] = numValue;
        }
      }
    });
  }
  
  return rates;
}

/**
 * Get rate with fallback
 */
export function getRate(customRate, defaultRate) {
  if (customRate !== null && customRate !== '' && customRate !== undefined) {
    const numRate = parseFloat(customRate);
    if (!isNaN(numRate) && numRate >= 0) {
      return numRate;
    }
  }
  return defaultRate;
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMATTING HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format currency in Indian Rupees
 */
export function formatINR(amount, options = {}) {
  const {
    showSymbol = true,
    decimals = 0,
    compact = false
  } = options;

  if (compact && amount >= 10000000) {
    // Crores
    return `${showSymbol ? '₹' : ''}${(amount / 10000000).toFixed(2)} Cr`;
  } else if (compact && amount >= 100000) {
    // Lakhs
    return `${showSymbol ? '₹' : ''}${(amount / 100000).toFixed(2)} L`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(amount);
}

/**
 * Format quantity with unit
 */
export function formatQuantity(quantity, unit, decimals = 2) {
  return `${roundTo(quantity, decimals)} ${unit}`;
}

/**
 * Format area
 */
export function formatArea(sqft, options = {}) {
  const { includeUnit = true, compact = false } = options;
  
  if (compact && sqft >= 43560) {
    // Acres
    const acres = sqft / 43560;
    return `${roundTo(acres, 2)}${includeUnit ? ' acres' : ''}`;
  }
  
  return `${sqft.toLocaleString('en-IN')}${includeUnit ? ' sq.ft' : ''}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// RANGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Clamp value between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if value is in range
 */
export function isInRange(value, min, max) {
  return value >= min && value <= max;
}

/**
 * Get value with bounds
 */
export function bounded(value, min, max, defaultValue) {
  const num = parseFloat(value);
  if (isNaN(num)) return defaultValue;
  return clamp(num, min, max);
}

// ═══════════════════════════════════════════════════════════════════════════
// ARRAY HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sum array of numbers
 */
export function sum(array) {
  return array.reduce((total, value) => total + value, 0);
}

/**
 * Average of array
 */
export function average(array) {
  return array.length > 0 ? sum(array) / array.length : 0;
}

/**
 * Sum object values
 */
export function sumObjectValues(obj) {
  return sum(Object.values(obj));
}

/**
 * Group by key
 */
export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
}

// ═══════════════════════════════════════════════════════════════════════════
// SAFE PARSING HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Safe float parse with default
 */
export function safeFloat(value, defaultValue = 0) {
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Safe integer parse with default
 */
export function safeInt(value, defaultValue = 0) {
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Safe boolean parse
 */
export function safeBool(value, defaultValue = false) {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  return defaultValue;
}

// ═══════════════════════════════════════════════════════════════════════════
// COST BREAKDOWN HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate cost breakdown percentages
 */
export function calcCostBreakdown(costs, total) {
  const breakdown = {};
  
  Object.entries(costs).forEach(([key, value]) => {
    breakdown[key] = {
      amount: value,
      percentage: (value / total) * 100
    };
  });
  
  return breakdown;
}

/**
 * Calculate subtotal and totals
 */
export function calcTotals(items, taxRate = 0.18) {
  const subtotal = sumObjectValues(items);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  return {
    subtotal,
    tax,
    taxRate: taxRate * 100,
    total
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ESTIMATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Add contingency to estimate
 */
export function withContingency(amount, contingencyPercent = 7) {
  return addPercentage(amount, contingencyPercent);
}

/**
 * Calculate range estimate (min/max)
 */
export function calcRangeEstimate(baseAmount, variance = 5) {
  return {
    min: baseAmount * (1 - variance / 100),
    base: baseAmount,
    max: baseAmount * (1 + variance / 100)
  };
}

/**
 * Calculate cost per unit
 */
export function calcCostPerUnit(totalCost, units) {
  return units > 0 ? totalCost / units : 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT ALL UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // Validation
  ValidationResult,
  validateBuildingDimensions,
  validateMaterialRates,
  validateCalculatorInputs,
  
  // Unit Conversion
  sqftToSqm,
  ftToM,
  cftToCum,
  sqmToSqft,
  mToFt,
  cumToCft,
  roundTo,
  
  // Calculations
  calcArea,
  calcTotalArea,
  calcVolume,
  applyFactor,
  calcPercentage,
  addPercentage,
  
  // Rates
  setupRates,
  getRate,
  
  // Formatting
  formatINR,
  formatQuantity,
  formatArea,
  
  // Range
  clamp,
  isInRange,
  bounded,
  
  // Arrays
  sum,
  average,
  sumObjectValues,
  groupBy,
  
  // Parsing
  safeFloat,
  safeInt,
  safeBool,
  
  // Cost Analysis
  calcCostBreakdown,
  calcTotals,
  
  // Estimation
  withContingency,
  calcRangeEstimate,
  calcCostPerUnit
};