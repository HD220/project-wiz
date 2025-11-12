/**
 * TypeScript bindings for Tauri Rust commands
 */

import { invoke } from "@tauri-apps/api/core";

// ============================================================================
// Types - Match Rust structs
// ============================================================================

export type User = {
  id: string;
  email: string | null;
  password_hash: string | null;
  name: string;
  avatar_url: string | null;
  user_type: "human" | "agent";
  status: "online" | "away" | "busy" | "offline";
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

// ============================================================================
// Auth Commands
// ============================================================================

export async function register(input: RegisterInput): Promise<AuthResponse> {
  return invoke<AuthResponse>("register", { input });
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return invoke<AuthResponse>("login", { email, password });
}

export async function getCurrentUser(token: string): Promise<User> {
  return invoke<User>("get_current_user", { token });
}

export async function logout(token: string): Promise<void> {
  return invoke<void>("logout", { token });
}

// ============================================================================
// Test command (from template)
// ============================================================================

export async function greet(name: string): Promise<string> {
  return invoke<string>("greet", { name });
}
