// app/api/ver/route.ts
// Proxy de arquivos para forçar Content-Disposition: inline
// Solução necessária pois o Cloudinary não suporta fl_inline no plano atual

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')

  // Validação: só aceita URLs do Cloudinary do projeto SUEDFLOW
  if (!url || !url.includes('cloudinary.com') || !url.includes('/suedflow/')) {
    return new NextResponse('URL inválida ou não autorizada.', { status: 400 })
  }

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'SUEDFLOW/4.4.5' },
    })

    if (!response.ok) {
      return new NextResponse('Arquivo não encontrado.', { status: 404 })
    }

    const buffer    = await response.arrayBuffer()
    const rawType   = response.headers.get('content-type') || ''

    // Determinar Content-Type correto pelo URL e pelo tipo retornado
    const urlLower  = url.toLowerCase()
    let contentType = rawType

    if (urlLower.includes('.pdf') || rawType.includes('pdf')) {
      contentType = 'application/pdf'
    } else if (urlLower.match(/\.(jpe?g)$/)) {
      contentType = 'image/jpeg'
    } else if (urlLower.includes('.png')) {
      contentType = 'image/png'
    } else if (urlLower.includes('.webp')) {
      contentType = 'image/webp'
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':        contentType,
        'Content-Disposition': 'inline',           // força abertura no navegador
        'Cache-Control':       'private, max-age=3600',
        'X-Frame-Options':     'SAMEORIGIN',
      },
    })
  } catch {
    return new NextResponse('Erro ao carregar o arquivo.', { status: 502 })
  }
}
