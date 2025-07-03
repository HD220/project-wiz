import { Mail, ShieldCheck, Bot as BotIcon, Trash2 } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";

interface Member {
  id: string;
  name: string;
  email?: string;
  role: "Admin" | "Membro" | "Editor" | "Visualizador";
  avatarUrl?: string;
  type: "human" | "agent";
  agentPersona?: string;
}

interface MemberTableRowProps {
  member: Member;
}

export function MemberTableRow({ member }: MemberTableRowProps) {
  return (
    <TableRow key={member.id}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7 text-xs">
            {member.avatarUrl && (
              <AvatarImage src={member.avatarUrl} alt={member.name} />
            )}
            <AvatarFallback
              className={
                member.type === "agent"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700"
              }
            >
              {member.type === "agent" ? (
                <BotIcon size={14} />
              ) : (
                member.name.substring(0, 1).toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>
          {member.name}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant={member.type === "agent" ? "default" : "secondary"}
          className={
            member.type === "agent" ? "bg-emerald-600 dark:bg-emerald-500" : ""
          }
        >
          {member.type === "human" ? "Humano" : "Agente IA"}
        </Badge>
      </TableCell>
      <TableCell>{member.role}</TableCell>
      <TableCell className="text-xs text-slate-500 dark:text-slate-400">
        {member.type === "human"
          ? member.email
          : `Persona: ${member.agentPersona}`}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <ShieldCheck className="mr-2 h-3.5 w-3.5" /> Alterar Papel (N/I)
            </DropdownMenuItem>
            {member.type === "human" && member.email && (
              <DropdownMenuItem
                onClick={() => alert(`Enviar email para ${member.email}`)}
              >
                <Mail className="mr-2 h-3.5 w-3.5" /> Enviar Email (N/I)
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-red-500 focus:text-red-500">
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Remover do Projeto (N/I)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
