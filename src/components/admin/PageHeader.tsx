interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-10 flex items-end justify-between gap-6 flex-wrap">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-ppa-brass mb-2">
          {eyebrow}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-ppa-black leading-[0.95]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-ppa-gray font-light max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
      {children}
    </div>
  );
}
