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

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'SUEDFLOW/4.4.5' },
    })

    // Se o Cloudinary retornou erro, redireciona direto — o browser mostrará a resposta original
    // (útil para diagnóstico em vez de esconder o erro com mensagem genérica)
    if (!response.ok) {
      return NextResponse.redirect(url, { status: 302 })
    }

    const buffer  = await response.arrayBuffer()
    const urlLow  = url.toLowerCase().split('?')[0]

    // Detectar Content-Type pelo sufixo da URL (Cloudinary omite extensão em raw uploads)
    const extMap: Record<string, string> = {
      '.pdf':  'application/pdf',
      '.jpg':  'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png':  'image/png',
      '.webp': 'image/webp',
      '.gif':  'image/gif',
      '.svg':  'image/svg+xml',
    }
    let contentType = response.headers.get('content-type') || 'application/octet-stream'
    for (const [ext, mime] of Object.entries(extMap)) {
      if (urlLow.endsWith(ext)) { contentType = mime; break }
    }
    // Fallback: se Cloudinary reportou PDF no header, respeitar
    if (response.headers.get('content-type')?.includes('pdf')) {
      contentType = 'application/pdf'
    }

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
    // Falha de rede: redireciona para o URL original como último recurso
    return NextResponse.redirect(url, { status: 302 })
  }
}
