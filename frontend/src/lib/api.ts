const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

export function buildApiUrl(path: string) {
  if (!path.startsWith("/")) {
    throw new Error(`API path must start with '/': ${path}`);
  }

  return apiBaseUrl ? `${apiBaseUrl}${path}` : path;
}

export async function fetchApi(path: string, init?: RequestInit) {
  return fetch(buildApiUrl(path), init);
}

export async function fetchApiJson<T>(path: string, init?: RequestInit) {
  const response = await fetchApi(path, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
