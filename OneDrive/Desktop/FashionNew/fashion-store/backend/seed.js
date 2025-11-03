import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';
import fs from 'fs';
import path from 'path';
import url from 'url';

dotenv.config();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
  try {
    await connectDB();
    const filePath = path.join(__dirname, 'data', 'products.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const products = JSON.parse(raw);
    await Product.deleteMany({});
    await Product.insertMany(products);
    // eslint-disable-next-line no-console
    console.log('Seeded products:', products.length);
    process.exit(0);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  }
};

run();

