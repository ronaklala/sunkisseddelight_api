/* This JavaScript code snippet is setting up a server-side functionality for handling payments using
the Razorpay payment gateway. Here's a breakdown of what the code is doing: */
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/orderSchema");

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// ✅ Create Razorpay Order
exports.createOrder = async (req, res) => {
  const { userName, email, phone, address, zipcode, amount, quantity } =
    req.body;

  const options = {
    amount: amount * 100 * quantity,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    payment_capture: 1,
  };

  try {
    const razorpayOrder = await instance.orders.create(options);

    const order = new Order({
      userName,
      email,
      phone,
      address,
      zipcode,
      amount,
      quantity,
      orderId: razorpayOrder.id,
      paymentStatus: "pending",
    });

    await order.save();

    res
      .status(201)
      .json({ orderId: order.orderId, amount: order.amount * quantity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Handle Payment Success
exports.paymentSuccess = async (req, res) => {
  const { orderId, razorpayPaymentId, razorpaySignature } = req.body;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(orderId + "|" + razorpayPaymentId)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      {
        paymentId: razorpayPaymentId,
        paymentStatus: "paid",
        orderStatus: "processing",
        paidAt: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      orderId: updatedOrder.orderId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSingleOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
