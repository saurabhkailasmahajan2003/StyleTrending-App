import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;
  
  // Basic filters
  const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: 'i' } } : {};
  const category = req.query.category ? { category: req.query.category } : {};
  const subCategory = req.query.subCategory ? { subCategory: req.query.subCategory } : {};
  const isNewArrival = req.query.isNewArrival ? { newArrival: req.query.isNewArrival === 'true' } : {};
  const onSale = req.query.onSale ? { onSale: req.query.onSale === 'true' } : {};
  
  // Price range filter
  const priceFilter = {};
  if (req.query.minPrice) priceFilter.$gte = Number(req.query.minPrice);
  if (req.query.maxPrice) priceFilter.$lte = Number(req.query.maxPrice);
  const price = Object.keys(priceFilter).length > 0 ? { price: priceFilter } : {};

  // Brand filter
  const brand = req.query.brands ? { brand: { $in: req.query.brands.split(',') } } : {};
  
  // Color filter
  const color = req.query.colors ? { color: { $in: req.query.colors.split(',') } } : {};
  
  // Size filter
  const size = req.query.sizes ? { sizes: { $in: req.query.sizes.split(',') } } : {};
  
  // Rating filter
  const rating = req.query.minRating ? { rating: { $gte: Number(req.query.minRating) } } : {};
  
  // Stock status filter
  const inStock = req.query.inStock ? { stock: { $gt: 0 } } : {};
  
  // Combine all filters
  const filter = {
    ...keyword,
    ...category,
    ...subCategory,
    ...isNewArrival,
    ...onSale,
    ...price,
    ...brand,
    ...color,
    ...size,
    ...rating,
    ...inStock
  };

  // Sorting
  let sortOption = { createdAt: -1 }; // Default sort by newest
  if (req.query.sort) {
    switch (req.query.sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'popularity':
        sortOption = { reviews: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
  }

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) return res.json(product);
  return res.status(404).json({ message: 'Product not found' });
});

