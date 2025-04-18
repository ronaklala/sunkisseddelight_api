const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const orderRoutes = require("./routes/paymentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.DB_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connected");
});

// // API Routes
app.use("/api", orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
