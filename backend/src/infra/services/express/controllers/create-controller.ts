import {
  IUseCase,
  InputType,
  OutputType,
  PrimitivesTypes,
} from "@/application/interfaces/IUseCase";
import { Handler, Router } from "express";

export function createController<
  Input extends InputType<PrimitivesTypes>,
  Output extends OutputType<PrimitivesTypes>,
>(
  method: "POST" | "GET" | "DELETE",
  useCase: IUseCase<Input, Output>,
  path: string = ""
) {
  const router = Router();

  const GET: Handler = async (req, res) => {
    const params = req.params as unknown as Input;

    const result = await useCase.execute(params);

    res.status(200).json({
      data: result,
    });
  };

  const POST: Handler = async (req, res) => {
    const data = Object.assign(req.params, req.body);
    const result = await useCase.execute(data);

    res.status(200).json({
      data: result,
    });
  };

  const DELETE: Handler = async (req, res) => {
    const params = req.params as unknown as Input;

    const result = await useCase.execute(params);

    res.status(200).json({
      data: result,
    });
  };

  switch (method) {
    case "GET":
      router.get(path, GET);
      break;
    case "POST":
      router.post(path, POST);
      break;
    case "DELETE":
      router.delete(path, DELETE);
      break;

    default:
      throw new Error("Método não implementado!");
  }

  return router;
}
