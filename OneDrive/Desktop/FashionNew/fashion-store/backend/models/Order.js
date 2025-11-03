import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    image: String
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [orderItemSchema],
    shippingAddress: {
      address: String,
      city: String,
      postalCode: String,
      country: String
    },
    paymentMethod: { type: String, default: 'card' },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String
    },
    itemsPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);


