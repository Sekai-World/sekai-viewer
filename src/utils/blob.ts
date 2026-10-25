export function toBlobPart(data: string): string;
export function toBlobPart(data: Uint8Array): Uint8Array<ArrayBuffer>;
export function toBlobPart(
  data: string | Uint8Array
): string | Uint8Array<ArrayBuffer>;
export function toBlobPart(
  data: string | Uint8Array
): string | Uint8Array<ArrayBuffer> {
  if (typeof data === "string") return data;

  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return copy;
}
