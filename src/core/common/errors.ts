export class AppError extends Error {
    constructor(public readonly message: string, public readonly stack?: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class DomainError extends AppError {}
export class ApplicationError extends AppError {}
export class UseCaseError extends AppError {}
export class InfraError extends AppError {}