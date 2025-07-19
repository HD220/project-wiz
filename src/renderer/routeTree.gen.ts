import { Route as rootRoute } from "./app/__root";
import { Route as IndexRoute } from "./app/index";

const routeTree = rootRoute.addChildren([IndexRoute]);

export { routeTree };
