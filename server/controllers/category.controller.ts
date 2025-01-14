import { Request, Response } from "express";
import connectionPool from "../utils/db";

export async function addCategory(req: Request, res: Response): Promise<void> {
  const { userId, categoryName, accountId } = req.body;

  if (!categoryName || !accountId) {
    res
      .status(400)
      .json({ message: "Category name and accountId are required" });
    return;
  }

  try {
    const accountResult = await connectionPool.query(
      "SELECT account_balance FROM accounts WHERE account_id = $1 AND user_id = $2",
      [accountId, userId]
    );

    if (accountResult.rowCount === 0) {
      res.status(400).json({ message: "Account not found" });
      return;
    }

    await connectionPool.query(
      "INSERT INTO categorie_types (user_id, category_name, budget_amount, account_id) VALUES ($1, $2, $3 , $4)",
      [userId, categoryName, 0, accountId]
    );

    res.status(200).json({ message: "Categories created successfully" });
  } catch (error) {
    console.log("Error create category:", error);
    res.status(500).json({
      message: "Failed to add expense category because of database connection",
    });
  }
}

export async function deleteCategory(
  req: Request,
  res: Response
): Promise<void> {
  const { categoryId } = req.params;
  const { userId } = req.body;

  try {
    const result = await connectionPool.query(
      "DELETE FROM categorie_type WHERE category_id = $1 AND user_id = $2",
      [categoryId, userId]
    );

    if (result.rowCount === 0) {
      res.status(400).json({ message: "Category not found" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to delete category because of database connection",
    });
  }
}

export async function getCategories(
  req: Request,
  res: Response
): Promise<void> {
  const { userId } = req.body;
  try {
    const result = await connectionPool.query(
      "SELECT category_id,category_name, budget_amount FROM categorie_types WHERE user_id = $1",
      [userId]
    );

    res
      .status(200)
      .json({ message: "data fetch succesfully", data: result.rows });
  } catch (error) {
    console.log("Error dalete category:", error);
    res.status(500).json({
      message: "Failed to fetch categories because of database connection",
    });
  }
}

export async function updateCategory(
  req: Request,
  res: Response
): Promise<void> {
  const { categoryId } = req.params;
  const { userId, budgetAmountChange = 0 } = req.body;

  try {
    if (isNaN(budgetAmountChange)) {
      res.status(400).json({ message: "Invalid budget" });
      return;
    }

    const categoryResult = await connectionPool.query(
      "SELECT budget_amount, account_id FROM categorie_types WHERE category_id = $1 AND user_id = $2",
      [categoryId, userId]
    );

    if (categoryResult.rowCount === 0) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    const { budget_amount, account_id } = categoryResult.rows[0];
    const currentBudget = parseFloat(budget_amount);

    const accountResult = await connectionPool.query(
      "SELECT account_balance FROM accounts WHERE account_id = $1 AND user_id = $2",
      [account_id, userId]
    );

    if (accountResult.rowCount === 0) {
      res.status(404).json({ message: "Account not found" });
      return;
    }

    const { account_balance } = accountResult.rows[0];
    const currentBalance = parseFloat(account_balance);

    const newBudget = currentBudget + parseFloat(budgetAmountChange);

    const newAccountBalance = currentBalance - parseFloat(budgetAmountChange);

    if (newBudget < 0) {
      res.status(400).json({ message: "Budget cannot be negative" });
      return;
    }

    if (newAccountBalance < 0) {
      res.status(400).json({ message: "Not enough balance in the account" });
      return;
    }

    await connectionPool.query(
      "UPDATE categorie_types SET budget_amount = $1, updated_at = NOW() WHERE category_id = $2 AND user_id = $3",
      [newBudget, categoryId, userId]
    );

    await connectionPool.query(
      "UPDATE accounts SET account_balance = $1, updated_at = NOW() WHERE account_id = $2 AND user_id = $3",
      [newAccountBalance, account_id, userId]
    );

    res.status(200).json({
      message: "Category updated successfully",
      data: {
        newBudget,
      },
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      message: "Failed to update category because of database connection",
    });
  }
}
