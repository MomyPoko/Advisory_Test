import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routers/auth";
import accountRouter from "./routers/account";
import categoryRouter from "./routers/category";
import transactionRouter from "./routers/transaction";

const app = express();
const port = 4000;

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:4000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/auth", authRouter);
app.use("/account", accountRouter);
app.use("/category", categoryRouter);
app.use("/transaction", transactionRouter);

app.listen(port, () => {
  console.log(`Server API is running at ${port}`);
});
