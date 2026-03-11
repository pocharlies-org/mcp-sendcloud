import type { Config } from "../config.js";

export class SendCloudClient {
  private baseUrl = "https://panel.sendcloud.sc/api/v2";
  private auth: string;

  constructor(config: Config) {
    this.auth =
      "Basic " +
      Buffer.from(`${config.publicKey}:${config.secretKey}`).toString(
        "base64"
      );
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== "") url.searchParams.set(k, v);
      }
    }

    const res = await fetch(url.toString(), {
      headers: { Authorization: this.auth },
      signal: AbortSignal.timeout(15_000),
    });

    return this.handleResponse<T>(res);
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: this.auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });

    return this.handleResponse<T>(res);
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "PUT",
      headers: {
        Authorization: this.auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });

    return this.handleResponse<T>(res);
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (res.ok) return res.json() as Promise<T>;

    const text = await res.text().catch(() => "");
    switch (res.status) {
      case 401:
        throw new Error("Invalid SendCloud credentials");
      case 403:
        throw new Error("Insufficient permissions");
      case 404:
        throw new Error(`Not found: ${text}`);
      case 429:
        throw new Error("Rate limited by SendCloud");
      default:
        if (res.status >= 500)
          throw new Error(`SendCloud server error (${res.status}): ${text}`);
        throw new Error(`SendCloud API error (${res.status}): ${text}`);
    }
  }
}
