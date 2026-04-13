import { NextResponse } from 'next/server';
import { sites } from '@/lib/sites.config';

/**
 * Proxy the live Vercel site through the CMS so the visual editor
 * iframe is same-origin and we can inject editing scripts.
 */
export async function GET(request, { params }) {
  const { site, path } = await params;
  const siteConfig = sites[site];
  if (!siteConfig) {
    return NextResponse.json({ error: 'Invalid site' }, { status: 404 });
  }

  const pagePath = path ? '/' + path.join('/') : '/';
  const basePath = siteConfig.basePath; // e.g., /trucking
  const origin = siteConfig.vercelUrl; // e.g., https://trucking-nextjs.vercel.app

  // Build upstream URL: proxy path maps to basePath + pagePath on Vercel
  const targetUrl = origin + basePath + pagePath;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'ALKEME-CMS-Proxy/1.0',
        'Accept': request.headers.get('accept') || '*/*',
      },
    });

    const contentType = res.headers.get('content-type') || '';

    // Non-HTML assets: pass through directly
    if (!contentType.includes('text/html')) {
      const body = await res.arrayBuffer();
      return new NextResponse(body, {
        status: res.status,
        headers: {
          'content-type': contentType,
          'cache-control': 'public, max-age=3600',
          'access-control-allow-origin': '*',
        },
      });
    }

    // HTML: rewrite URLs and inject editor script
    let html = await res.text();

    // Rewrite all asset URLs that reference the basePath to go directly to Vercel
    // e.g., /trucking/_next/... → https://trucking-nextjs.vercel.app/trucking/_next/...
    html = html.replace(
      new RegExp(`(href|src)="${basePath.replace('/', '\\/')}(\\/[^"]+)"`, 'g'),
      `$1="${origin}${basePath}$2"`
    );

    // Also rewrite bare /_next/ references (without basePath)
    html = html.replace(
      /(href|src)="\/_next\/([^"]+)"/g,
      `$1="${origin}/_next/$2"`
    );

    // Rewrite internal page links to stay within the proxy
    // e.g., /trucking/coverage/auto-liability → /api/proxy/trucking/coverage/auto-liability
    html = html.replace(
      new RegExp(`href="${basePath.replace('/', '\\/')}(\\/[^"]*)"`, 'g'),
      `href="/api/proxy/${site}$1"`
    );

    // Inject visual editor CSS in head and script before </body>
    const injectCSS = `<link rel="stylesheet" href="/visual-editor-inject.css" />`;
    const injectScript = `<script src="/visual-editor-inject.js"></script>`;
    html = html.replace('</head>', injectCSS + '</head>');
    html = html.replace('</body>', injectScript + '</body>');

    return new NextResponse(html, {
      status: res.status,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-cache',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}
