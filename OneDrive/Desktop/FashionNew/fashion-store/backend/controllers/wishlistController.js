import asyncHandler from 'express-async-handler';
import Wishlist from '../models/Wishlist.js';

export const getMyWishlist = asyncHandler(async (req, res) => {
  const wl = await Wishlist.findOne({ user: req.user._id }).populate('products');
  return res.json(wl || { user: req.user._id, products: [] });
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  let wl = await Wishlist.findOne({ user: req.user._id });
  if (!wl) wl = new Wishlist({ user: req.user._id, products: [] });
  const idx = wl.products.findIndex((p) => p.toString() === productId);
  if (idx >= 0) wl.products.splice(idx, 1);
  else wl.products.push(productId);
  await wl.save();
  const populated = await wl.populate('products');
  return res.json(populated);
});


