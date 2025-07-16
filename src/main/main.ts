import { AppInitializer } from "./app/app-initializer";

const appInitializer = new AppInitializer();
appInitializer.initialize().catch(console.error);
