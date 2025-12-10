import { defineCollection, z } from 'astro:content';

const member = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    avatar: z.string().describe('R2上のアバター画像パス'),
    bio: z.string().optional(),
    socials: z.array(z.object({ name: z.string(), url: z.string().url() })).default([]),
    fanTags: z.array(z.string()).default([]),
    awards: z.array(z.object({ year: z.string(), title: z.string() })).default([]),
    outfits: z.array(z.object({ name: z.string(), image: z.string() })).default([]),
    order: z.number().default(0),
    category: z.string().optional(),
  }),
});

const news = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().optional(),
  }),
});

export const collections = { member, news };
