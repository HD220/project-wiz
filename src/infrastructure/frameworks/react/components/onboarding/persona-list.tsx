import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { personasPlaceholder } from "@/lib/placeholders"; // To be created in placeholders.ts
import { Trans, t } from "@lingui/macro";

// Type for a single persona (assuming structure from original file)
export type Persona = {
  id: string;
  name: string;
  description: string;
  avatar: string;
  gender: "masculino" | "feminino";
  color: string;
};

interface PersonaListProps {
  onSelectPersona?: (personaId: string | null) => void;
}

// getColorClass function (copied from original)
const getColorClass = (color: string, isSelected: boolean) => {
  const colorMap: Record<string, string> = {
    blue: isSelected ? "border-blue-500" : "hover:border-blue-300",
    green: isSelected ? "border-green-500 " : "hover:border-green-300",
    amber: isSelected ? "border-amber-500 " : "hover:border-amber-300",
    purple: isSelected ? "border-purple-500" : "hover:border-purple-300",
    pink: isSelected ? "border-pink-500 " : "hover:border-pink-300",
    rose: isSelected ? "border-rose-500 " : "hover:border-rose-300",
  };
  return (
    colorMap[color] ||
    (isSelected ? "border-primary" : "hover:border-primary/50")
  );
};

export function PersonaList({ onSelectPersona }: PersonaListProps) {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const personas = personasPlaceholder; // Use placeholder
  const radioGroupRef = useRef<HTMLDivElement>(null);

  // Function to handle selection and focus
  const selectAndFocusPersona = useCallback((personaId: string) => {
    setSelectedPersona(personaId);
    if (onSelectPersona) {
      onSelectPersona(personaId);
    }
    // Focus the newly selected radio item
    const currentRadio = radioGroupRef.current?.querySelector(`[role="radio"][data-id="${personaId}"]`) as HTMLElement | null;
    currentRadio?.focus();
  }, [onSelectPersona]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (!radioGroupRef.current) return;

    const radios = Array.from(
      radioGroupRef.current.querySelectorAll<HTMLElement>('[role="radio"]')
    );
    if (radios.length === 0) return;

    const currentIndex = radios.findIndex(
      (radio) => radio.getAttribute("data-id") === selectedPersona
    );

    let nextIndex = -1;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        nextIndex = currentIndex >= 0 ? (currentIndex + 1) % radios.length : 0;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        nextIndex = currentIndex > 0 ? (currentIndex - 1 + radios.length) % radios.length : radios.length - 1;
        break;
      default:
        return;
    }

    if (nextIndex !== -1) {
      const nextPersonaId = radios[nextIndex].getAttribute("data-id");
      if (nextPersonaId) {
        selectAndFocusPersona(nextPersonaId);
      }
    }
  }, [selectedPersona, selectAndFocusPersona, radioGroupRef]);

  return (
    <Card>
      <CardHeader>
        <CardTitle><Trans>Personalidade do Assistente</Trans></CardTitle>
        <CardDescription><Trans>Escolha uma persona para seu assistente. Você pode personalizar ou
          alterar isso mais tarde.</Trans></CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={radioGroupRef}
          role="radiogroup"
          aria-label={t`Escolha a personalidade do assistente`}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          onKeyDown={handleKeyDown}
        >
          {/* Coluna de personas masculinas */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium"><Trans>Personas Masculinas</Trans></h3>
            <div className="space-y-4">
              {personas
                .filter((persona) => persona.gender === "masculino")
                .map((persona) => ( // Removed index, arr from map as per simplified tabIndex logic for now
                  <div
                    key={persona.id}
                    data-id={persona.id} // Add data-id for querying
                    role="radio"
                    aria-checked={selectedPersona === persona.id}
                    // Manage tabIndex: only the selected one is in tab order, or first if none selected.
                    tabIndex={selectedPersona === persona.id || (selectedPersona === null && persona.id === personas[0]?.id) ? 0 : -1}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all min-h-[124px] select-none
                     ${getColorClass(
                       persona.color,
                       selectedPersona === persona.id
                     )}`}
                    onClick={() => selectAndFocusPersona(persona.id)}
                    // Add onFocus to ensure roving tabindex works if user clicks to focus then uses arrows
                    onFocus={() => {
                        // If not selected, clicking or focusing should select it for arrow keys to work from it
                        // This might be too aggressive if only focus is intended.
                        // For now, onClick handles selection. Focus is for keyboard.
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 rounded-full overflow-hidden shadow-md">
                          <img
                            src={persona.avatar || "/placeholder.svg"}
                            alt={t({ id: "personaList.avatarAlt", message: `Avatar de ${persona.name}`, values: { name: persona.name }})}
                            width={80}
                            height={80}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{persona.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {persona.description}
                        </p>
                      </div>
                      {selectedPersona === persona.id && (
                        <div className="absolute right-4 top-4 h-5 w-5 text-primary">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Coluna de personas femininas */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium"><Trans>Personas Femininas</Trans></h3>
            <div className="space-y-4">
              {personas
                .filter((persona) => persona.gender === "feminino")
                .map((persona) => ( // Removed index, arr from map
                  <div
                    key={persona.id}
                    data-id={persona.id} // Add data-id for querying
                    role="radio"
                    aria-checked={selectedPersona === persona.id}
                     // Manage tabIndex (only selected one or first overall if none selected)
                    tabIndex={selectedPersona === persona.id || (selectedPersona === null && !personas.some(p => p.gender === "masculino") && persona.id === personas.find(p=>p.gender === "feminino")?.id ) ? 0 : -1}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all min-h-[124px] select-none
                    ${getColorClass(
                      persona.color,
                      selectedPersona === persona.id
                    )}`}
                    onClick={() => selectAndFocusPersona(persona.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 rounded-full overflow-hidden shadow-md">
                          <img
                            src={persona.avatar || "/placeholder.svg"}
                            alt={t({ id: "personaList.avatarAlt", message: `Avatar de ${persona.name}`, values: { name: persona.name }})}
                            width={80}
                            height={80}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{persona.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {persona.description}
                        </p>
                      </div>
                      {selectedPersona === persona.id && (
                        <div className="absolute right-4 top-4 h-5 w-5 text-primary">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground"><Trans>Você pode alterar ou personalizar essas configurações a qualquer
          momento no menu de preferências.</Trans></p>
      </CardFooter>
    </Card>
  );
}
