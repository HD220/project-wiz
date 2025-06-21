export class JobName {
    private readonly value: string;
    private constructor(name: string) {
        if (name.length === 0 || name.length > 255) { // Example validation
            throw new Error("Job name must be between 1 and 255 characters.");
        }
        this.value = name;
    }
    public static create(name: string): JobName { return new JobName(name); }
    public getValue(): string { return this.value; }
    public equals(other: JobName): boolean { return this.value === other.getValue(); }
}
