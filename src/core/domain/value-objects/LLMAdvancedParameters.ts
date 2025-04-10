import { Temperature } from './Temperature';
import { TopP } from './TopP';
import { TopK } from './TopK';
import { FrequencyPenalty } from './FrequencyPenalty';
import { PresencePenalty } from './PresencePenalty';
import { MaxTokens } from './MaxTokens';
import { RepeatPenalty } from './RepeatPenalty';
import { Seed } from './Seed';
import { StopSequences } from './StopSequences';

export interface LLMAdvancedParametersProps {
  temperature: Temperature;
  topP: TopP;
  topK: TopK;
  frequencyPenalty: FrequencyPenalty;
  presencePenalty: PresencePenalty;
  maxTokens: MaxTokens;
  repeatPenalty: RepeatPenalty;
  seed: Seed;
  stopSequences: StopSequences;
}

export class LLMAdvancedParameters {
  private readonly props: LLMAdvancedParametersProps;

  constructor(props: LLMAdvancedParametersProps) {
    this.props = props;
  }

  public get temperature(): number {
    return this.props.temperature.getValue();
  }

  public get topP(): number {
    return this.props.topP.getValue();
  }

  public get topK(): number {
    return this.props.topK.getValue();
  }

  public get frequencyPenalty(): number {
    return this.props.frequencyPenalty.getValue();
  }

  public get presencePenalty(): number {
    return this.props.presencePenalty.getValue();
  }

  public get maxTokens(): number {
    return this.props.maxTokens.getValue();
  }

  public get repeatPenalty(): number {
    return this.props.repeatPenalty.getValue();
  }

  public get seed(): number | null {
    return this.props.seed.getValue();
  }

  public get stopSequences(): string[] {
    return this.props.stopSequences.getSequences();
  }

  public getProps(): LLMAdvancedParametersProps {
    return this.props;
  }
}