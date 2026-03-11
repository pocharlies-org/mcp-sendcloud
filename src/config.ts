export interface Config {
  publicKey: string;
  secretKey: string;
}

export function loadConfig(): Config {
  const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
  const secretKey = process.env.SENDCLOUD_SECRET_KEY;

  if (!publicKey) {
    throw new Error("SENDCLOUD_PUBLIC_KEY environment variable is required");
  }
  if (!secretKey) {
    throw new Error("SENDCLOUD_SECRET_KEY environment variable is required");
  }

  return { publicKey, secretKey };
}
