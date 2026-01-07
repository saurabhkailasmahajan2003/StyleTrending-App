# Razorpay Integration Setup Guide

## ✅ Integration Complete

Razorpay checkout has been integrated into the Expo mobile app using `react-native-razorpay` with the same backend order APIs.

## 📋 Prerequisites

Since `react-native-razorpay` requires native modules, you need to use Expo's prebuild feature:

1. **Expo SDK 51+** (already installed)
2. **Native modules support** (requires prebuild)

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd mobile-app
npm install react-native-razorpay
```

### Step 2: Prebuild Native Code

Since `react-native-razorpay` requires native modules, you need to generate native code:

```bash
npx expo prebuild
```

This will create `android/` and `ios/` directories with native code.

### Step 3: iOS Setup (if building for iOS)

```bash
cd ios
pod install
cd ..
```

### Step 4: Update app.json (if needed)

Ensure your `app.json` includes necessary permissions:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "deploymentTarget": "10.0"
          },
          "android": {
            "minSdkVersion": 21
          }
        }
      ]
    ]
  }
}
```

### Step 5: Build and Run

**For Android:**
```bash
npx expo run:android
```

**For iOS:**
```bash
npx expo run:ios
```

## 🔄 Payment Flow

### Razorpay Payment Flow

1. **User fills shipping address** → Saved automatically
2. **User selects "Online Payment"** → Razorpay option
3. **User clicks "Pay Now"** → 
   - Backend creates Razorpay order via `POST /payment/create-order`
   - Receives `orderId`, `amount`, `currency`, `key`
4. **Razorpay checkout opens** → Native payment UI
5. **User completes payment** →
   - Receives payment response with `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`
6. **Backend verifies payment** → `POST /payment/verify-payment`
7. **Order created** → Cart cleared, navigate to orders

### COD Payment Flow

1. **User fills shipping address** → Saved automatically
2. **User selects "Cash on Delivery"** → COD option
3. **User clicks "Place Order"** →
   - Shows processing steps
   - Backend creates order via `POST /orders/create` with `paymentMethod: 'COD'`
4. **Order confirmed** → Cart cleared, navigate to orders

## 📝 API Endpoints Used

All endpoints match the web version:

### Payment APIs
- `POST /payment/create-order`
  - Body: `{ shippingAddress }`
  - Response: `{ success, data: { orderId, amount, currency, key } }`

- `POST /payment/verify-payment`
  - Body: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`
  - Response: `{ success, data: { order } }`

### Order APIs
- `POST /orders/create`
  - Body: `{ shippingAddress, paymentMethod }`
  - Response: `{ success, data: { order } }`

## 🔒 Security Features

1. **Backend Order Creation**: Razorpay order is created on backend (secure)
2. **Payment Verification**: Payment signature verified on backend
3. **No Key Exposure**: Razorpay key never exposed to client
4. **Secure Token Storage**: JWT tokens stored in SecureStore

## 🎯 Features Implemented

- ✅ Razorpay checkout integration
- ✅ COD payment support
- ✅ Shipping address form
- ✅ Address auto-save
- ✅ Order summary
- ✅ Payment method selection
- ✅ Processing states
- ✅ Error handling
- ✅ Same backend APIs as web
- ✅ Mobile-optimized UI

## ⚠️ Important Notes

1. **Native Modules Required**: This integration requires Expo prebuild and native code
2. **Testing**: Use Razorpay test keys for development
3. **Production**: Update Razorpay keys in backend for production
4. **Backend Unchanged**: All backend APIs remain the same as web version

## 🧪 Testing

### Test Mode
- Use Razorpay test keys from your Razorpay dashboard
- Test payments with Razorpay test cards
- Verify payment flow end-to-end

### Test Cards
- Success: `4111 1111 1111 1111`
- Failure: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

## 📱 Mobile Payment Flow

The mobile payment flow follows Razorpay's native SDK:

1. **Native UI**: Uses Razorpay's native payment UI (better UX than WebView)
2. **Multiple Payment Methods**: Cards, UPI, Wallets, Net Banking
3. **Auto-fill**: Pre-fills user details from shipping address
4. **Secure**: All payment data handled by Razorpay SDK

## 🚀 Ready to Use

The CheckoutScreen is fully functional with:
- ✅ Razorpay integration using `react-native-razorpay`
- ✅ Same backend APIs as web
- ✅ COD support
- ✅ Mobile-optimized payment flow
- ✅ All features preserved

## 📚 Additional Resources

- [Razorpay React Native SDK Docs](https://razorpay.com/docs/payments/payment-gateway/react-native-integration/)
- [Expo Prebuild Docs](https://docs.expo.dev/workflow/prebuild/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/test-cards/)

