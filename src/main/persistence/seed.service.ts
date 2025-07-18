export class SeedService {
  constructor() {
    // Domain-based architecture uses direct functions instead of repositories
  }

  async seedDefaultAgents(): Promise<void> {
    // Domain-based architecture handles seeding through domain functions
    console.log("Seeding handled by domain functions");
  }

  async runAllSeeds(): Promise<void> {
    // Domain-based architecture handles seeding through domain functions
    console.log("All seeds handled by domain functions");
  }
}
