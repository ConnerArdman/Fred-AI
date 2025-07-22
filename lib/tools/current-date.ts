import { tool } from "ai";
import { z } from "zod";

export const getCurrentDateTool = tool({
  description: "Get the current date and time.",
  parameters: z.object({}),
  execute: async () => {
    return { result: new Date().toISOString() };
  },
});