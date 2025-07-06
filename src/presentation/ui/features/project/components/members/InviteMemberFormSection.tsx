import { UserPlus } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InviteMemberFormSectionProps {
  projectId: string;
}

export function InviteMemberFormSection({ projectId }: InviteMemberFormSectionProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const handleInviteMember = (event: React.FormEvent) => {
    event.preventDefault();
    if (inviteEmail.trim()) {
      alert(
        `Convite simulado enviado para: ${inviteEmail} (Projeto ID: ${projectId})`,
      );
      setInviteEmail("");
    }
  };
  return (
    <form
      onSubmit={handleInviteMember}
      className="flex items-center gap-2 mb-6 pb-6 border-b"
    >
      <Input
        type="email"
        placeholder="Email do novo membro ou ID do Agente"
        value={inviteEmail}
        onChange={(event) => setInviteEmail(event.target.value)}
        className="flex-grow"
      />
      <Button type="submit">
        <UserPlus className="mr-2 h-4 w-4" /> Convidar / Adicionar
      </Button>
    </form>
  );
}
