import { writeFile, unlink, access } from 'fs/promises';
import path from 'path';
import { constants } from 'fs';

export async function saveImage(file: File): Promise<string | null>{

  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = `${new Date()}_${file.name}`
  const uploadDir = path.join(process.cwd(), 'public/images')

  try {
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)
    return `/images/${fileName}`
  } catch(error){
    console.error('画像エラー', error)
    return null
  }
}

export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    // URLから実際のファイルパスを構築
    // imageUrl例: "/images/2024-05-30_example.jpg"
    if (!imageUrl.startsWith('/images/')) {
      console.warn('無効な画像URLです:', imageUrl)
      return false
    }

    // ファイル名を抽出
    const fileName = path.basename(imageUrl)
    const filePath = path.join(process.cwd(), 'public', 'images', fileName)

    // ファイルの存在確認
    try {
      await access(filePath, constants.F_OK)
    } catch {
      console.warn('削除対象の画像ファイルが見つかりません:', filePath)
      return false // ファイルが存在しない場合は成功として扱う
    }

    // ファイル削除
    await unlink(filePath)
    console.log('画像ファイルを削除しました:', filePath)
    return true

  } catch (error) {
    console.error('画像削除エラー:', error)
    return false
  }
}

// 複数の画像を一括削除する関数（オプション）
export async function deleteImages(imageUrls: string[]): Promise<{ 
  success: string[], 
  failed: string[] 
}> {
  const results = await Promise.allSettled(
    imageUrls.map(url => deleteImage(url))
  )

  const success: string[] = []
  const failed: string[] = []

  imageUrls.forEach((url, index) => {
    const result = results[index]
    if (result.status === 'fulfilled' && result.value) {
      success.push(url)
    } else {
      failed.push(url)
    }
  })

  return { success, failed }
}

// 画像ファイルの存在確認関数（オプション）
export async function imageExists(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl.startsWith('/images/')) {
      return false
    }

    const fileName = path.basename(imageUrl)
    const filePath = path.join(process.cwd(), 'public', 'images', fileName)
    
    await access(filePath, constants.F_OK)
    return true
  } catch {
    return false
  }
}