import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

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
  action: AuditAction;
  userId: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Structured audit logger for compliance (SOC2, HIPAA, GDPR).
 * Persists to Neon PostgreSQL via Prisma and also outputs structured JSON
 * to stdout for Vercel runtime logs.
 */
export function auditLog(entry: AuditEntry) {
  const timestamp = new Date().toISOString();

  // Always log to stdout (available in Vercel runtime logs)
  console.log(JSON.stringify({ level: 'audit', timestamp, ...entry }));

  // Persist to database (fire-and-forget, don't block the request)
  prisma.auditLog.create({
    data: {
      action: entry.action,
      userId: entry.userId,
      ip: entry.ip,
      userAgent: entry.userAgent,
      metadata: (entry.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  }).catch((err: unknown) => {
    console.error('[AuditLog] Failed to persist:', err instanceof Error ? err.message : 'unknown');
  });
}
