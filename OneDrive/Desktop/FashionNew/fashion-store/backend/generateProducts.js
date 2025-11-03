
import fs from "fs";
import { faker } from "@faker-js/faker";

const fashionData = {
  Mens: {
    "T-Shirts": {
      items: ["Crew Neck T-Shirt", "V-Neck Tee", "Henley Shirt", "Polo Shirt", "Graphic T-Shirt"],
      brands: ["Nike", "Adidas", "Levi's", "H&M", "Zara"],
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
        "https://images.unsplash.com/photo-1562157873-818bc0726f68",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a"
      ],
      priceRange: { min: 299, max: 1299 }
    },
    "Shirts": {
      items: ["Oxford Button-Down", "Casual Denim Shirt", "Formal White Shirt", "Checked Shirt", "Linen Shirt"],
      brands: ["Ralph Lauren", "Tommy Hilfiger", "Calvin Klein", "Van Heusen", "Peter England"],
      images: [
        "https://images.unsplash.com/photo-1604695573706-53170668f6a6",
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c",
        "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc"
      ],
      priceRange: { min: 799, max: 2499 }
    },
    "Bottom Wear": {
      items: ["Slim Fit Jeans", "Chino Pants", "Cargo Pants", "Formal Trousers", "Track Pants"],
      brands: ["Levi's", "Diesel", "Pepe Jeans", "Wrangler", "Lee"],
      images: [
        "https://images.unsplash.com/photo-1584865288642-42078afe6942",
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80",
        "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8"
      ],
      priceRange: { min: 999, max: 2999 }
    },
    "Blazers": {
      items: ["Classic Fit Blazer", "Slim Fit Suit Jacket", "Casual Blazer", "Tuxedo Jacket", "Sports Coat"],
      brands: ["Raymond", "Louis Philippe", "Van Heusen", "Arrow", "Park Avenue"],
      images: [
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf",
        "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc",
        "https://images.unsplash.com/photo-1598032895397-b9472444bf93"
      ],
      priceRange: { min: 2999, max: 7999 }
    },
    "Footwear": {
      items: ["Running Shoes", "Formal Leather Shoes", "Casual Sneakers", "Loafers", "Sports Shoes"],
      brands: ["Nike", "Adidas", "Puma", "Reebok", "Bata"],
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5",
        "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb"
      ],
      priceRange: { min: 999, max: 5999 }
    }
  },
  Womens: {
    "Tops": {
      items: ["Casual Blouse", "Crop Top", "Tank Top", "Tunic Top", "Off-Shoulder Top"],
      brands: ["Zara", "H&M", "Forever 21", "Mango", "Vero Moda"],
      images: [
        "https://images.unsplash.com/photo-1564257631407-4deb1f99d992",
        "https://images.unsplash.com/photo-1618244972599-11d777b2357e",
        "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8"
      ],
      priceRange: { min: 399, max: 1999 }
    },
    "Dresses": {
      items: ["Maxi Dress", "Cocktail Dress", "Summer Dress", "A-Line Dress", "Wrap Dress"],
      brands: ["AND", "ONLY", "Zara", "H&M", "Forever New"],
      images: [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8",
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1",
        "https://images.unsplash.com/photo-1551803091-e20673f15770"
      ],
      priceRange: { min: 999, max: 3999 }
    },
    "Bottom Wear": {
      items: ["Skinny Jeans", "Palazzo Pants", "Leggings", "Culottes", "Skirt"],
      brands: ["Levi's", "Zara", "H&M", "Marks & Spencer", "ONLY"],
      images: [
        "https://images.unsplash.com/photo-1582418702059-97ebafb35d09",
        "https://images.unsplash.com/photo-1591369822096-ffd140ec948f",
        "https://images.unsplash.com/photo-1592301933927-35b597393c0a"
      ],
      priceRange: { min: 799, max: 2499 }
    },
    "Blazers": {
      items: ["Professional Blazer", "Casual Blazer", "Cropped Blazer", "Long Blazer", "Fitted Blazer"],
      brands: ["Zara", "H&M", "Mango", "Marks & Spencer", "Vero Moda"],
      images: [
        "https://images.unsplash.com/photo-1580530793368-6279da5e172c",
        "https://images.unsplash.com/photo-1632149877166-f75d49000351",
        "https://images.unsplash.com/photo-1600717535275-0b18ede2f7fc"
      ],
      priceRange: { min: 1999, max: 5999 }
    },
    "Footwear": {
      items: ["Heels", "Flats", "Sneakers", "Boots", "Sandals"],
      brands: ["Nike", "Adidas", "Steve Madden", "Aldo", "Charles & Keith"],
      images: [
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2",
        "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95",
        "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2"
      ],
      priceRange: { min: 799, max: 4999 }
    }
  },
  Kids: {
    "T-Shirts": {
      items: ["Cartoon T-Shirt", "Striped T-Shirt", "Graphic Tee", "Basic T-Shirt", "Sports T-Shirt"],
      brands: ["H&M Kids", "Zara Kids", "GAP Kids", "United Colors of Benetton", "Max Kids"],
      images: [
        "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8",
        "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea",
        "https://images.unsplash.com/photo-1519278409-1f56fdda7fe5"
      ],
      priceRange: { min: 199, max: 799 }
    },
    "Bottom Wear": {
      items: ["Jeans", "Track Pants", "Shorts", "Casual Pants", "School Pants"],
      brands: ["H&M Kids", "Zara Kids", "GAP Kids", "United Colors of Benetton", "Max Kids"],
      images: [
        "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8",
        "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea",
        "https://images.unsplash.com/photo-1519278409-1f56fdda7fe5"
      ],
      priceRange: { min: 399, max: 1299 }
    },
    "Footwear": {
      items: ["School Shoes", "Sports Shoes", "Casual Shoes", "Sandals", "Slip-ons"],
      brands: ["Nike Kids", "Adidas Kids", "Puma Kids", "Bata Kids", "Sketchers Kids"],
      images: [
        "https://images.unsplash.com/photo-1514989940723-e8e51635b782",
        "https://images.unsplash.com/photo-1507464098880-e367bc5d2c08",
        "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2"
      ],
      priceRange: { min: 499, max: 1999 }
    }
  }
};

let products = [];

// Generate products for each category and subcategory
Object.entries(fashionData).forEach(([category, subcategories]) => {
  Object.entries(subcategories).forEach(([subCategory, data]) => {
    // Generate 20-30 products per subcategory
    const count = faker.number.int({ min: 20, max: 30 });
    
    for (let i = 0; i < count; i++) {
      const itemName = faker.helpers.arrayElement(data.items);
      const brand = faker.helpers.arrayElement(data.brands);
      
      const product = {
        name: `${brand} ${itemName}`,
        brand,
        category,
        subCategory,
        price: faker.number.int({
          min: data.priceRange.min,
          max: data.priceRange.max
        }),
        description: faker.commerce.productDescription(),
        image: faker.helpers.arrayElement(data.images),
        color: faker.helpers.arrayElement([
          "Black", "White", "Navy", "Gray", "Red", "Blue", "Green", 
          "Beige", "Brown", "Pink", "Purple", "Yellow"
        ]),
        sizes: faker.helpers.arrayElements(
          ["XS", "S", "M", "L", "XL", "XXL"],
          faker.number.int({ min: 3, max: 6 })
        ),
        rating: faker.number.float({ min: 3.5, max: 5, precision: 0.1 }),
        reviews: faker.number.int({ min: 5, max: 500 }),
        stock: faker.number.int({ min: 0, max: 100 }),
        discount: faker.helpers.maybe(() => faker.number.int({ min: 5, max: 50 }), { probability: 0.3 }),
        newArrival: faker.helpers.maybe(() => true, { probability: 0.2 }),
        onSale: faker.helpers.maybe(() => true, { probability: 0.25 })
      };
      
      products.push(product);
    }
  });
});

// Save to products.json
fs.writeFileSync("./data/products.json", JSON.stringify(products, null, 2));
console.log(`✅ Generated ${products.length} realistic fashion products!`);
