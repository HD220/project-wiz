import { serverExpress } from "@/infra/services/express";
import router from "@/infra/services/express/routes";

const api = serverExpress(router);
api.start();
