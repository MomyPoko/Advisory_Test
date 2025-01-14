import { Router } from "express";
import { protect } from "../middlewares/protect";
import {
  addTransaction,
  getTransactionsAndSummary,
} from "../controllers/transaction.controller";

const transactionRouter = Router();

transactionRouter.use(protect);

transactionRouter.post("/", addTransaction);
transactionRouter.get("/", getTransactionsAndSummary);

export default transactionRouter;
