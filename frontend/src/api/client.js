export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

function extractPayload(raw) {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return raw.data;
  }
  return raw;
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, token, headers = {} } = options;

  const finalHeaders = { ...headers };
  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let finalBody = body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body && typeof body === 'object' && !isFormData) {
    finalHeaders['Content-Type'] = finalHeaders['Content-Type'] || 'application/json';
    finalBody = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: finalHeaders,
    body: finalBody
  });

  const contentType = res.headers.get('content-type') || '';
  const raw = contentType.includes('application/json') ? await res.json() : await res.text();
  const data = extractPayload(raw);

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && data.message) ||
      (raw && typeof raw === 'object' && raw.message) ||
      `Request failed (${res.status})`;

    const err = new Error(message);
    err.status = res.status;
    err.payload = raw;
    throw err;
  }

  return data;
}

export async function healthRequest() {
  const url = `${API_BASE.replace('/api/v1', '')}/health`;
  const res = await fetch(url);
  return res.ok;
}
