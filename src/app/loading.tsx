// Shown only if the server is slow to read the event log. Same shape as the
// real page so nothing jumps when the data arrives.
export default function Loading() {
  return (
    <main className="safe-x safe-b mx-auto w-full max-w-3xl space-y-10 pt-4 sm:pt-5" aria-busy="true">
      <div className="h-4 w-64 animate-pulse rounded bg-cream" />
      <div>
        <div className="h-12 w-72 animate-pulse rounded bg-cream" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-cream" />
        <div className="mt-6 h-9 w-56 animate-pulse rounded bg-cream" />
        <div className="mt-6 grid grid-cols-3 gap-4 border-y border-line py-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded bg-cream" />)}
        </div>
      </div>
      <p className="text-sm text-muted">Reading what the agent did while you were away...</p>
    </main>
  );
}
