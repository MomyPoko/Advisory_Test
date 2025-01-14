import { Router } from "express";
import { protect } from "../middlewares/protect";
import {
  addAccount,
  deleteAccount,
  getAccouts,
  updateAccount,
} from "../controllers/account.controller";

const accountRouter = Router();

accountRouter.use(protect);

accountRouter.post("/", addAccount);
accountRouter.get("/", getAccouts);
accountRouter.put("/:accountId", updateAccount);
accountRouter.delete("/:accountId", deleteAccount);

export default accountRouter;
