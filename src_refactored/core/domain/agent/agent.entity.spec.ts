// src_refactored/core/domain/agent/agent.entity.spec.ts
import { describe, it, expect, vi } from 'vitest';

import { LLMProviderConfig } from '../llm-provider-config/llm-provider-config.entity';
import { LLMApiKey } from '../llm-provider-config/value-objects/llm-api-key.vo';
import { LLMProviderConfigId } from '../llm-provider-config/value-objects/llm-provider-config-id.vo';
import { LLMProviderConfigName } from '../llm-provider-config/value-objects/llm-provider-config-name.vo';
import { LLMProviderId } from '../llm-provider-config/value-objects/llm-provider-id.vo';

import { AgentPersonaTemplate } from './agent-persona-template.vo';
import { Agent } from './agent.entity';
import { AgentId } from './value-objects/agent-id.vo';
import { AgentMaxIterations } from './value-objects/agent-max-iterations.vo';
import { AgentTemperature } from './value-objects/agent-temperature.vo';
import { PersonaBackstory } from './value-objects/persona/persona-backstory.vo';
import { PersonaGoal } from './value-objects/persona/persona-goal.vo';
import { PersonaId } from './value-objects/persona/persona-id.vo';
import { PersonaName } from './value-objects/persona/persona-name.vo';
import { PersonaRole } from './value-objects/persona/persona-role.vo';
import { ToolNames } from './value-objects/persona/tool-names.vo';

describe('Agent Entity', () => {
  const mockPersonaTemplate = AgentPersonaTemplate.create({
    id: PersonaId.generate(),
    name: PersonaName.create('Test Persona'),
    role: PersonaRole.create('Tester'),
    goal: PersonaGoal.create('Test everything'),
    backstory: PersonaBackstory.create('Born to test'),
    toolNames: ToolNames.create(['test-tool']),
  });

  const mockLlmProviderConfig = LLMProviderConfig.create({
    id: LLMProviderConfigId.generate(),
    name: LLMProviderConfigName.create('Test LLM Provider'),
    providerId: LLMProviderId.create('test-provider'),
    apiKey: LLMApiKey.create('test-api-key'),
  });

  const defaultAgentProps = {
    personaTemplate: mockPersonaTemplate,
    llmProviderConfig: mockLlmProviderConfig,
  };

  it('should create an Agent with default maxIterations if not provided', () => {
    const agent = Agent.create(defaultAgentProps);
    expect(agent.maxIterations()).toBeInstanceOf(AgentMaxIterations);
    expect(agent.maxIterations().value).toBe(AgentMaxIterations.default().value);
  });

  it('should create an Agent with provided maxIterations', () => {
    const customMaxIterations = AgentMaxIterations.create(20);
    const agent = Agent.create({
      ...defaultAgentProps,
      maxIterations: customMaxIterations,
    });
    expect(agent.maxIterations()).toEqual(customMaxIterations);
    expect(agent.maxIterations().value).toBe(20);
  });

  it('should allow changing maxIterations', () => {
    const agent = Agent.create(defaultAgentProps);
    const newMaxIterations = AgentMaxIterations.create(15);
    const updatedAgent = agent.changeMaxIterations(newMaxIterations);

    expect(updatedAgent.maxIterations()).toEqual(newMaxIterations);
    expect(updatedAgent.maxIterations().value).toBe(15);
    // Ensure the original agent is not mutated
    expect(agent.maxIterations().value).not.toBe(15);
    expect(agent.maxIterations().value).toBe(AgentMaxIterations.default().value);
  });

  it('should retain other properties when changing maxIterations', () => {
    const agentId = AgentId.generate();
    const temperature = AgentTemperature.create(0.8);
    const agent = Agent.create({
      ...defaultAgentProps,
      id: agentId,
      temperature: temperature,
    });

    const newMaxIterations = AgentMaxIterations.create(25);
    const updatedAgent = agent.changeMaxIterations(newMaxIterations);

    expect(updatedAgent.id()).toEqual(agentId);
    expect(updatedAgent.personaTemplate()).toEqual(mockPersonaTemplate);
    expect(updatedAgent.llmProviderConfig()).toEqual(mockLlmProviderConfig);
    expect(updatedAgent.temperature()).toEqual(temperature);
  });

  it('should correctly compare two agents with different maxIterations', () => {
    const agent1 = Agent.create({
      ...defaultAgentProps,
      maxIterations: AgentMaxIterations.create(5),
    });
    const agent2 = Agent.create({
      ...defaultAgentProps,
      id: agent1.id(), // Same ID
      maxIterations: AgentMaxIterations.create(10),
    });
     const agent3 = Agent.create({ // Different ID
      ...defaultAgentProps,
      maxIterations: AgentMaxIterations.create(5),
    });

    expect(agent1.equals(agent2)).toBe(true); // Equality is based on ID
    expect(agent1.equals(agent3)).toBe(false);
  });
});
