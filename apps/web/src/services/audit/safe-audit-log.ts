type AuditEvent = {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
};

export function safeAuditLog(event: AuditEvent) {
  console.info("[audit]", {
    userId: event.userId,
    action: event.action,
    entity: event.entity,
    entityId: event.entityId ?? null
  });
}
