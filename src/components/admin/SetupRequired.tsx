interface SetupRequiredProps {
  title: string;
  description: string;
  steps: string[];
}

export function SetupRequired({ title, description, steps }: SetupRequiredProps) {
  return (
    <div className="bg-amber-50 border border-amber-300 p-6 lg:p-8">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800 mb-2">
        Setup required
      </div>
      <h2 className="font-display text-2xl text-amber-900 mb-2">{title}</h2>
      <p className="text-sm text-amber-900/80 mb-5">{description}</p>
      <ol className="space-y-2 text-sm text-amber-900/90 list-decimal list-inside">
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
    </div>
  );
}
