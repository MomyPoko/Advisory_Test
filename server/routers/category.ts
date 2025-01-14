import { Router } from "express";
import { protect } from "../middlewares/protect";
import {
  addCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/category.controller";

const categoryRouter = Router();

categoryRouter.use(protect);

categoryRouter.post("/", addCategory);
categoryRouter.get("/", getCategories);
categoryRouter.put("/:categoryId", updateCategory);
categoryRouter.delete("/:categoryId", deleteCategory);

export default categoryRouter;
