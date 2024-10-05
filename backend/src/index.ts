import { serverExpress } from "@/infra/services/express";

import { repositoryRoute } from "@/adapters/express/repositoryRoute";

const api = serverExpress([repositoryRoute]);
api.start();
