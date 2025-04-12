import React, { useState } from "react";
import { useAuthContext } from "./AuthProvider";

export const RegisterForm: React.FC = () => {
  const { register, login } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);
    if (password !== confirm) {
      setFormError("As senhas não coincidem");
      return;
    }
    setSubmitting(true);
    try {
      await register(email, password);
      await login(email, password);
      setSuccess(true);
    } catch (err: any) {
      setFormError(err.message || "Falha no registro");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Registrar</h2>
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
        autoComplete="new-password"
      />
      <input
        type="password"
        placeholder="Confirme a senha"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        autoComplete="new-password"
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "Registrando..." : "Registrar"}
      </button>
      {formError && <div style={{ color: "red" }}>{formError}</div>}
      {success && <div style={{ color: "green" }}>Registro realizado com sucesso!</div>}
    </form>
  );
};