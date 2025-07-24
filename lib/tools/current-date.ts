import { tool } from "ai";
import { z } from "zod";

export const getCurrentDateTool = tool({
  description: "Get the current date and time. Call this tool before other tools when you need to know the current date and time such as when asked about today or tomorrow.",
  parameters: z.object({}),
  execute: async () => {
    return { result: new Date().toISOString() };
  },
});