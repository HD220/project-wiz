import React, { useState } from "react";
import { AuthService } from "../../../core/services/auth";

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setSuccessMessage(null);

    if (!username || !password) {
      setRegisterError("Usuário e senha são obrigatórios.");
      return;
    }

    setIsLoading(true);
    try {
      const authService = new AuthService();
      const response = await authService.registrar({ username, password });
      if (response.success) {
        setSuccessMessage(
          response.message || "Usuário registrado com sucesso!"
        );
      } else {
        setRegisterError(response.message || "Erro ao registrar usuário.");
      }
    } catch (err: any) {
      setRegisterError(err.message || "Erro ao registrar usuário.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {registerError && <p className="error">{registerError}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
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
        {isLoading ? "Carregando..." : "Registrar"}
      </button>
    </form>
  );
};

export default RegisterForm;
