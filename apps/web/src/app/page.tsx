export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 p-8">
      <h1 className="text-brand-700 text-4xl font-bold tracking-tight">PharmaTrack</h1>
      <p className="text-lg text-slate-600">
        Pharmacy delivery management system — scaffold ready.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <a
          href="/p"
          className="hover:border-brand-500 rounded-lg border border-slate-200 p-4 transition"
        >
          <div className="font-semibold">Pharmacy</div>
          <div className="text-sm text-slate-500">Upload orders, track status</div>
        </a>
        <a
          href="/a"
          className="hover:border-brand-500 rounded-lg border border-slate-200 p-4 transition"
        >
          <div className="font-semibold">Admin</div>
          <div className="text-sm text-slate-500">Assign, monitor, export</div>
        </a>
        <a
          href="/d"
          className="hover:border-brand-500 rounded-lg border border-slate-200 p-4 transition"
        >
          <div className="font-semibold">Driver</div>
          <div className="text-sm text-slate-500">Pickup & delivery OTP</div>
        </a>
      </div>
    </main>
  );
}
