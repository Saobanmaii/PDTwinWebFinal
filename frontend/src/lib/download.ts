import api from '@/lib/axios'

/**
 * Tải file từ API về máy.
 *
 * Không dùng <a href="/api/..."> trực tiếp được, vì thẻ <a> không gửi kèm header
 * Authorization mà mọi endpoint /api/** đều yêu cầu JWT (SecurityConfig:
 * anyRequest().authenticated()) — sẽ bị 403. Nên phải tải bằng axios (có
 * interceptor tự gắn token) rồi tự tạo link tạm từ blob.
 */
export async function downloadFile(url: string, fallbackName: string) {
  const res = await api.get(url, { responseType: 'blob' })

  const filename = filenameFromDisposition(res.headers['content-disposition']) ?? fallbackName
  const blobUrl = window.URL.createObjectURL(res.data as Blob)

  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()

  // Giải phóng bộ nhớ sau khi trình duyệt kịp bắt đầu tải
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000)
}

function filenameFromDisposition(disposition?: string): string | null {
  if (!disposition) return null
  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(disposition)
  if (utf8Match) return decodeURIComponent(utf8Match[1])
  const match = /filename="?([^";]+)"?/i.exec(disposition)
  return match ? match[1] : null
}
