export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07080b]/90 backdrop-blur-md">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping opacity-75" />
          <div className="w-10 h-10 rounded-full border-2 border-t-cyan-400 border-r-cyan-500 border-b-cyan-600 border-l-transparent animate-spin shadow-[0_0_15px_#00e5ff]" />
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>SYNCING HUNTER TELEMETRY...</span>
        </div>
      </div>
    </div>
  );
}
