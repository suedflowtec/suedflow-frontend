// app/api/ver/route.ts
// Proxy para visualizar arquivos do Cloudinary inline no browser.
// Não exige autenticação própria porque a URL já vem do backend (que verificou permissão).
// Para arquivos que exigem auth, use o endpoint /api/orders/:id/documentos/:docId/ver.

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')

  if (!url || !url.startsWith('https://')) {
    return new NextResponse('URL inválida.', { status: 400 })
  }

  // Só aceita URLs do Cloudinary do projeto SUEDFLOW
  const isSuedflowCloudinary = url.includes('cloudinary.com') && url.includes('/suedflow/')
  if (!isSuedflowCloudinary) {
    return new NextResponse('URL não autorizada.', { status: 403 })
  }

  // Limpar ?_a= e outros parâmetros que extensões de browser possam ter adicionado à URL.
  // Nunca redirecionar para a URL do Cloudinary: extensões adicionam ?_a=... que invalida
  // a assinatura s-- e causa 401 visível ao usuário.
  const cleanUrl = url.split('?')[0]

  try {
    const response = await fetch(cleanUrl, {
      headers: { 'User-Agent': 'SUEDFLOW/4.4.5' },
    })

    if (!response.ok) {
      return new NextResponse(
        `<html><body style="font-family:sans-serif;padding:2rem;color:#333"><h3 style="color:#c00">Documento indisponível</h3><p>O servidor de armazenamento retornou status ${response.status}.</p><p style="font-size:12px;color:#888">Tente novamente ou contate o suporte.</p></body></html>`,
        { status: 502, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    const buffer  = await response.arrayBuffer()
    const urlLow  = cleanUrl.toLowerCase()

    // Detectar Content-Type em ordem de confiabilidade:
    // 1) magic bytes (%PDF — 0x25 0x50 0x44 0x46): mais confiável para PDFs raw
    // 2) extensão da URL
    // 3) header Content-Type do Cloudinary (pode vir como octet-stream para raw)
    const uint8 = new Uint8Array(buffer)
    const isPdf = uint8.length > 4 && uint8[0] === 0x25 && uint8[1] === 0x50 && uint8[2] === 0x44 && uint8[3] === 0x46

    const extMap: Record<string, string> = {
      '.pdf':  'application/pdf',
      '.jpg':  'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png':  'image/png',
      '.webp': 'image/webp',
      '.gif':  'image/gif',
      '.svg':  'image/svg+xml',
    }
    const cloudinaryType = response.headers.get('content-type') || ''
    let contentType = cloudinaryType && cloudinaryType !== 'application/octet-stream'
      ? cloudinaryType
      : 'application/octet-stream'
    for (const [ext, mime] of Object.entries(extMap)) {
      if (urlLow.endsWith(ext)) { contentType = mime; break }
    }
    if (isPdf) contentType = 'application/pdf'

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':        contentType,
        'Content-Disposition': 'inline',
        'Cache-Control':       'private, max-age=3600',
        'X-Frame-Options':     'SAMEORIGIN',
      },
    })
  } catch {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:2rem;color:#333"><h3 style="color:#c00">Erro de rede</h3><p>Não foi possível acessar o arquivo. Verifique sua conexão ou tente novamente.</p></body></html>`,
      { status: 502, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }
}
