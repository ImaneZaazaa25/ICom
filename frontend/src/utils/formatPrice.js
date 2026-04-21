/**
 * Formate un prix en euros avec deux décimales et séparateur de milliers.
 * @param {number} price - Le prix brut à formater
 * @returns {string} Le prix formaté, ex : '1 234,56 €'
 */
export const formatPrice = (price) => {
  const num = Number.parseFloat(price);
  if (price === null || price === undefined || Number.isNaN(num)) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(0);
  }
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(num);
};
