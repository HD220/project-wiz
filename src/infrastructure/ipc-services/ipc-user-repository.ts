// src/infrastructure/ipc-services/ipc-user-repository.ts
import { IUserRepository } from '../../core/ports/repositories/user.interface'; // Adjust path as necessary
import { Result, ok, error } from '../../shared/result';
import { DomainError } from '../../core/common/errors';

// --- Placeholder / Assumed User structure ---
// These would normally be imported from their actual definition files.
// If the real User entity is different, this stub and rehydrateUser will need updates.

// Assume UserId VO exists and has getValue(), static create()
class AssumedUserId {
    constructor(private value: string) {}
    getValue(): string { return this.value; }
    static create(id: string): AssumedUserId { return new AssumedUserId(id); }
}

// Assume UserProps interface exists for User entity
interface AssumedUserProps {
    id: AssumedUserId;
    username: string; // Placeholder, should use AssumedUserUsername VO if it exists
    email: string;    // Placeholder, should use AssumedUserEmail VO if it exists
    // other fields...
}

// Assume User interface/class for the entity
interface AssumedUser {
    id: () => AssumedUserId;
    getProps: () => AssumedUserProps; // For toPlainObject behavior, or a direct toPlainObject()
    // other methods...
}

// Placeholder for the actual User constructor/factory
function createAssumedUser(props: AssumedUserProps): AssumedUser {
    return {
        id: () => props.id,
        getProps: () => props,
    };
}
// --- End Placeholder ---

// Placeholder for sendRequestToMain and rehydrateUser
declare function sendRequestToMain<T_REQ_PAYLOAD, T_RES_DATA>(type: string, payload: T_REQ_PAYLOAD): Promise<T_RES_DATA>;
declare function rehydrateUser(plainUserData: any): AssumedUser;

export class IPCUserRepository implements IUserRepository {
    async create(props: Omit<AssumedUserProps, "id">): Promise<Result<AssumedUser>> {
        try {
            const responseData = await sendRequestToMain<Omit<AssumedUserProps, "id">, any>('USER_REPO_CREATE', props);
            if (!responseData) {
                return error(new DomainError("IPCUserRepository: Failed to create user, no response data."));
            }
            return ok(rehydrateUser(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCUserRepository.create failed: ${err.message}`));
        }
    }

    async load(id: AssumedUserId): Promise<Result<AssumedUser | null>> {
        try {
            const responseData = await sendRequestToMain<{ id: string }, any>('USER_REPO_LOAD', { id: id.getValue() });
            if (!responseData) {
                return ok(null);
            }
            return ok(rehydrateUser(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCUserRepository.load failed for ID ${id.getValue()}: ${err.message}`));
        }
    }

    async save(user: AssumedUser): Promise<Result<AssumedUser>> {
        try {
            const plainUser = user.getProps();
            const responseData = await sendRequestToMain<{ userData: any }, any>('USER_REPO_SAVE', { userData: plainUser });
            if (!responseData) {
                return error(new DomainError(`IPCUserRepository: Failed to save user ${user.id().getValue()}, no confirmation data.`));
            }
            return ok(rehydrateUser(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCUserRepository.save failed for user ${user.id().getValue()}: ${err.message}`));
        }
    }

    async list(): Promise<Result<AssumedUser[]>> {
        try {
            const responseData = await sendRequestToMain<void, any[]>('USER_REPO_LIST', undefined);
            if (!responseData) {
                return error(new DomainError("IPCUserRepository.list: No response data."));
            }
            return ok(responseData.map(rehydrateUser));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCUserRepository.list failed: ${err.message}`));
        }
    }

    async delete(id: AssumedUserId): Promise<Result<void>> {
        try {
            await sendRequestToMain<{ id: string }, void>('USER_REPO_DELETE', { id: id.getValue() });
            return ok(undefined);
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCUserRepository.delete failed for ID ${id.getValue()}: ${err.message}`));
        }
    }
}
