import { requireRole } from '@/lib/guards';
import { listPendingLegalDocReviews } from '@pharmatrack/db';
import { LegalDocRow } from './legal-doc-row';

export default async function AdminLegalDocsPage() {
  await requireRole('admin');
  const reviews = await listPendingLegalDocReviews();

  return (
    <div className="p-4 sm:p-6 lg:p-7">
      <div className="mb-6">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Review Dokumen Legal
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          Permohonan perubahan SIA/SIPA dari apotek
        </p>
      </div>

      {reviews.length === 0 ? (
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            padding: '40px 24px',
            textAlign: 'center',
            color: '#64748b',
            fontSize: 14,
          }}
        >
          Tidak ada permohonan yang menunggu review.
        </div>
      ) : (
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Apotek', 'Diajukan oleh', 'SIA baru', 'SIPA baru', 'Waktu', 'Aksi'].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: '10px 16px',
                          textAlign: 'left',
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <LegalDocRow key={r.auditId} review={r} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
