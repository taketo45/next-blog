import {z} from 'zod'

export const postSchema = z.object({
  title: z.string()
  .min(1,{message: 'タイトルは3文字以上で記載してください'})
  .max(255,{message: 'タイトルは255文字以内で記載してください'}),
  content: z.string()
  .min(10,{message: '記事は10文字以上記載してください'}),
  topImage: z.instanceof(File).nullable().optional()
});