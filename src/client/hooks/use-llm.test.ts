import React, { useState, useEffect, useRef } from "react";
import { act } from "react-dom/test-utils";
import { useLLM } from "./use-llm";

describe("useLLM", () => {
  it("should return the initial state correctly", () => {
    let result: any;

    act(() => {
      result = useLLM();
    });

    expect(result.isLoading).toBe(false);
    expect(result.error).toBe(null);
  });

  it("should load a model correctly", async () => {
    let result: any;

    await act(async () => {
      result = useLLM();
      await result.loadModel("model1");
    });

    expect(result.isLoading).toBe(false);
    expect(result.error).toBe(null);
  });

  it("should handle error when loading a model", async () => {
    let result: any;

    await act(async () => {
      result = useLLM();
      await result.loadModel("model1");
    });

    expect(result.isLoading).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });

  it("should get available models correctly", async () => {
    let result: any;

    await act(async () => {
      result = useLLM();
      await result.getAvailableModels();

  it('should load the Mistral model correctly', async () => {
    let result: any;
    await act(async () => {
      result = useLLM();
      await result.loadModel({ modelPath: 'mistral' });
    });
    expect(result.getLoadedModel()).toBe('mistral');
  });
    });

    expect(Array.isArray(result.availableModels)).toBe(true);
  });
});
