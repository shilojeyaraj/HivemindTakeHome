import { Morning } from "@/components/Morning";
import { loadEvents, loadSteering } from "@/lib/events";

export const dynamic = "force-dynamic";

export default function Home() {
  const events = loadEvents();
  const steering = loadSteering();
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-4 pb-16 pt-5">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted">Reading week trip</div>
          <div className="text-sm text-ink-2">Toronto to New York to Boston, Oct 10 to 18</div>
        </div>
        <div className="text-xs text-muted">Agent: Instinct. Amounts in CAD.</div>
      </header>
      <Morning events={events} serverSteering={steering} />
    </main>
  );
}
