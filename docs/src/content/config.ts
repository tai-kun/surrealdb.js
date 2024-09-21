import { docsSchema } from "@astrojs/starlight/schema";
import { defineCollection } from "astro:content";
import { z } from "zod";

export const collections = {
  docs: defineCollection({
    schema: docsSchema({
      extend: z.object({
        slug: z.string().optional(),
      }),
    }),
  }),
};
