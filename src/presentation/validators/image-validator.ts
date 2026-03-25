import { z } from "zod";

export const reorderSchema = z.object({
  orderedIds: z.array(z.string()).min(1, "Array cannot be empty"),
});

export type ReorderInput = z.infer<typeof reorderSchema>;
