import { Request, Response } from "express";
import connectionPool from "../utils/db";

export async function addAccount(req: Request, res: Response): Promise<void> {
  const { userId, accountName } = req.body;

  if (!accountName) {
    res.status(400).json({ message: "Account name is required" });
    return;
  }

  try {
    await connectionPool.query(
      "INSERT INTO accounts (user_id, account_name, account_balance) VALUES ($1, $2, $3)",
      [userId, accountName, 0]
    );

    res.status(200).json({ message: "Account created successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Fail to add account because of database connection" });
  }
}

export async function deleteAccount(
  req: Request,
  res: Response
): Promise<void> {
  const { accountId } = req.params;
  const { userId } = req.body;

  try {
    const result = await connectionPool.query(
      "DELETE FROM accounts WHERE account_id = $1 AND user_id = $2",
      [accountId, userId]
    );

    if (result.rowCount === 0) {
      res.status(400).json({ message: "Account not found" });
      return;
    }

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to delete account because of database connection",
    });
  }
}

export async function getAccouts(req: Request, res: Response): Promise<void> {
  const { userId } = req.body;

  try {
    const result = await connectionPool.query(
      "SELECT account_id, account_name, account_balance FROM accounts WHERE user_id = $1",
      [userId]
    );

    res
      .status(200)
      .json({ message: "data fetch succesfully", data: result.rows });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to fetch accounts because of database connection",
    });
  }
}

export async function updateAccount(
  req: Request,
  res: Response
): Promise<void> {
  const { accountId } = req.params;
  const { userId, accountBalance } = req.body;

  try {
    const accountResult = await connectionPool.query(
      "SELECT account_balance FROM accounts WHERE account_id = $1 AND user_id = $2",
      [accountId, userId]
    );

    if (accountResult.rowCount === 0) {
      res.status(404).json({ message: "Account not found" });
      return;
    }

    const { account_balance } = accountResult.rows[0];

    let newBalance = parseFloat(account_balance);

    if (accountBalance !== undefined) {
      if (isNaN(accountBalance)) {
        res.status(400).json({ message: "Invalid accountBalance value" });
        return;
      }
      newBalance = accountBalance;
    }

    await connectionPool.query(
      "UPDATE accounts SET account_balance = $1, updated_at = NOW() WHERE account_id = $2 AND user_id = $3",
      [newBalance, accountId, userId]
    );

    res.status(200).json({
      message: "Account updated successfully",
      data: {
        account_id: accountId,
        account_balance: Number(newBalance),
      },
    });
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({
      message: "Failed to update account because of database connection",
    });
  }
}
