export class JobVO {
  constructor(private readonly jobData: unknown) {}

  get value() {
    return this.jobData;
  }
}
