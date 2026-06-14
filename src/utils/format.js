const BRANCH_LABELS = {
  all: 'All Branches',
  cebu: 'Cebu Branch',
  bacolod: 'Bacolod Branch',
  dumaguete: 'Dumaguete Branch',
};

const PRICING_TIER_LABELS = {
  retail: 'Retail Pricing',
  wholesale: 'Wholesale Pricing',
};

/**
 * Formats a numeric amount into Philippine Peso currency.
 *
 * @param {number} value Currency amount to format.
 * @returns {string} Formatted currency string.
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Resolves the label for a branch key.
 *
 * @param {string} branch Branch identifier.
 * @returns {string} Display label.
 */
export function formatBranchLabel(branch) {
  return BRANCH_LABELS[branch] ?? branch;
}

/**
 * Resolves the label for a pricing tier key.
 *
 * @param {string} tier Pricing tier identifier.
 * @returns {string} Display label.
 */
export function formatPricingTierLabel(tier) {
  return PRICING_TIER_LABELS[tier] ?? tier;
}

/**
 * Gets visible stock based on the active branch filter.
 *
 * @param {object} product Inventory item record.
 * @param {string} branch Active branch key.
 * @returns {number} Available quantity.
 */
export function getStockForBranch(product, branch) {
  if (branch === 'all') {
    return Object.values(product.stock).reduce((sum, value) => sum + value, 0);
  }

  return product.stock[branch] ?? 0;
}
