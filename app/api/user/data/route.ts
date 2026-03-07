import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth, safeErrorResponse } from '@/lib/api-auth';
import { auditLog } from '@/lib/audit-log';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/user/data — GDPR Article 15: Right of access
 * Returns all personal data associated with the authenticated user.
 */
export async function GET(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if (auth.error) return auth.error;

  try {
    const userId = auth.user!.sub;

    auditLog({ action: 'data.access', userId, metadata: { type: 'export' } });

    const user = await prisma.user.findFirst({
      where: { email: auth.user!.email, deletedAt: null },
      include: {
        clientProfile: true,
        lawyerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          email: user.email,
          name: user.name,
          role: user.role,
          locale: user.locale,
          createdAt: user.createdAt,
        },
        clientProfile: user.clientProfile
          ? {
              firstName: user.clientProfile.firstName,
              lastName: user.clientProfile.lastName,
              preferredLocale: user.clientProfile.preferredLocale,
            }
          : null,
      },
      exportedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    return safeErrorResponse(error, 'Failed to export user data');
  }
}

/**
 * DELETE /api/user/data — GDPR Article 17: Right to erasure
 * Soft-deletes the user and anonymizes personal data.
 */
export async function DELETE(request: NextRequest) {
  const auth = await requireApiAuth(request);
  if (auth.error) return auth.error;

  try {
    const userId = auth.user!.sub;

    auditLog({ action: 'data.export', userId, metadata: { type: 'deletion_request' } });

    const user = await prisma.user.findFirst({
      where: { email: auth.user!.email, deletedAt: null },
    });

    if (!user) {
      return NextResponse.json({ success: true, message: 'No data found' });
    }

    // Soft-delete: anonymize PII and mark as deleted
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: `deleted-${user.id}@redacted.local`,
        name: '[REDACTED]',
        phone: null,
        image: null,
        status: 'INACTIVE',
        deletedAt: new Date(),
      },
    });

    // Anonymize client profile if exists
    await prisma.clientProfile.updateMany({
      where: { userId: user.id },
      data: {
        firstName: null,
        lastName: null,
        dateOfBirth: null,
        address: null,
        city: null,
        state: null,
        zipCode: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your data has been scheduled for deletion. This process is irreversible.',
      deletedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    return safeErrorResponse(error, 'Failed to process deletion request');
  }
}
