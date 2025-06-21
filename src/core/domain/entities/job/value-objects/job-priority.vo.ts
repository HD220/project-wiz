export class JobPriority {
    private readonly value: number; // Lower number means higher priority
    private constructor(priority: number) {
        if (!Number.isInteger(priority) || priority < 0) { // Example validation
            throw new Error("Job priority must be a non-negative integer.");
        }
        this.value = priority;
    }
    public static create(priority: number): JobPriority { return new JobPriority(priority); }
    public getValue(): number { return this.value; }
    public equals(other: JobPriority): boolean { return this.value === other.getValue(); }
}
