import { NextFunction, Request, Response } from "express";
import { ApiError } from "../controllers/types/ApiError";

// Middleware de erro
export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = (err as ApiError).status || 500;
  const message = (err as Error).message || "Internal Server Error";

  res.status(statusCode).json({
    status: "error",
    statusCode: statusCode,
    message: message,
  });
}
