import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectionPool from "../utils/db";

interface UserParams {
  userId: string;
}

const JWT_SECRET = process.env.JWT_SECRET;

export async function register(req: Request, res: Response): Promise<void> {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ message: "All fields are required" });
  }

  const checkEmailUsed = await connectionPool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (checkEmailUsed.rows.length > 0) {
    res.status(400).json({ message: "Email already exists" });
  }

  try {
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    await connectionPool.query(
      "INSERT INTO users (username, email, password) VALUES ($1,$2,$3)",
      [username, email, hashedPassword]
    );

    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server could not connect database" });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "All feild are required" });
  }
  try {
    const isUser = await connectionPool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (isUser.rowCount === 0) {
      res.status(400).json({ message: "Email not found" });
    }

    const user = isUser.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(400).json({ message: "Password not valid" });
    }

    const token = jwt.sign({ userId: user.user_id }, JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successfully", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server could not connect database" });
  }
}

export async function getUserById(req: Request<UserParams>, res: Response) {
  const { userId } = req.params;
  try {
    const result = await connectionPool.query(
      "SELECT user_id, username, email, created_at FROM users WHERE user_id = $1",
      [userId]
    );

    if (result.rowCount === 0) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ data: result.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server could not connect database" });
  }
}
