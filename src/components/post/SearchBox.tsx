'use client'
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SearchBox() {
  const [search, setSearch] = useState('')
  const [ debouncedSearch, setDebouncedSearch] = useState('')
  const router = useRouter()

  //デバウンス
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [search])

  //デバウンスサーチが更新されたら
  useEffect(() => {
    if (debouncedSearch) {
      router.push(`/?search=${debouncedSearch.trim()}`)
    } else {
      router.push('/')
    }
  }, [debouncedSearch, router])

  return (
    <>
      <Input 
      placeholder="記事を検索"
      className="w-[200px] lg:w-[300px] bg-white"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      />
    </>
  )
}
