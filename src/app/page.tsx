import { Morning } from "@/components/Morning";
import { loadEvents, loadSteering } from "@/lib/events";

export const dynamic = "force-dynamic";

export default function Home() {
  const events = loadEvents();
  const steering = loadSteering();
  return (
    <main id="top" className="safe-x safe-b mx-auto w-full max-w-3xl space-y-10 pt-4 sm:pt-5">
      <header className="text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-orange" />
          <span className="font-medium">Reading week trip</span>
          <span className="hidden text-muted sm:inline">Toronto to New York to Boston, Oct 10 to 18</span>
        </div>
        <div className="mt-0.5 text-xs text-muted sm:hidden">Toronto to New York to Boston, Oct 10 to 18</div>
        <div className="mt-0.5 text-xs text-muted">Agent: Instinct. Amounts in CAD.</div>
      </header>
      <Morning events={events} serverSteering={steering} />
    </main>
  );
}
