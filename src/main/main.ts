import { app, dialog } from "electron";
import { AppInitializer } from "./app/app-initializer";
import { logger } from "./logger";

// Global error handlers
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);

  // Show error dialog to user
  dialog.showErrorBox(
    "Unexpected Error",
    `An unexpected error occurred: ${error.message}\n\nThe application will now exit.`,
  );

  // Gracefully exit
  app.quit();
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Promise Rejection:", { reason, promise });

  // Don't exit on unhandled rejections, but log them
  dialog.showErrorBox(
    "Unhandled Error",
    `An unhandled error occurred: ${reason}\n\nPlease restart the application if you experience issues.`,
  );
});

// Application startup
async function startApplication() {
  try {
    logger.info("Starting Project Wiz application...");

    const appInitializer = new AppInitializer();
    await appInitializer.initialize();

    logger.info("Application started successfully");
  } catch (error) {
    logger.error("Failed to initialize application:", error);

    // Show error dialog
    dialog.showErrorBox(
      "Startup Error",
      `Failed to start the application: ${error instanceof Error ? error.message : "Unknown error"}\n\nPlease check the logs for more details.`,
    );

    // Exit with error code
    app.exit(1);
  }
}

// Handle app ready event
app.whenReady().then(() => {
  startApplication();
});

// Handle all windows closed
app.on("window-all-closed", () => {
  logger.info("All windows closed");

  // On macOS, keep app running unless explicitly quit
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Handle app activation (macOS)
app.on("activate", () => {
  logger.info("App activated");

  // Re-create window if needed on macOS
  if (process.platform === "darwin") {
    const { BrowserWindow } = require("electron");
    if (BrowserWindow.getAllWindows().length === 0) {
      startApplication();
    }
  }
});

// Handle before quit
app.on("before-quit", (event) => {
  logger.info("Application is about to quit");

  // Perform cleanup if needed
  // You can prevent quit by calling event.preventDefault()
});

// Handle will quit
app.on("will-quit", (event) => {
  logger.info("Application will quit");

  // Last chance to prevent quit or perform cleanup
});
