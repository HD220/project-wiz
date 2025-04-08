import React, { useState } from "react";
import { useAuth } from "../../hooks/use-auth";

const LoginForm: React.FC = () => {
  const { login, error, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!username || !password) {
      setLoginError("Usuário e senha são obrigatórios.");
      return;
    }

    try {
      await login({ username, password });
    } catch (err: any) {
      setLoginError(err.message || "Erro ao fazer login.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {loginError && <p className="error">{loginError}</p>}
      {error && <p className="error">{error}</p>}
      <div>
        <label htmlFor="username">Usuário:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">Senha:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Carregando..." : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;
