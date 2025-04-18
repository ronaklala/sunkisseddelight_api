const express = require("express");
const router = express.Router();
const {
  createOrder,
  paymentSuccess,
  getSingleOrder,
} = require("../controllers/orderController");

router.post("/create-order", createOrder);
router.post("/payment-success", paymentSuccess);
router.get("/single-order/:id", getSingleOrder);

module.exports = router;
