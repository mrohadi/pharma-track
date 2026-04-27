import { db } from '../index';
import { orders, auditLog } from '../schema';

export type NewCsvOrder = {
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  medicineText: string;
  deliveryAddress?: string;
};

/**
 * Insert pharmacy-uploaded orders + audit entries atomically.
 * Either every row lands with an audit trail or none do.
 */
export async function insertOrdersFromCsv(opts: {
  pharmacyId: string;
  actorUserId: string;
  rows: NewCsvOrder[];
}): Promise<{ insertedCount: number }> {
  const { pharmacyId, actorUserId, rows } = opts;

  await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(orders)
      .values(
        rows.map((r) => ({
          pharmacyId,
          patientName: r.patientName,
          patientPhone: r.patientPhone,
          patientEmail: r.patientEmail ?? null,
          medicineText: r.medicineText,
          deliveryAddress: r.deliveryAddress ?? null,
          status: 'pending_address' as const,
        })),
      )
      .returning({ id: orders.id });

    await tx.insert(auditLog).values(
      inserted.map((o) => ({
        actorUserId,
        entityType: 'order',
        entityId: o.id,
        action: 'order.created_via_csv',
        diff: { source: 'csv_upload', pharmacyId } as Record<string, unknown>,
      })),
    );
  });

  return { insertedCount: rows.length };
}
