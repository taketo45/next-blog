import {prisma} from '@/lib/prisma'

export async function getOwnPosts(userId: string) {
  return await prisma.post.findMany({
    where: {
      authorId: userId
    },
    select: {
      id: true,
      title: true,
      published: true,
      updatedAt: true,
    },
    orderBy: {updatedAt: "desc"}
  })
}

export async function getOwnPost(userId: string, postId: string){
  return await prisma.post.findFirst({
    where: { 
      AND: [
        { authorId: userId },
        { id: postId }
      ]
    },
    select: {
        id: true,
        title: true,
        content: true,
        topImage: true,
        author: true,
        published: true,
        createdAt: true,
        updatedAt: true
    }
  })
}

export async function deleteOwnPost(userId: string, postId: string): Promise<{
  success: boolean;
  message: string;
  deletedPost?: { id: string; title: string; topImage: string | null };
}> {
  try {
    // 投稿の存在確認と権限チェック
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        topImage: true,
        authorId: true
      }
    })

    if (!existingPost) {
      return {
        success: false,
        message: '投稿が見つかりません'
      }
    }

    if (existingPost.authorId !== userId) {
      return {
        success: false,
        message: 'この投稿を削除する権限がありません'
      }
    }

    // 投稿を削除
    await prisma.post.delete({
      where: { id: postId }
    })

    return {
      success: true,
      message: '投稿を削除しました',
      deletedPost: {
        id: existingPost.id,
        title: existingPost.title,
        topImage: existingPost.topImage
      }
    }

  } catch (error) {
    console.error('投稿削除エラー:', error)
    return {
      success: false,
      message: '投稿の削除に失敗しました'
    }
  }
}

export async function deleteMultipleOwnPosts(userId: string, postIds: string[]): Promise<{
  success: boolean;
  message: string;
  deletedCount: number;
  failedIds: string[];
}> {
  const results = await Promise.allSettled(
    postIds.map(postId => deleteOwnPost(userId, postId))
  )

  let deletedCount = 0
  const failedIds: string[] = []

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      deletedCount++
    } else {
      failedIds.push(postIds[index])
    }
  })

  return {
    success: deletedCount > 0,
    message: `${deletedCount}件の投稿を削除しました`,
    deletedCount,
    failedIds
  }
}