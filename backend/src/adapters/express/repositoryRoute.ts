// adapters/express/exampleRouter.ts
import { Router } from "express";

const router = Router();

// Example GET endpoint
router.get("/github/projects", (req, res) => {
  res.json({ message: "Lista de repositório cadastrados." });
});

router.get("/github/project/:id", (req, res) => {
  const { id } = req.params;
  res.json({ message: `busca pelo repositorio ${id}` });
});

router.post("/github/project", (req, res) => {
  res.json({ message: `insere/atualiza repositório` });
});

export { router as repositoryRoute };
