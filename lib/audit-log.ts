type AuditAction =
  | 'api.chat'
  | 'api.analyze_document'
  | 'api.research'
  | 'api.draft_document'
  | 'api.review_document'
  | 'api.translate'
  | 'auth.login'
  | 'auth.logout'
  | 'data.access'
  | 'data.export';

interface AuditEntry {
  timestamp: string;
  action: AuditAction;
  userId: string;
  ip?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Structured audit logger for compliance (SOC2, HIPAA, GDPR).
 * In production, send to a centralized logging service (e.g., Datadog, Splunk).
 */
export function auditLog(entry: Omit<AuditEntry, 'timestamp'>) {
  const log: AuditEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  // Structured JSON log — easily ingested by log aggregators
  console.log(JSON.stringify({ level: 'audit', ...log }));
}
