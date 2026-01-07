# API Endpoints Reference

Complete list of all API endpoints matching the web frontend exactly.

## 🔐 Authentication (`authAPI`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| POST | `/auth/signup` | User registration | `userData: { name, email, password, phone }` |
| POST | `/auth/login` | User login | `email, password` |
| POST | `/auth/send-otp` | Send OTP to phone | `phone` |
| POST | `/auth/verify-otp` | Verify OTP | `phone, otp, name?, email?` |
| GET | `/auth/me` | Get current user | - |

## 🛒 Cart (`cartAPI`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/cart` | Get user's cart | - |
| POST | `/cart/add` | Add item to cart | `product, quantity, size, color` |
| PUT | `/cart/update/:itemId` | Update cart item quantity | `itemId, quantity` |
| DELETE | `/cart/remove/:itemId` | Remove item from cart | `itemId` |
| DELETE | `/cart/clear` | Clear entire cart | - |

## 📦 Orders (`orderAPI`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/orders` | Get user's orders | - |
| GET | `/orders/:orderId` | Get order details | `orderId` |
| POST | `/orders/create` | Create new order | `shippingAddress, paymentMethod` |

## 💳 Payment (`paymentAPI`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| POST | `/payment/create-order` | Create Razorpay order | `shippingAddress` |
| POST | `/payment/verify-payment` | Verify payment | `razorpay_order_id, razorpay_payment_id, razorpay_signature` |

## 👤 Profile (`profileAPI`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/profile` | Get user profile | - |
| PUT | `/profile/update` | Update user profile | `data` |

## 🛍️ Products (`productAPI`)

### Watches
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/products/watches` | Get watches | `params: { limit?, category?, gender?, ... }` |
| GET | `/products/watches/:id` | Get watch by ID | `id` |

### Lenses
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/products/lens` | Get lenses | `params: { limit?, category?, gender?, ... }` |
| GET | `/products/lens/:id` | Get lens by ID | `id` |

### Accessories
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/products/accessories` | Get accessories | `params: { limit?, category?, gender?, ... }` |
| GET | `/products/accessories/:id` | Get accessory by ID | `id` |

### Men's Items
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/products/men` | Get men's items | `params: { limit?, category?, ... }` |
| GET | `/products/men/:id` | Get men's item by ID | `id` |

### Women's Items
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/products/women` | Get women's items | `params: { limit?, category?, ... }` |
| GET | `/products/women/:id` | Get women's item by ID | `id` |

### Helper
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| - | `getAllProducts()` | Get all products from all categories | `params` |

## 👨‍💼 Admin (`adminAPI`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/admin/summary` | Get admin dashboard summary | - |
| GET | `/admin/orders` | Get all orders | - |
| PATCH | `/admin/orders/:orderId/status` | Update order status | `orderId, status` |
| DELETE | `/admin/orders/:orderId` | Delete order | `orderId` |
| GET | `/admin/products` | Get all products | `category?` |
| POST | `/admin/products` | Create product | `payload` |
| PUT | `/admin/products/:id` | Update product | `id, payload` |
| DELETE | `/admin/products/:id` | Delete product | `id, category?` |
| GET | `/admin/users` | Get all users | - |
| DELETE | `/admin/users/:userId` | Delete user | `userId` |

## ⭐ Reviews (`reviewAPI`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/reviews/:productId` | Get product reviews | `productId, sort, limit` |
| POST | `/reviews` | Create review | `reviewData` |
| PUT | `/reviews/:reviewId/helpful` | Mark review as helpful | `reviewId` |

## ❤️ Wishlist (`wishlistAPI`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/wishlist` | Get user's wishlist | - |
| POST | `/wishlist/add` | Add to wishlist | `productId` |
| DELETE | `/wishlist/remove/:productId` | Remove from wishlist | `productId` |
| GET | `/wishlist/check/:productId` | Check if in wishlist | `productId` |

## 🔍 Search (`searchAPI`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/search` | Search products | `q, ...params` |

## 📍 Tracking (`trackingAPI`)

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/orders/track/:orderId` | Track order | `orderId` |

## 📝 Usage Examples

```javascript
import { authAPI, productAPI, cartAPI } from '../services/api';

// Login
const loginResponse = await authAPI.login('user@example.com', 'password');

// Get products
const watches = await productAPI.getWatches({ limit: 10, gender: 'men' });

// Add to cart
await cartAPI.addToCart(product, 1, 'M', 'Black');
```

## 🔐 Authentication

All authenticated endpoints automatically include JWT token:
```
Authorization: Bearer <token>
```

Token is retrieved from secure storage before each request.

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

## ✅ All Endpoints Verified

All endpoints match the web frontend exactly. No modifications to API logic.

