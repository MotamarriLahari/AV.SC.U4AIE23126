const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const notificationRoutes = require("./routes/notificationRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");

const app = express();
app.set("json spaces", 2);

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.send("Campus Notifications Microservice Running");
});
app.use("/schedule", scheduleRoutes);
app.use("/notifications", notificationRoutes);
const PORT = process.env.PORT || 5000;



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
