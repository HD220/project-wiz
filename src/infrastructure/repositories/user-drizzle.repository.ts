// src/infrastructure/repositories/user-drizzle.repository.ts
import { Result, ok, error } from '@/shared/result';
import { IUserRepository } from '@/core/ports/repositories/user.interface';
import { User, UserConstructor } from '@/core/domain/entities/user';
import {
    UserId,
    UserNickname,
    UserUsername,
    UserEmail,
    UserAvatar
} from '@/core/domain/entities/user/value-objects';
import { LLMProviderConfigId } from '@/core/domain/entities/llm-provider-config/value-objects';
import { AgentId } from '@/core/domain/entities/agent/value-objects';
import { usersTable, UserDbInsert, UserDbSelect } from '../services/drizzle/schemas/users';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { DomainError } from '@/core/common/errors';

// Define a type for the schema that the db instance will expect
type DBSchema = { usersTable: typeof usersTable; /* ... other tables ... */ };

export class UserDrizzleRepository implements IUserRepository {
    constructor(private readonly db: BetterSQLite3Database<DBSchema>) {}

    private toEntity(row: UserDbSelect): User {
        const props: UserConstructor = {
            id: UserId.create(row.id),
            nickname: UserNickname.create(row.nickname),
            username: UserUsername.create(row.username),
            email: UserEmail.create(row.email),
            avatar: UserAvatar.create(row.avatarUrl),
            defaultLLMProviderConfigId: LLMProviderConfigId.create(row.defaultLLMProviderConfigId),
            assistantId: row.assistantId ? AgentId.create(row.assistantId) : undefined,
            // TODO: Add createdAt/updatedAt if they become part of User entity and schema
        };
        return User.create(props); // Use the static create method of the User entity
    }

    private toPersistence(user: User): UserDbInsert {
        const props = user.getProps();
        return {
            id: user.id().getValue(),
            nickname: props.nickname.getValue(),
            username: props.username.getValue(),
            email: props.email.getValue(),
            avatarUrl: props.avatar.getValue(),
            defaultLLMProviderConfigId: props.defaultLLMProviderConfigId.getValue(),
            assistantId: props.assistantId?.getValue(),
            // TODO: Add createdAt/updatedAt if they become part of User entity and schema
        };
    }

    async save(user: User): Promise<Result<User>> {
        try {
            const data = this.toPersistence(user);
            await this.db.insert(usersTable).values(data)
                .onConflictDoUpdate({ target: usersTable.id, set: data });
            return ok(user);
        } catch (e) {
            console.error("Error saving user:", e);
            return error(new DomainError("Failed to save user.", e instanceof Error ? e : undefined));
        }
    }

    async load(id: UserId): Promise<Result<User | null>> {
        try {
            const results = await this.db.select().from(usersTable)
                .where(eq(usersTable.id, id.getValue()))
                .limit(1);
            if (results.length === 0) {
                return ok(null);
            }
            return ok(this.toEntity(results[0]));
        } catch (e) {
            console.error(`Error loading user ${id.getValue()}:`, e);
            return error(new DomainError("Failed to load user.", e instanceof Error ? e : undefined));
        }
    }

    async findById(id: UserId): Promise<Result<User | null>> {
        return this.load(id);
    }

    async create(props: Omit<UserConstructor, "id" | "username"> & { username?: string } ): Promise<Result<User>> {
        // Username logic (slugify nickname if username not provided) is in CreateUserUseCase.
        // Here, we assume 'props' provides the VOs or data for them.
        // For IRepository.create, it's simpler if it takes near-complete props.
        // User.create already handles ensuring all mandatory fields are there.
        try {
            const idVo = UserId.create(); // Generate new ID

            // Ensure all VOs are created before passing to User.create
            // This is more aligned with how User.create expects its PersonaConstructor
            // If props are already VOs (except id), then spread is fine.
            // If props are primitives, then VOs must be created.
            // The type Omit<UserConstructor, "id"> implies props contains VOs.

            const fullProps: UserConstructor = {
                id: idVo,
                nickname: props.nickname, // UserNickname VO
                username: props.username, // UserUsername VO
                email: props.email,       // UserEmail VO
                avatar: props.avatar,     // UserAvatar VO
                defaultLLMProviderConfigId: props.defaultLLMProviderConfigId, // LLMProviderConfigId VO
                assistantId: props.assistantId, // Optional AgentId VO
            };
            const user = User.create(fullProps);
            return this.save(user);
        } catch (e) {
             console.error("Error creating user via repository:", e);
             return error(new DomainError("Failed to create user via repository.", e instanceof Error ? e : undefined));
        }
    }

    async update(user: User): Promise<Result<User>> {
        return this.save(user);
    }

    async list(): Promise<Result<User[]>> {
        try {
            const results = await this.db.select().from(usersTable).all();
            const users = results.map(row => this.toEntity(row));
            return ok(users);
        } catch (e) {
            console.error("Error listing users:", e);
            return error(new DomainError("Failed to list users.", e instanceof Error ? e : undefined));
        }
    }

    async delete(id: UserId): Promise<Result<void>> {
        try {
            const result = await this.db.delete(usersTable)
                .where(eq(usersTable.id, id.getValue()))
                .returning({ id: usersTable.id });

            if (result.length === 0) {
                 return error(new DomainError(`User with id ${id.getValue()} not found for deletion.`));
            }
            return ok(undefined);
        } catch (e) {
            console.error(`Error deleting user ${id.getValue()}:`, e);
            return error(new DomainError("Failed to delete user.", e instanceof Error ? e : undefined));
        }
    }
}
