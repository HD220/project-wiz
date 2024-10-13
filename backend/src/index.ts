import { serverExpress } from "@/infra/services/express";
import routes from "@/infra/services/express/routes";

const api = serverExpress(routes);
api.start();
