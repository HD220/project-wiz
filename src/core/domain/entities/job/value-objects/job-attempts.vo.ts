export class JobAttempts {
    public readonly current: number;
    public readonly max: number;

    private constructor(current: number, max: number) {
        if (current < 0 || max < 1 || current > max) {
            throw new Error("Invalid attempt counts.");
        }
        this.current = current;
        this.max = max;
    }

    public static create(current: number = 0, max: number = 3): JobAttempts {
        return new JobAttempts(current, max);
    }

    public increment(): JobAttempts {
        if (this.canRetry()) {
            return new JobAttempts(this.current + 1, this.max);
        }
        return this; // Or throw error
    }

    public canRetry(): boolean {
        return this.current < this.max;
    }

    public equals(other: JobAttempts): boolean {
        return this.current === other.current && this.max === other.max;
    }
}
