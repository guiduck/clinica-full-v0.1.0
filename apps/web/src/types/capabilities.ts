export type CapabilityMode = "real" | "transient" | "unavailable";
export type CapabilityAction = "save" | "send" | "upload" | "sign" | "generate" | "mutate" | "navigate";

export type CapabilityDescriptor = Readonly<{
  key: string;
  mode: CapabilityMode;
  title: string;
  message: string;
  affectedAction: CapabilityAction;
}>;

export type UnavailableCapabilityResult = Readonly<{
  title: string;
  description: string;
  capabilityKey: string;
  availableNow: false;
  mutationPerformed: false;
}>;
