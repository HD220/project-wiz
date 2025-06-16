import { tool, ToolCallUnion, ToolResultUnion, ToolSet } from "ai";
import { z } from "zod";
import nodePath from "node:path";
import * as fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { thoughtTool } from "./tools/thought";
import { finalAnswerTool } from "./tools/final-answer";

async function write(relativePath: string, content: string, replace = true) {
  try {
    const filePath = nodePath.resolve(__dirname, "teste", relativePath);

    const fileDirectory = nodePath.dirname(filePath);

    await fs.mkdir(fileDirectory, { recursive: true });

    if (!replace) {
      const fileExists = existsSync(filePath);
      if (fileExists)
        throw new Error(
          `File already exists and "replace" parameter was not provided`
        );
    }

    await fs.writeFile(filePath, content, { encoding: "utf-8" });
    return {
      success: true,
      message: `file saved successfully, at location ${relativePath}`,
    };
  } catch (error) {
    console.error("writeFile ERROR:", error);
    return {
      success: false,
      message: `Could not save file in location ${relativePath}, cause: ${(error as Error).message}`,
    };
  }
}

async function read(relativePath: string) {
  try {
    const filePath = nodePath.resolve(__dirname, "teste", relativePath);
    const content = await fs.readFile(filePath, { encoding: "utf-8" });

    return { success: true, message: content };
  } catch (error) {
    console.error("readFile ERROR:", error);
    return {
      success: false,
      message: `Could not read file from location ${relativePath}, cause: ${(error as Error).message}`,
    };
  }
}

export const toolSet: ToolSet = {
  writeFile: tool({
    description: "Write an file on path with content informed.",
    parameters: z.object({
      path: z.string({
        description: "The workspace relative file location path.",
      }),
      content: z.string({ description: "content of file for save." }),
      replace: z
        .boolean({
          description:
            "default true, if false and the file already exists, not overwrite.",
        })
        .default(true)
        .optional(),
    }),
    execute: async ({ content, path, replace }) => {
      console.log(
        `Executing writeFile with args: ${path}, ${replace}, ${content.substring(0, 100)}...`
      );
      const data = await write(path, content, replace);
      console.log(`Executed writeFile, result: ${JSON.stringify(data)}`);
      return data;
    },
  }),
  readFile: tool({
    description: "Read file from location.",
    parameters: z.object({
      path: z.string({
        description: "The workspace relative file location path.",
      }),
    }),
    execute: async ({ path }) => {
      console.log(`Executing readFile with args: ${path}`);
      const data = await read(path);
      console.log(
        `Executed readFile, result: ${JSON.stringify({ ...data, message: `${data.message.substring(0, 100)}...` })}`
      );
      return data;
    },
  }),
  thought: thoughtTool,
  finalAnswer: finalAnswerTool,
};

type MyToolCall = ToolCallUnion<typeof toolSet>;
type MyToolResult = ToolResultUnion<typeof toolSet>;
