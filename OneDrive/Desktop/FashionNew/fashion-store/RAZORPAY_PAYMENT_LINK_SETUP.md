# Razorpay Personalized Payment Link Setup

## Issue Fixed

The payment link was using amount in **rupees** (4703.6) but Razorpay requires amount in **paise** (470360).

## Current Implementation

The checkout now redirects to: `https://razorpay.me/@saurabhkailasmahajan?amount=<paise>`

Where amount is calculated as: `Math.round(totalPrice * 100)` to convert rupees to paise.

## How Personalized Payment Links Work

Personalized Razorpay.me links (`razorpay.me/@username`) have limited parameter support:

### Supported Parameters:
- ✅ `amount` - Required (in paise, not rupees)
- ❌ `name`, `email`, `contact`, `description` - May not be supported by personalized links

### Minimum Working Format:
```
https://razorpay.me/@saurabhkailasmahajan?amount=470360
```

## If Payment Link Shows Error

### Possible Reasons:
1. **Link Not Activated**: The personalized link might not be activated in your Razorpay dashboard
2. **Account Issues**: Your Razorpay account might need verification
3. **Link Format**: Some parameters might not be supported

### Solution Steps:

1. **Activate Your Payment Link**:
   - Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Go to Payment Links
   - Ensure your personalized link is active
   - Check if any settings need to be configured

2. **Verify Your Account**:
   - Complete KYC verification if required
   - Ensure your account is in "Live" mode for production

3. **Test the Link Directly**:
   - Try accessing: `https://razorpay.me/@saurabhkailasmahajan?amount=100` (₹1.00)
   - If this works, the link is active
   - If it shows error, the link needs activation

4. **Alternative: Use Dynamic Payment Links API**:
   If the personalized link doesn't work, you can use Razorpay's Payment Links API to create dynamic links:
   ```javascript
   // In backend/paymentController.js
   const razorpay = new Razorpay({...});
   const paymentLink = await razorpay.paymentLink.create({
     amount: amountInPaise,
     currency: 'INR',
     description: `Order #${orderId}`,
     customer: {
       name: form.name,
       email: form.email,
       contact: form.phone
     }
   });
   ```

## Testing

1. Test with a small amount first (₹1 = 100 paise)
2. Use test mode credentials if in development
3. Check Razorpay dashboard for payment attempts

## Next Steps

If the personalized link still shows errors:
1. Contact Razorpay support to activate your personalized link
2. Or implement dynamic payment links using the Razorpay API
3. Or use Razorpay Checkout (modal integration) instead

