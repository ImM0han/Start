const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth",require("./routes/authRoutes"));
app.use("/api/jobs",require("./routes/jobRoutes"));
app.use("/api/chat",require("./routes/chatRoutes"));

module.exports = app;
