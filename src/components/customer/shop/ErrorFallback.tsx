interface ErrorFallbackProps {
  error: string | null;
  onRetry: () => void;
}

export default function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="text-center py-40 bg-panel border border-line rounded-[24px] max-w-lg mx-auto mt-20">
      <span className="text-5xl block mb-4">⚠️</span>
      <h3 className="text-sm font-bold text-foreground m-0">Failed to Parse Slug Configuration</h3>
      <p className="text-muted-text text-xs mt-1 px-6">{error || "Catalog trace timeout index logs."}</p>
      <button
        onClick={onRetry}
        className="mt-5 bg-brand-primary text-white border-none py-2 px-5 rounded-xl text-xs font-semibold cursor-pointer"
      >
        Return to Marketplace Gateway
      </button>
    </div>
  );
}