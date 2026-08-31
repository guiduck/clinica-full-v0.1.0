export const PARITY_VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 }
} as const;

export type ParityViewport = keyof typeof PARITY_VIEWPORTS;
export type CapabilityMode = "real" | "transient" | "unavailable";
export type ParityResult =
  | "pending"
  | "equivalent"
  | "approved-divergence"
  | "unavailable-capability";

export type ParityFixture = Readonly<{
  page: string;
  flow: string;
  viewport: ParityViewport;
  capabilityMode: CapabilityMode;
  result: ParityResult;
}>;

export function createParityFixture(
  input: Omit<ParityFixture, "result"> & { result?: ParityResult }
): ParityFixture {
  return Object.freeze({ ...input, result: input.result ?? "pending" });
}
