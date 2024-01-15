import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import { notFound, errorMessage } from "./middleware/errorMiddleware.js";
import ConnectToDB from "./config/db.js";
import cookieParser from "cookie-parser";
dotenv.config();

const port = process.env.PORT;

ConnectToDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorMessage);

app.get("/", (req, res) => {
  console.log("Server is Ready");
});

app.listen(port || 3000, () => {
  console.log(`Server is running on port ${port || 3000}`);
});
