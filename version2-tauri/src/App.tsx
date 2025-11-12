import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthTest } from "@/components/auth-test";
import * as api from "@/lib/api";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    setGreetMsg(await api.greet(name));
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Project Wiz V2</CardTitle>
            <CardDescription>Built with Tauri 2.0 + React 19 + Rust</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name-input" className="text-sm font-medium">
                Enter your name
              </label>
              <Input
                id="name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Type a name..."
              />
            </div>
            <Button onClick={greet} className="w-full">
              Greet from Rust
            </Button>
            {greetMsg && (
              <div className="p-4 rounded-lg bg-secondary text-secondary-foreground">
                {greetMsg}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tech Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>⚡ Vite 7 - Lightning-fast HMR</li>
              <li>⚛️ React 19 - Latest React features</li>
              <li>🦀 Rust 1.89 - Memory-safe backend</li>
              <li>🎨 Tailwind CSS v4 - Utility-first styling</li>
              <li>🎭 shadcn/ui - Beautiful components</li>
              <li>🖥️ Tauri 2.0 - Native desktop platform</li>
              <li>🗄️ SQLite + SQLx - Database with migrations</li>
              <li>🔐 bcrypt - Password hashing</li>
            </ul>
          </CardContent>
        </Card>

        {/* Auth Test Component */}
        <AuthTest />
      </div>
    </div>
  );
}

export default App;
