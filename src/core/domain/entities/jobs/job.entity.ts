import { JobStatus } from "./job-status";
import { Result } from "../../../../shared/result";

export abstract class Job {
  protected id: string;
  protected status: JobStatus;
  protected createdAt: Date;
  protected updatedAt: Date;
  protected priority!: number;

  constructor(id: string, status: JobStatus, priority = 0) {
    this.id = id;
    this.status = status;
    this.setPriority(priority);
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public getId(): string {
    return this.id;
  }

  public getStatus(): JobStatus {
    return this.status;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public start(): Result<boolean> {
    if (this.status.moveTo("active")) {
      this.updatedAt = new Date();
      return { success: true, data: true };
    }
    return {
      success: false,
      error: {
        name: "InvalidStatusTransition",
        message: `Cannot start job from status ${this.status.current}`,
      },
    };
  }

  public complete(): Result<boolean> {
    if (this.status.moveTo("completed")) {
      this.updatedAt = new Date();
      return { success: true, data: true };
    }
    return {
      success: false,
      error: {
        name: "InvalidStatusTransition",
        message: `Cannot complete job from status ${this.status.current}`,
      },
    };
  }

  public fail(): Result<boolean> {
    if (this.status.moveTo("failed")) {
      this.updatedAt = new Date();
      return { success: true, data: true };
    }
    return {
      success: false,
      error: {
        name: "InvalidStatusTransition",
        message: `Cannot fail job from status ${this.status.current}`,
      },
    };
  }

  public delay(): Result<boolean> {
    if (this.status.moveTo("delayed")) {
      this.updatedAt = new Date();
      return { success: true, data: true };
    }
    return {
      success: false,
      error: {
        name: "InvalidStatusTransition",
        message: `Cannot delay job from status ${this.status.current}`,
      },
    };
  }

  public getPriority(): number {
    return this.priority;
  }

  public setPriority(priority: number): Result<boolean> {
    if (priority < 0) {
      return {
        success: false,
        error: {
          name: "InvalidPriority",
          message: "Priority cannot be negative",
        },
      };
    }
    if (priority > 10) {
      return {
        success: false,
        error: {
          name: "InvalidPriority",
          message: "Priority cannot be greater than 10",
        },
      };
    }

    this.priority = priority;
    this.updatedAt = new Date();
    return { success: true, data: true };
  }

  public abstract execute(): Promise<Result<any>>;
}
