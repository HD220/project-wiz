import { DelayedError, Job, Processor, WaitingChildrenError } from "bullmq";

type NextFunction<StepName extends string> = (
  nextStep: StepName,
  delay?: number
) => Promise<void>;

export type ProcessorStep<T extends { step?: string } = any, R = any> = (
  job: Job<T, R>,
  token: string,
  next: NextFunction<Exclude<T["step"], undefined>>
) => Promise<R>;

export function createProcessor<
  InputData extends { step?: string } = any,
  OutputData = any,
>(
  steps: Record<
    Exclude<InputData["step"], undefined>,
    ProcessorStep<InputData, OutputData>
  >,
  options: {
    defaultStep: Exclude<InputData["step"], undefined>;
    defaulDelay?: number;
  }
): Processor<InputData, OutputData> {
  const { defaultStep, defaulDelay = 10 } = options;

  async function moveToStep<StepName extends string, InputData, OutputData>(
    nexStep: StepName,
    job: Job<InputData, OutputData>,
    token: string,
    delay: number
  ) {
    await job.updateData({
      ...job.data,
      step: nexStep,
    });

    await job.moveToDelayed(Date.now() + delay, token);
    throw new DelayedError(`[${job.id}|${job.name}] Moved to ${nexStep}`);
  }

  return async (job: Job<InputData, OutputData>, token?: string) => {
    try {
      console.log(
        `[${job.id}|${job.name}] Processing job at step ${job.data.step}`
      );
      const shouldWait = await job.moveToWaitingChildren(token!);
      if (shouldWait)
        throw new WaitingChildrenError(
          `[${job.id}|${job.name}] Moved to waiting children`
        );

      const { step = defaultStep } = job.data;

      const handleStep = steps[step] as ProcessorStep<InputData, OutputData>;
      if (!handleStep)
        throw new Error(
          `[${job.id}|${job.name}] Step ${step} não definida no job.`
        );

      const result = await handleStep(
        job,
        token!,
        async (nextStep: string, delay: number = defaulDelay) =>
          await moveToStep(nextStep, job, token!, delay)
      );
      console.log(`[${job.id}|${job.name}] Job completed successfully`);
      return result;
    } catch (error) {
      console.error(`[${job.id}|${job.name}] Error processing job:`, error);
      throw error;
    }
  };
}
