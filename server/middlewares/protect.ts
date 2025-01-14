import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function protect(req: Request, res: Response, next: NextFunction): void {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Access token required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    req.body.userId = decoded.userId;

    next();
  } catch (error) {
    console.log("Invalid token from middleware");
    res.status(404).json({ message: "Invalid token" });
  }
}
