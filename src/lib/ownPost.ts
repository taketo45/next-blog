import {prisma} from '@/lib/prisma'

export async function getOwnPost(userId: string) {
  return await prisma.post.findMany({
    where: {authorId: userId},
    select: {
      id: true,
      title: true,
      published: true,
      updatedAt: true,
    },
    orderBy: {updatedAt: "desc"}
  })
}
