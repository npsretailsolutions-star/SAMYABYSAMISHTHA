export default function AdminLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-brand-teal/60">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-teal/20 border-t-brand-gold" />
        Loading…
      </div>
    </div>
  );
}
