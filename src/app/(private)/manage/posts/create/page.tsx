'use client'
import { useState, useActionState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import TextareaAutosize from "react-textarea-autosize";
import "highlight.js/styles/github.css"; // コードハイライト用のスタイル
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPost } from "@/lib/actions/createPost"; // 投稿作成のアクションをインポート

// import rehypeHighlight from "rehype-highlight"; // コードハイライトに必要

export default function CreatePostPage() {
  const [content, setContent] = useState("");
  const [contentLength, setContentLength] = useState(0);
  const [preview, setPreview] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createPost,
    {success: false, errors: {}}
  );


  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    setContentLength(value.length);
  };
  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">
        新規記事投稿(Markdown対応)
      </h1>
      <form className="space-y-4" action={formAction}>
        <div className="">
          <Label htmlFor="title">タイトル</Label>
          <Input type="text" id="title" name="title" className="" placeholder="タイトルを入力してください"></Input>
          {state.errors.title && (
              <p className="text-red-500 text-sm mt-1">{state.errors.title.join(',')}</p>
            )}
        </div>
        <div>
          <Label htmlFor="topImage">トップ画像</Label>
          <Input type="file" id="topImage" name="topImage" accept="image/*" className="" />
          {state.errors.topImage && (
              <p className="text-red-500 text-sm mt-1">{state.errors.topImage.join(',')}</p>
            )}
        </div>
        <div>
          <Label htmlFor="content">コンテンツ</Label>
          <TextareaAutosize
            id="content"
            name="content"
            className="w-full p-2 border" 
            placeholder="コンテンツを入力してください" 
            minRows={8} value={content} 
            onChange={handleContentChange}>
          </TextareaAutosize>
          {state.errors.content && (
              <p className="text-red-500 text-sm mt-1">{state.errors.content.join(',')}</p>
            )}
        </div>

        <div className="text-right text-sm text-gray-500 mt-1">
          文字数：{contentLength} 
        </div>
        <div className="flex items-center justify-between">
          <Button onClick={(e) => {
            e.preventDefault();
            setPreview(!preview)
            }}>
            {preview ? "プレビューを閉じる" : "プレビューを表示"}
          </Button>
        </div>
        {preview && (
          <div className="border p-4 bg-gray-50 prose max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              skipHtml={false} // HTMLスキップを無効化
              unwrapDisallowed={true} // Markdownの改行を解釈
              >{content}</ReactMarkdown>
          </div>
        )}
          <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600 rounded px-4 py-2">
            {isPending ? "投稿中..." : "投稿する"}
          </Button>
        </form>
    </div>
  )
}
