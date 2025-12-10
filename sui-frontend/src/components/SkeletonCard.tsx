export const SkeletonCard = () => (
  <div className="bg-sui-card rounded-2xl border border-white/5 p-6 h-full animate-pulse">
    <div className="h-2 w-full bg-white/5 rounded-full mb-6"></div>
    <div className="flex justify-between mb-4">
      <div className="h-4 w-20 bg-white/10 rounded"></div>
      <div className="h-4 w-16 bg-white/10 rounded"></div>
    </div>
    <div className="h-6 w-3/4 bg-white/10 rounded mb-3"></div>
    <div className="h-4 w-full bg-white/5 rounded mb-2"></div>
    <div className="h-4 w-1/2 bg-white/5 rounded mb-6"></div>
    <div className="h-10 w-full bg-white/5 rounded-xl"></div>
  </div>
);
