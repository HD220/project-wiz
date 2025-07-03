import { UserCircle, UploadCloud } from "lucide-react";
import React from "react";
import { UseFormReturn } from "react-hook-form";


import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProfileFormData } from "@/ui/app/app/settings/profile";

interface UserProfileAvatarProps {
  currentAvatar: string | null;
  form: UseFormReturn<ProfileFormData>;
}

export function UserProfileAvatar({ currentAvatar, form }: UserProfileAvatarProps) {
  return (
    <div className="flex flex-col items-center space-y-3">
      <Avatar className="h-24 w-24 ring-2 ring-offset-2 dark:ring-offset-slate-900 ring-sky-500">
        <AvatarImage
          src={currentAvatar || undefined}
          alt={form.watch("displayName")}
        />
        <AvatarFallback className="text-3xl">
          {form.watch("displayName")?.substring(0, 1).toUpperCase() || (
            <UserCircle size={40} />
          )}
        </AvatarFallback>
      </Avatar>
      <Button variant="outline" size="sm" className="relative">
        <UploadCloud className="mr-2 h-4 w-4" />
        Alterar Avatar (Não implementado)
      </Button>
    </div>
  );
}
