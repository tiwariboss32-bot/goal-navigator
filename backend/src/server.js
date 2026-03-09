import express from "express";
import healthRouter from "./routes/health.js";

const app = express();

app.use(express.json());

app.use("/health", healthRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
