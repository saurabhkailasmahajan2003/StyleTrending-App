/**
 * Type Definitions (JSDoc for better IDE support)
 * For TypeScript migration, convert these to .ts files
 */

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {Object} address
 */

/**
 * @typedef {Object} Product
 * @property {string} _id
 * @property {string} name
 * @property {number} price
 * @property {number} finalPrice
 * @property {string[]} images
 * @property {string} category
 */

/**
 * @typedef {Object} CartItem
 * @property {string} _id
 * @property {Product} product
 * @property {number} quantity
 * @property {string} size
 * @property {string} color
 */

/**
 * @typedef {Object} Order
 * @property {string} _id
 * @property {CartItem[]} items
 * @property {Object} shippingAddress
 * @property {string} paymentMethod
 * @property {string} status
 * @property {Date} createdAt
 */

export {};

