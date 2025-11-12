import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as api from "@/lib/api";

export function AuthTest() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<api.User | null>(null);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleRegister = async () => {
    try {
      setError("");
      setStatus("Registering...");
      const response = await api.register({ name, email, password });
      setToken(response.token);
      setUser(response.user);
      setStatus(`Registered successfully! Token: ${response.token.substring(0, 20)}...`);
    } catch (err) {
      setError(`Registration failed: ${err}`);
      setStatus("");
    }
  };

  const handleLogin = async () => {
    try {
      setError("");
      setStatus("Logging in...");
      const response = await api.login(email, password);
      setToken(response.token);
      setUser(response.user);
      setStatus(`Logged in successfully! Token: ${response.token.substring(0, 20)}...`);
    } catch (err) {
      setError(`Login failed: ${err}`);
      setStatus("");
    }
  };

  const handleGetCurrentUser = async () => {
    if (!token) {
      setError("No token available. Please login first.");
      return;
    }
    try {
      setError("");
      setStatus("Fetching user...");
      const fetchedUser = await api.getCurrentUser(token);
      setUser(fetchedUser);
      setStatus("User fetched successfully!");
    } catch (err) {
      setError(`Failed to fetch user: ${err}`);
      setStatus("");
    }
  };

  const handleLogout = async () => {
    if (!token) {
      setError("No token available.");
      return;
    }
    try {
      setError("");
      setStatus("Logging out...");
      await api.logout(token);
      setToken(null);
      setUser(null);
      setStatus("Logged out successfully!");
    } catch (err) {
      setError(`Logout failed: ${err}`);
      setStatus("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form Inputs */}
        <div className="space-y-2">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleRegister} variant="default">
            Register
          </Button>
          <Button onClick={handleLogin} variant="secondary">
            Login
          </Button>
          <Button onClick={handleGetCurrentUser} variant="outline">
            Get Current User
          </Button>
          <Button onClick={handleLogout} variant="destructive">
            Logout
          </Button>
        </div>

        {/* Status Display */}
        {status && (
          <div className="p-3 rounded-lg bg-secondary text-secondary-foreground text-sm">
            {status}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive text-white text-sm">
            {error}
          </div>
        )}

        {/* User Info Display */}
        {user && (
          <div className="p-4 rounded-lg bg-card border">
            <h3 className="font-semibold mb-2">Current User:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
