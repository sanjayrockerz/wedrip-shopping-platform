export class PublicApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "PublicApiError";
    this.status = status;
  }
}

export function apiErrorResponse(error: unknown, fallback: string, requestId?: string) {
  const isPublic = error instanceof PublicApiError;
  const id = requestId ?? crypto.randomUUID();

  if (!isPublic) {
    console.error("[api] request failed", { requestId: id });
  }

  return Response.json(
    {
      error: isPublic ? error.message : fallback,
      requestId: id,
    },
    {
      status: isPublic ? error.status : 500,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
