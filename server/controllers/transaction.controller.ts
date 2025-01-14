import { Request, Response } from "express";
import connectionPool from "../utils/db";

export async function addTransaction(
  req: Request,
  res: Response
): Promise<void> {
  const {
    userId,
    accountId,
    categoryId,
    transactionAmount,
    transactionNote,
    transactionDate,
  } = req.body;

  if (!accountId || !transactionAmount) {
    res
      .status(400)
      .json({ message: "Account and transaction amount are required" });
    return;
  }

  try {
    if (categoryId) {
      const categoryResult = await connectionPool.query(
        "SELECT budget_amount FROM categorie_types WHERE category_id = $1 AND user_id = $2",
        [categoryId, userId]
      );

      if (categoryResult.rowCount === 0) {
        res.status(404).json({ message: "Category not found" });
        return;
      }

      const { budget_amount } = categoryResult.rows[0];

      if (parseFloat(budget_amount) < transactionAmount) {
        res.status(400).json({ message: "Not enough budget in the category" });
        return;
      }

      await connectionPool.query(
        "UPDATE categorie_types SET budget_amount = budget_amount - $1, updated_at = NOW() WHERE category_id = $2 AND user_id = $3",
        [transactionAmount, categoryId, userId]
      );
    } else {
      const accountResult = await connectionPool.query(
        "SELECT account_balance FROM accounts WHERE account_id = $1 AND user_id = $2",
        [accountId, userId]
      );

      if (accountResult.rowCount === 0) {
        res.status(400).json({ message: "Account not found" });
        return;
      }

      const { account_balance } = accountResult.rows[0];

      if (parseFloat(account_balance) < transactionAmount) {
        res.status(400).json({ message: "Not enough money in the account" });
        return;
      }

      await connectionPool.query(
        "UPDATE accounts SET account_balance = account_balance - $1, updated_at = NOW() WHERE account_id = $2 AND user_id = $3",
        [transactionAmount, accountId, userId]
      );
    }

    const currentTransactionDate = transactionDate || new Date();

    await connectionPool.query(
      `INSERT INTO transactions (user_id, account_id, category_id, transaction_amount, transaction_date, transaction_note, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        userId,
        accountId,
        categoryId || null,
        transactionAmount,
        currentTransactionDate,
        transactionNote,
      ]
    );

    res.status(200).json({ message: "Transaction added successfully" });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({
      message: "Failed to add transaction because of database connection",
    });
  }
}

export async function getTransactionsAndSummary(
  req: Request,
  res: Response
): Promise<void> {
  const {
    month,
    year,
    account,
    category,
    limit = 10,
    page = 1,
    summary,
  } = req.query;

  try {
    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (month) {
      whereConditions.push(
        `TO_CHAR(transaction_date, 'YYYY-MM') = $${paramIndex}`
      );
      queryParams.push(month);
      paramIndex++;
    }

    if (year) {
      whereConditions.push(
        `TO_CHAR(transaction_date, 'YYYY') = $${paramIndex}`
      );
      queryParams.push(year);
      paramIndex++;
    }

    if (account) {
      whereConditions.push(`account_id = $${paramIndex}`);
      queryParams.push(Number(account));
      paramIndex++;
    }

    if (category) {
      whereConditions.push(`category_id = $${paramIndex}`);
      queryParams.push(Number(category));
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    if (summary === "true") {
      const summaryQuery = `
        SELECT 
          SUM(transaction_amount) AS total_spent
        FROM transactions
        ${whereClause};
      `;

      const summaryResult = await connectionPool.query(
        summaryQuery,
        queryParams
      );

      res.status(200).json({
        message: "Transaction summary fetched successfully",
        data: {
          total_spent: summaryResult.rows[0]?.total_spent || 0,
        },
      });
      return;
    }

    const offset = (Number(page) - 1) * Number(limit);
    queryParams.push(Number(limit), offset);

    const transactionQuery = `
      SELECT 
        TO_CHAR(transaction_date, 'YYYY-MM') AS transaction_month,
        TO_CHAR(transaction_date, 'YYYY') AS transaction_year,
        account_id,
        category_id,
        transaction_amount,
        transaction_note
      FROM transactions
      ${whereClause}
      GROUP BY 
        transaction_month, transaction_year, account_id, category_id, transaction_amount, transaction_note
      ORDER BY 
        transaction_year DESC, transaction_month DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    const transactionResult = await connectionPool.query(
      transactionQuery,
      queryParams
    );

    res.status(200).json({
      message: "Transactions fetched successfully",
      data: transactionResult.rows,
      pagination: {
        total: transactionResult.rowCount,
        limit: Number(limit),
        page: Number(page),
      },
    });
    return;
  } catch (error) {
    console.error("Error fetching transactions and summary:", error);
    res.status(500).json({
      message: "Failed to fetch transactions and summary",
    });
  }
}
