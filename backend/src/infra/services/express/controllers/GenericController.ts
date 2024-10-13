import { Request, Response } from "express";
import { IUseCase } from "@/application/interfaces/IUseCase";
import { ApiError } from "./types/ApiError";

export class GenericController<Entitie> {
  constructor(private useCase: IUseCase<Entitie>) {}

  // Handler para salvar uma nova entidade
  async save(req: Request, res: Response) {
    try {
      const entity = req.body;
      const savedEntity = await this.useCase.save(entity);
      return res.status(201).json(savedEntity);
    } catch (error) {
      if (error instanceof ApiError) {
        const { cause, stack, message, name, status } = error;
        console.error({ cause, stack });
        return res.status(status).json({ error: { message, name } });
      } else if (error instanceof Error) {
        const { message, name, cause, stack } = error;
        console.error({ cause, stack });
        return res.status(400).json({ error: { message, name } });
      }
      return res
        .status(400)
        .json({ error: { name: "Erro desconhecido", message: "" } });
    }
  }

  // Handler para deletar uma entidade por chave primária
  async delete(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const success = await this.useCase.delete(key as Entitie[keyof Entitie]);
      if (success) {
        return res.status(204).send();
      } else {
        return res.status(404).json({ error: "Entity not found" });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const { cause, stack, message, name, status } = error;
        console.error({ cause, stack });
        return res.status(status).json({ error: { message, name } });
      } else if (error instanceof Error) {
        const { message, name, cause, stack } = error;
        console.error({ cause, stack });
        return res.status(400).json({ error: { message, name } });
      }
      return res
        .status(400)
        .json({ error: { name: "Erro desconhecido", message: "" } });
    }
  }

  // Handler para buscar entidades baseadas em critérios
  async find(req: Request, res: Response) {
    try {
      const { key } = req.params;
      if (key) {
        return this.useCase.findByPk(key as Entitie[keyof Entitie]);
      }

      const { page, page_size, ...criteria } = req.query;
      const result = await this.useCase.find(
        criteria as Partial<Entitie>,
        Number(page),
        Number(page_size)
      );
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof ApiError) {
        const { cause, stack, message, name, status } = error;
        console.error({ cause, stack });
        return res.status(status).json({ error: { message, name } });
      } else if (error instanceof Error) {
        const { message, name, cause, stack } = error;
        console.error({ cause, stack });
        return res.status(400).json({ error: { message, name } });
      }
      return res
        .status(400)
        .json({ error: { name: "Erro desconhecido", message: "" } });
    }
  }
}
