const backendInternalUrl =
  process.env.HOOD_API_INTERNAL_URL ??
  process.env.HOOD_API_PROXY_TARGET ??
  "http://127.0.0.1:8080";

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

export async function fetchBackendJson<T>(path: string, init?: RequestInit) {
  const response = await fetch(joinUrl(backendInternalUrl, path), {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Backend request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
