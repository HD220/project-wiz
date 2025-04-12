import React, { useState } from "react";
import { useAuthContext } from "./AuthProvider";

export const LoginForm: React.FC = () => {
  const { login, logout, isAuthenticated, loading, error, user } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div>Carregando...</div>;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setFormError(err.message || "Falha no login");
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div>
        <p>Bem-vindo, {user?.email}!</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="username"
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "Entrando..." : "Entrar"}
      </button>
      {formError && <div style={{ color: "red" }}>{formError}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
};