const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  public code?: string;
  public status: number;
  public details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T; meta?: any }> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Ensures HTTP-only session cookies are sent
  });

  let json: any;
  try {
    json = await response.json();
  } catch (err) {
    if (!response.ok) {
      throw new ApiError(`HTTP error ${response.status}`, response.status);
    }
    return { data: undefined as any };
  }

  if (!response.ok || json.success === false) {
    const errorMsg = json?.error?.message || response.statusText || 'An error occurred';
    const errorCode = json?.error?.code;
    const errorDetails = json?.error?.details;
    throw new ApiError(errorMsg, response.status, errorCode, errorDetails);
  }

  return {
    data: json.data,
    meta: json.meta,
  };
}
