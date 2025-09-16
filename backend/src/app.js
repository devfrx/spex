// backend/src/app.js
const express = require("express");
const cors = require("cors");
const amazonRoutes = require("./routes/amazon");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/amazon", amazonRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
