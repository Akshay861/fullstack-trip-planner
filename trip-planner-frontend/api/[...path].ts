import type { VercelRequest, VercelResponse } from '@vercel/node';

function getBackendBase(): string | null {
  const backend = process.env.BACKEND_URL?.trim();
  if (!backend) return null;
  return backend.replace(/\/$/, '');
}

function buildTargetUrl(req: VercelRequest, subPath: string): string {
  const backend = getBackendBase()!;
  const normalized = subPath && !subPath.endsWith('/') ? `${subPath}/` : subPath;
  const url = new URL(`/api/${normalized}`, `${backend}/`);
  const query = req.url?.includes('?') ? req.url.split('?')[1] : '';
  if (query) url.search = query;
  return url.toString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const backend = getBackendBase();
  if (!backend) {
    return res.status(503).json({
      message:
        'BACKEND_URL is not set in Vercel. Add your deployed Django API base URL (e.g. https://your-api.vercel.app).',
    });
  }

  const pathParts = req.query.path;
  const subPath = Array.isArray(pathParts) ? pathParts.join('/') : String(pathParts ?? '');
  const target = buildTargetUrl(req, subPath);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': req.headers['content-type'] ?? 'application/json',
  };

  let body: string | undefined;
  if (req.method && !['GET', 'HEAD'].includes(req.method)) {
    body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
  }

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json');
    return res.send(text);
  } catch (error) {
    console.error('Backend proxy error:', error);
    return res.status(502).json({
      message:
        'Could not reach the trip planning backend. Check BACKEND_URL and that Django is deployed.',
    });
  }
}
