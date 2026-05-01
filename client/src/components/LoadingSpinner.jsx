function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-brand-400" />
      <span>{text}</span>
    </div>
  );
}

export default LoadingSpinner;

