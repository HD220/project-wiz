import OpenAI from "openai";

export const createOpenAI = () => {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};
