export function getErrorMessage(
  err: unknown,
  fallback = "An error occurred"
): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

export type ProfileJoin = {
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
};
