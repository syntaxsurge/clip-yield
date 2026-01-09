export function requirePublicEnv(
  value: string | undefined,
  name: string,
): string {
  if (!value) {
    throw new Error(`Missing required public env var: ${name}`);
  }

  return value;
}
