import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useProposals } from "../hooks/useProposals";
import { formatDate } from "../utils/formatter";
import clsx from "clsx";
import { SkeletonCard } from "../components/SkeletonCard";

export const ResultsPage = () => {
  const { proposals, isLoading, refetch } = useProposals();

  const closedProposals = proposals.filter(
    (p) => Date.now() > Number(p.deadline_ms)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-6 pb-32 px-4 max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8 px-2">
        <div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
            Final Results
          </h2>
          <p className="text-gray-400 mt-1 text-sm md:text-base">
            Outcome of finished proposals.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="text-xs text-sui-blue underline"
        >
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : closedProposals.length === 0 ? (
        <div className="text-center py-20 bg-sui-card rounded-2xl border border-dashed border-white/10">
          <p className="text-gray-500">No closed proposals yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {closedProposals.map((p) => {
            const votes = p.votes.map(Number);
            const totalVotes = votes.reduce((a, b) => a + b, 0);

            let winnerName = "N/A";
            let badgeColor = "bg-gray-500";

            if (totalVotes > 0) {
              const maxVotes = Math.max(...votes);
              const isTie = votes.filter((v) => v === maxVotes).length > 1;
              const winnerIdx = votes.indexOf(maxVotes);
              winnerName = isTie ? "TIE" : p.options[winnerIdx];
              badgeColor = isTie
                ? "bg-gray-500"
                : winnerName.toLowerCase() === "yes" ||
                  winnerName.toLowerCase() === "setuju"
                ? "bg-sui-green"
                : "bg-sui-red";
            }

            return (
              <Link to={`/result/${p.id.id}`} key={p.id.id}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-sui-card rounded-2xl overflow-hidden border border-white/5 shadow-sm hover:shadow-md transition-all h-full flex flex-col"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-mono text-gray-500">
                        #{String(p.id.id).slice(0, 4)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(Number(p.deadline_ms))}
                      </span>
                    </div>

                    <h3 className="text-lg font-mono font-bold text-white mb-6 line-clamp-2">
                      {p.title}
                    </h3>

                    <div
                      className={clsx(
                        "p-4 rounded-xl text-center text-white mb-6",
                        badgeColor
                      )}
                    >
                      <div className="text-xs uppercase opacity-80 mb-1">
                        Final Outcome
                      </div>
                      <div className="text-2xl font-display font-bold">
                        {winnerName.toUpperCase()}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {p.options.map((opt: string, idx: number) => {
                        const count = Number(p.votes[idx]);
                        const percent =
                          totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                        return (
                          <div
                            key={idx}
                            className="flex justify-between text-xs text-gray-300"
                          >
                            <span>{opt}</span>
                            <span className="font-mono font-bold">
                              {Math.round(percent)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-auto p-4 bg-white/5 border-t border-white/5 text-center text-sui-blue font-mono font-bold text-sm hover:bg-white/10 transition-colors">
                    View Final Details
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
