export function okEnvelope<T>(data: T) {
  return {
    code: 200 as const,
    message: 'Success' as const,
    data,
    success: true as const,
  };
}
