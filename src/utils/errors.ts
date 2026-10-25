export function getErrorId(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("id" in error)) {
    return undefined;
  }

  return typeof error.id === "string" ? error.id : undefined;
}

export function getErrorMessage(error: unknown): string | undefined {
  if (
    typeof error !== "object" ||
    error === null ||
    !("message" in error) ||
    typeof error.message !== "string"
  ) {
    return undefined;
  }

  return error.message;
}
