import asyncHandler from 'express-async-handler';
import Cart from '../models/Cart.js';

export const getMyCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  return res.json(cart || { user: req.user._id, items: [] });
});

export const setCartItems = asyncHandler(async (req, res) => {
  const { items } = req.body; // [{ product, qty }]
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });
  cart.items = items;
  await cart.save();
  const populated = await cart.populate('items.product');
  return res.json(populated);
});


