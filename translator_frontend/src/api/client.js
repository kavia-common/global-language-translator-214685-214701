/**
 * Minimal API client for translator_backend.
 * Note: backend OpenAPI currently exposes only GET `/` (health check).
 *
 * If/when translation endpoints are added to the backend, extend this file with
 * translate/speech methods and update the UI accordingly.
 */

const DEFAULT_BASE_URL = "";

/**
 * PUBLIC_INTERFACE
 * Returns the configured backend base URL.
 * Prefer REACT_APP_TRANSLATOR_BACKEND_URL if provided; otherwise use same-origin.
 */
export function getApiBaseUrl() {
  return (process.env.REACT_APP_TRANSLATOR_BACKEND_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
}

/**
 * PUBLIC_INTERFACE
 * Perform a backend health check.
 * @returns {Promise<{ok: boolean, status: number}>}
 */
export async function healthCheck() {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/`;

  const res = await fetch(url, { method: "GET" });
  return { ok: res.ok, status: res.status };
}
