// src/infrastructure/ipc-services/ipc-persona-repository.ts
import { IPersonaRepository } from '../../core/ports/repositories/persona.interface';
import { Result, ok, error } from '../../shared/result';
import { DomainError } from '../../core/common/errors';

// --- Placeholder / Assumed Persona structure ---
// These would normally be imported from their actual definition files.
// If the real Persona is different, this stub and rehydratePersona will need updates.

// Assume PersonaId is a simple string wrapper for now
class AssumedPersonaId {
    constructor(private value: string) {}
    getValue(): string { return this.value; }
    static create(id: string): AssumedPersonaId { return new AssumedPersonaId(id); }
}

interface AssumedPersonaProps {
    id: AssumedPersonaId; // Assuming 'id' is part of props for IRepository compatibility
    name: string;
    description: string;
    systemPrompt: string;
    // other fields...
}

// Assume Persona class/interface based on AssumedPersonaProps
interface AssumedPersona {
    id: () => AssumedPersonaId;
    getProps: () => AssumedPersonaProps; // For toPlainObject behavior
    // other methods...
}

// Placeholder for the actual Persona constructor/factory
function createAssumedPersona(props: AssumedPersonaProps): AssumedPersona {
    return {
        id: () => props.id,
        getProps: () => props,
    };
}
// --- End Placeholder ---


// Placeholder for sendRequestToMain and rehydratePersona
declare function sendRequestToMain<T_REQ_PAYLOAD, T_RES_DATA>(type: string, payload: T_REQ_PAYLOAD): Promise<T_RES_DATA>;

// Assume rehydratePersona will take plain data and return an AssumedPersona instance
declare function rehydratePersona(plainPersonaData: any): AssumedPersona;

export class IPCPersonaRepository implements IPersonaRepository {
    async create(props: Omit<AssumedPersonaProps, "id">): Promise<Result<AssumedPersona>> {
        try {
            // The main process would assign an ID. Here, we send props without ID.
            const responseData = await sendRequestToMain<Omit<AssumedPersonaProps, "id">, any>('PERSONA_REPO_CREATE', props);
            if (!responseData) {
                return error(new DomainError("IPCPersonaRepository: Failed to create persona, no response data."));
            }
            return ok(rehydratePersona(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCPersonaRepository.create failed: ${err.message}`));
        }
    }

    async load(id: AssumedPersonaId): Promise<Result<AssumedPersona | null>> {
        try {
            const responseData = await sendRequestToMain<{ id: string }, any>('PERSONA_REPO_LOAD', { id: id.getValue() });
            if (!responseData) {
                return ok(null);
            }
            return ok(rehydratePersona(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCPersonaRepository.load failed for ID ${id.getValue()}: ${err.message}`));
        }
    }

    async save(persona: AssumedPersona): Promise<Result<AssumedPersona>> {
        try {
            const plainPersona = persona.getProps(); // Assumes getProps() returns something serializable
            const responseData = await sendRequestToMain<{ personaData: any }, any>('PERSONA_REPO_SAVE', { personaData: plainPersona });
            if (!responseData) {
                 return error(new DomainError(`IPCPersonaRepository: Failed to save persona ${persona.id().getValue()}, no confirmation data.`));
            }
            return ok(rehydratePersona(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCPersonaRepository.save failed for persona ${persona.id().getValue()}: ${err.message}`));
        }
    }

    async list(): Promise<Result<AssumedPersona[]>> {
        try {
            const responseData = await sendRequestToMain<void, any[]>('PERSONA_REPO_LIST', undefined);
            if (!responseData) {
                return error(new DomainError("IPCPersonaRepository.list: No response data."));
            }
            return ok(responseData.map(rehydratePersona));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCPersonaRepository.list failed: ${err.message}`));
        }
    }

    async delete(id: AssumedPersonaId): Promise<Result<void>> {
        try {
            await sendRequestToMain<{ id: string }, void>('PERSONA_REPO_DELETE', { id: id.getValue() });
            return ok(undefined);
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCPersonaRepository.delete failed for ID ${id.getValue()}: ${err.message}`));
        }
    }
}
