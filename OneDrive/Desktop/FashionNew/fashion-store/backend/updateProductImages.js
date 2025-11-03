import mongoose from "mongoose";
import Product from "./models/Product.js";
import dotenv from "dotenv";

dotenv.config();


const imagesBySubCategory = {
  "T-Shirts": [
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    "https://images.unsplash.com/photo-1600180758890-6f7b27d3b30d"
  ],
  "Shirts": [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    "https://images.unsplash.com/photo-1598033129183-c8a56c0d4e9b"
  ],
  "Bottom Wear": [
    "https://images.unsplash.com/photo-1593032465171-8b8b09c3d63a",
    "https://images.unsplash.com/photo-1583002231628-5e8f5643b1c4"
  ],
  "Blazers": [
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e",
    "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126"
  ],
  "Footwear": [
    "https://images.unsplash.com/photo-1519744792095-2f2205e87b6f"
  ],
  "Tops": [
    "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0"
  ],
  "Dresses": [
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246",
    "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb"
  ]
};

function getImageForProduct(product) {
  const imgs = imagesBySubCategory[product.subCategory] || imagesBySubCategory[product.category] || [];
  if (imgs.length > 0) {
    return imgs[Math.floor(Math.random() * imgs.length)];
  }
  // fallback: pick any image
  const allImgs = Object.values(imagesBySubCategory).flat();
  return allImgs[Math.floor(Math.random() * allImgs.length)];
}

async function updateImages() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fashion_store';
    await mongoose.connect(uri);
    const products = await Product.find();
    for (const product of products) {
      product.image = getImageForProduct(product);
      await product.save();
    }
    console.log(`✅ Updated ${products.length} products with new images!`);
    process.exit();
  } catch (err) {
    console.error("❌ Error updating images:", err);
    process.exit(1);
  }
}

updateImages();
