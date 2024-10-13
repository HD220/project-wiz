import express, { Router } from "express";
import bodyParser from "body-parser";
import { Server } from "http";

export function serverExpress(routes: Router) {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(bodyParser.json());
  app.use(routes);

  let listener: Server | undefined;

  return {
    start: () => {
      listener = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    },
    shutdown: () => {
      listener?.close(() => {});
    },
  };
}
