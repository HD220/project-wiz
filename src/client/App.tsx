import { useState } from "react";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";

import { ThemeProvider } from "./components/providers/theme.tsx";
import { Button } from "./components/ui/button";
import { ModeToggle } from "./components/mode-toggle";

function App() {
  const [count, setCount] = useState(0);
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <I18nProvider i18n={i18n}>
        <div>
          <a href="https://vite.dev" target="_blank" className="">
            {/* <img src={viteLogo} className="logo" alt="Vite logo" /> */}
          </a>
          <a href="https://react.dev" target="_blank">
            {/* <img src={reactLogo} className="logo react" alt="React logo" /> */}
          </a>
        </div>
        <h1>Vite + React</h1>
        <div>
          <Button
            variant={"default"}
            onClick={() => setCount((count) => count + 1)}
          >
            count is {count}
          </Button>
          <ModeToggle />
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
