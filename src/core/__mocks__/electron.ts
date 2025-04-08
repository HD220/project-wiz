const utilityProcess = {
  fork: jest.fn(() => ({
    postMessage: jest.fn(),
    on: jest.fn(),
    kill: jest.fn(),
  })),
};

const MessageChannelMain = jest.fn(() => ({
  port1: {
    postMessage: jest.fn(),
    on: jest.fn(),
    close: jest.fn(),
    start: jest.fn(),
  },
  port2: {
    postMessage: jest.fn(),
    on: jest.fn(),
    close: jest.fn(),
    start: jest.fn(),
  },
}));

const ipcMain = {  handlers: {} as Record<string, any>,
  handle: jest.fn((event, handler) => {
    console.log('ipcMain.handle called with:', event, handler);
    ipcMain.handlers[event] = handler;
  }),
};

const app = {
  getPath: jest.fn().mockReturnValue('/test/path'),
  whenReady: jest.fn().mockResolvedValue(undefined),
};

const electron = {
  utilityProcess,
  MessageChannelMain,
  ipcMain,
  app,
};

export default electron;