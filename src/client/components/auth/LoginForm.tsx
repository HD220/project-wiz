import React, { useState } from "react";
import { useAuthContext } from "./AuthProvider";

export const LoginForm: React.FC = () => {
  const { loginWithOAuth, loginWithToken, logout, isAuthenticated, token, loading } = useAuthContext();
  const [manualToken, setManualToken] = useState("");

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Autenticado ({token?.type})</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={loginWithOAuth}>Login com GitHub OAuth</button>
          <div>
            <input
              type="text"
              placeholder="Cole seu token GitHub"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
            />
            <button onClick={() => loginWithToken(manualToken)}>Login com Token</button>
          </div>
        </div>
      )}
    </div>
  );
};