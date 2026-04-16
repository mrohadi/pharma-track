import { getAddressRequestByToken } from '@pharmatrack/db';
import { AddressForm } from './address-form';

/**
 * Public page — no auth required. The token in the URL is the only
 * credential. This is the link sent to patients via WhatsApp.
 */
export default async function AddressPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const request = await getAddressRequestByToken(token);

  if (!request) {
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <h1 className="mb-2 text-xl font-bold text-red-600">Invalid link</h1>
        <p className="text-sm text-slate-600">
          This address confirmation link is invalid. Please check the link from your WhatsApp
          message, or contact your pharmacy.
        </p>
      </main>
    );
  }

  if (new Date() > request.expiresAt) {
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <h1 className="mb-2 text-xl font-bold text-amber-600">Link expired</h1>
        <p className="text-sm text-slate-600">
          This link has expired. Please contact your pharmacy to request a new one.
        </p>
      </main>
    );
  }

  if (request.respondedAt) {
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <h1 className="mb-2 text-xl font-bold text-green-600">Already submitted</h1>
        <p className="text-sm text-slate-600">
          Your delivery address has already been saved. Your medication will be delivered soon.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-1 text-xl font-bold">Confirm delivery address</h1>
      <p className="mb-4 text-sm text-slate-600">
        Hi {request.patientName}, please enter the delivery address for your order from{' '}
        <strong>{request.pharmacyName}</strong>.
      </p>
      <AddressForm token={token} />
    </main>
  );
}
