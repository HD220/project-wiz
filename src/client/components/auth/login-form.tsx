import React from "react";
import { useAuthContext } from "./auth-provider";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[a-zA-Z]/, "Senha deve conter letras")
    .regex(/[0-9]/, "Senha deve conter números")
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { login, logout, isAuthenticated, loading, error, user } = useAuthContext();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  if (loading) return <div>Loading...</div>;

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      setError("root", {
        message: err.message || "Falha no login"
      });
    }
  };

  if (isAuthenticated) {
    return (
      <div>
        <p>Bem-vindo, {user?.email}!</p>
        <button onClick={logout}>Sair</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        {...register("email")}
        autoComplete="username"
      />
      {errors.email && <div style={{ color: "red" }}>{errors.email.message}</div>}

      <input
        type="password"
        placeholder="Senha"
        {...register("password")}
        autoComplete="current-password"
      />
      {errors.password && <div style={{ color: "red" }}>{errors.password.message}</div>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>

      {errors.root && <div style={{ color: "red" }}>{errors.root.message}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
};