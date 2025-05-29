
import { getOwnPost } from "@/lib/ownPost"; // 投稿取得の関数をインポート
import { auth } from "@/auth"; // 認証関数をインポート
import { notFound } from "next/navigation";
import EditPostForm from "./EditPostForm"; // 編集フォームコンポーネントをインポート

// import rehypeHighlight from "rehype-highlight"; // コードハイライトに必要
type Params ={
  params: Promise<{id: string }>
}

export default async function editPage({params}: Params) {
  const session = await auth();
  if(!session?.user?.id || !session?.user?.email) {
    throw new Error('User not found');
  }
  const { id } = await params
  const post = await getOwnPost(session.user.id, id)
  if (!post) {
    notFound()
  }

  return (
    <EditPostForm post={post} />
  )
}
