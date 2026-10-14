import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 1. Kolekcja DATABASE (Kanon popkultury: Filmy, Gry, Książki, Anime)
const databaseCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/database' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    category: z.enum(['film', 'game', 'book', 'anime']),
    year: z.number().optional(),
    creator: z.string().optional(),
    rating: z.string().optional(),
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
  }),
});

// 2. Wspólny schemat dla sekcji technicznych (HARDWARE, SOFTWARE, GEAR)
const articleSchema = z.object({
  title: z.string(),
  date: z.string(),
  tags: z.array(z.string()).default([]),
  description: z.string().optional(),
});

const hardwareCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/hardware' }),
  schema: articleSchema,
});

const softwareCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/software' }),
  schema: articleSchema,
});

const gearCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/gear' }),
  schema: articleSchema,
});

export const collections = {
  database: databaseCollection,
  hardware: hardwareCollection,
  software: softwareCollection,
  gear: gearCollection,
};