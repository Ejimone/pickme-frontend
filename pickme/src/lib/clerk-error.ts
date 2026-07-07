/** Pulls the most human-readable message out of a Clerk error object. */
export function clerkError(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const e = err as {
    errors?: { message?: string; longMessage?: string; code?: string }[];
  };
  return e?.errors?.[0]?.longMessage ?? e?.errors?.[0]?.message ?? fallback;
}

/** True when Clerk reports the identifier (email/phone) has no account yet. */
export function isIdentifierNotFound(err: unknown): boolean {
  const e = err as { errors?: { code?: string }[] };
  return e?.errors?.some((x) => x.code === "form_identifier_not_found") ?? false;
}
