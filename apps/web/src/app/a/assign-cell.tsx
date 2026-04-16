import { assignOrderAction } from './actions';
import type { DriverRow } from '@pharmatrack/db';

/**
 * Per-row assign control. Server Component — uses a plain form + server
 * action so no client JS ships for the common case.
 */
export function AssignCell({
  orderId,
  drivers,
  currentDriverId,
  currentDriverName,
  disabled,
}: {
  orderId: string;
  drivers: DriverRow[];
  currentDriverId: string | null;
  currentDriverName: string | null;
  disabled?: boolean;
}) {
  if (disabled) {
    return <span className="text-xs text-slate-400">{currentDriverName ?? '—'}</span>;
  }
  return (
    <form action={assignOrderAction} className="flex items-center gap-1">
      <input type="hidden" name="orderId" value={orderId} />
      <select
        name="driverId"
        defaultValue={currentDriverId ?? ''}
        className="rounded border border-slate-300 p-1 text-xs"
        required
      >
        <option value="" disabled>
          {currentDriverName ?? 'Choose driver…'}
        </option>
        {drivers.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name ?? 'Unnamed'} {d.vehicle ? `(${d.vehicle})` : ''}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-brand-600 hover:bg-brand-700 rounded px-2 py-1 text-xs font-medium text-white"
      >
        {currentDriverId ? 'Reassign' : 'Assign'}
      </button>
    </form>
  );
}
