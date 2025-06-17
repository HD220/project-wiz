import { JobId } from "./job-id.vo";

export class JobDependsOn {
  private readonly jobIds: JobId[];

  constructor(jobIds: JobId[] = []) {
    this.jobIds = jobIds;
  }

  public get value(): JobId[] {
    return [...this.jobIds]; // Retorna uma cópia para garantir imutabilidade externa
  }

  public addDependency(jobId: JobId): JobDependsOn {
    if (this.jobIds.some((id) => id.equals(jobId))) {
      return this; // Já existe, retorna a mesma instância para manter a imutabilidade
    }
    return new JobDependsOn([...this.jobIds, jobId]);
  }

  public removeDependency(jobId: JobId): JobDependsOn {
    const newJobIds = this.jobIds.filter((id) => !id.equals(jobId));
    if (newJobIds.length === this.jobIds.length) {
      return this; // Não encontrou a dependência, retorna a mesma instância
    }
    return new JobDependsOn(newJobIds);
  }

  public hasDependencies(): boolean {
    return this.jobIds.length > 0;
  }

  public getValues(): string[] {
    return this.jobIds.map((jobId) => jobId.value);
  }

  public equals(other: JobDependsOn): boolean {
    if (this.jobIds.length !== other.jobIds.length) {
      return false;
    }
    const thisValues = this.getValues().sort();
    const otherValues = other.getValues().sort();

    for (let i = 0; i < thisValues.length; i++) {
      if (thisValues[i] !== otherValues[i]) {
        return false;
      }
    }
    return true;
  }
}
