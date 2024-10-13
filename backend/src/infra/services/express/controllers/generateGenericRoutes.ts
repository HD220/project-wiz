import { IUseCase } from "@/application/interfaces/IUseCase";
import { Router } from "express";
import { GenericController } from "./GenericController";

export function generateGenericRoutes<Entitie>(
  basePath: string,
  useCase: IUseCase<Entitie>
) {
  const router = Router();
  const controller = new GenericController<Entitie>(useCase);

  router.post(`${basePath}`, async (req, res) => {
    await controller.save(req, res);
  });

  router.put(`${basePath}/:key`, async (req, res) => {
    await controller.save(req, res);
  });

  router.patch(`${basePath}/:key`, async (req, res) => {
    await controller.save(req, res);
  });

  router.delete(`${basePath}/:key`, async (req, res) => {
    await controller.delete(req, res);
  });

  router.get(`${basePath}/:key?`, async (req, res) => {
    await controller.find(req, res);
  });

  return router;
}
