import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 医療情報ページ（専門外来・疾患解説）の共通スキーマ。
// status が 'reviewed'（担当医の確認済み）でないページは、本番ビルド（PRODUCTION=true）に含めない。
const article = z.object({
  title: z.string(),
  /** 検索結果に表示する説明文（120字前後） */
  description: z.string(),
  /** 冒頭の結論（3行程度の要約） */
  lead: z.array(z.string()).min(1),
  category: z.string().optional(),
  status: z.enum(['draft', 'reviewed']).default('draft'),
  /** 監修医の氏名。未確認の間は null */
  reviewer: z.string().nullable().default(null),
  reviewedAt: z.coerce.date().nullable().default(null),
  updatedAt: z.coerce.date(),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  references: z.array(z.string()).default([]),
  order: z.number().default(100),
});

export const collections = {
  specialties: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/specialties' }), schema: article }),
  diseases: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/diseases' }), schema: article }),
};
