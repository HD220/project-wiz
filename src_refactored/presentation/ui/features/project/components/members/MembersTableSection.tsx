import React from "react";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { MemberTableRow } from "./MemberTableRow";

interface Member {
  id: string;
  name: string;
  email?: string;
  role: "Admin" | "Membro" | "Editor" | "Visualizador";
  avatarUrl?: string;
  type: "human" | "agent";
  agentPersona?: string;
}

interface MembersTableSectionProps {
  members: Member[];
}

export function MembersTableSection({ members }: MembersTableSectionProps) {
  return (
    <>
      <h3 className="text-lg font-medium mb-3">Lista de Participantes</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Nome / Agente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Papel no Projeto</TableHead>
            <TableHead>Email / Persona</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <MemberTableRow key={member.id} member={member} />
          ))}
        </TableBody>
      </Table>
      {members.length === 0 && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-6">
          Nenhum membro ou agente neste projeto ainda.
        </p>
      )}
    </>
  );
}
