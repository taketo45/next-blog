'use server'
import {postSchema} from '@/validations/post'
import {saveImage} from '@/utils/image'
import {prisma} from '@/lib/prisma'
import {auth} from '@/auth'
import {redirect} from 'next/navigation'

type ActionState = {
  success: boolean,
  errors: Record<string, string[]>
}

export async function updatePost(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {

  //引数取得
  const postId = formData.get('postId') as string
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const topImageInput = formData.get('topImage')
  const topImage = topImageInput instanceof File ? topImageInput : null
  const published = formData.get('published') === 'true'

  //バリデーション
  const validationResult = postSchema.safeParse({title, content, topImage})
  if(!validationResult.success) {
    return {success: false, errors: validationResult.error.flatten().fieldErrors}
  }

  // 認証チェック
  const session = await auth()
  const userId = session?.user?.id
  if(!session?.user?.email || !userId){
    throw new Error('不正なリクエストです')
  }

  // 投稿の存在確認と権限チェック
  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, topImage: true }
  })

  if(!existingPost) {
    throw new Error('投稿が見つかりません')
  }

  if(existingPost.authorId !== userId) {
    throw new Error('この投稿を編集する権限がありません')
  }

  //画像保存（新しい画像がアップロードされた場合のみ）
  let imageUrl = existingPost.topImage // 既存の画像URLを保持
  if(topImage) {
    const newImageUrl = await saveImage(topImage)
    if(!newImageUrl) {
      return {success: false, errors: {image: ['画像の保存に失敗しました']}}
    }
    imageUrl = newImageUrl
  }

  // DB更新
  await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      content,
      topImage: imageUrl,
      published
    }
  })

  redirect('/dashboard')
}