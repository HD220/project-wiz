import React from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";

interface Step1Props {
  personaName: string;
  setPersonaName: (name: string) => void;
  personaDescription: string;
  setPersonaDescription: (description: string) => void;
  handleNext: () => void;
}

export function Step1({
  personaName,
  setPersonaName,
  personaDescription,
  setPersonaDescription,
  handleNext,
}: Step1Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="personaName">Persona Name</Label>
        <Input
          id="personaName"
          value={personaName}
          onChange={(e) => setPersonaName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="personaDescription">Description</Label>
        <Textarea
          id="personaDescription"
          value={personaDescription}
          onChange={(e) => setPersonaDescription(e.target.value)}
          required
        />
      </div>
      <Button type="button" onClick={handleNext}>
        Next
      </Button>
    </div>
  );
}
