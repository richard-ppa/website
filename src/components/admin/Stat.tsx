interface StatProps {
  label: string;
  value: string | number;
  delta?: { value: string; positive?: boolean };
  hint?: string;
}

export function Stat({ label, value, delta, hint }: StatProps) {
  return (
    <div className="bg-ppa-white border border-ppa-border p-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ppa-muted mb-2">
        {label}
      </div>
      <div className="font-display text-3xl text-ppa-black tabular-nums leading-none">
        {value}
      </div>
      {delta && (
        <div
          className={`text-xs mt-2 font-medium ${
            delta.positive === false ? "text-red-700" : delta.positive === true ? "text-emerald-700" : "text-ppa-gray"
          }`}
        >
          {delta.value}
        </div>
      )}
      {hint && <div className="text-xs text-ppa-muted mt-2">{hint}</div>}
    </div>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      {children}
    </div>
  );
}
