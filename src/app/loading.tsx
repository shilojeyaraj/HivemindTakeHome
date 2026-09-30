// Shown while the server reads the event log. Same shape as the real page so
// nothing jumps when the data arrives.
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-4 pb-16 pt-5" aria-busy="true">
      <div className="space-y-2">
        <div className="h-3 w-28 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-64 animate-pulse rounded bg-surface-2" />
      </div>
      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="h-7 w-40 animate-pulse rounded bg-surface-2" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-surface-2" />
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-3 w-20 animate-pulse rounded bg-surface-2" />
              <div className="mt-2 h-7 w-16 animate-pulse rounded bg-surface-2" />
            </div>
          ))}
        </div>
      </div>
      <p className="text-sm text-muted">Reading what the agent did while you were away...</p>
    </main>
  );
}
