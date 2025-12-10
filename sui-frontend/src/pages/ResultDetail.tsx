import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, BarChart3, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import clsx from "clsx";
import { useProposals } from "../hooks/useProposals";
import { formatDate } from "../utils/formatter";
import { EXPLORER_URL, DAO_ID } from "../utils/constants";

export const ResultDetail = () => {
  const { id } = useParams();
  const { proposals, isLoading } = useProposals();

  if (isLoading)
    return (
      <div className="flex justify-center pt-20">
        <Loader2 className="animate-spin text-sui-blue" />
      </div>
    );

  const proposal = proposals.find((p) => String(p.id.id) === String(id));

  if (!proposal)
    return (
      <div className="text-center pt-20 text-white">Result Not Found.</div>
    );

  const votes = proposal.votes.map(Number);
  const totalVotes = votes.reduce((a, b) => a + b, 0);

  let winnerName = "NO VOTES";
  let badgeColor = "bg-gray-500";
  let winnerIdx = -1;
  let isTie = false;

  if (totalVotes > 0) {
    const maxVotes = Math.max(...votes);
    isTie = votes.filter((v) => v === maxVotes).length > 1;
    winnerIdx = votes.indexOf(maxVotes);
    winnerName = isTie ? "TIE" : proposal.options[winnerIdx];
    badgeColor = isTie
      ? "bg-gray-500"
      : winnerName.toLowerCase() === "yes" ||
        winnerName.toLowerCase() === "setuju"
      ? "bg-sui-green"
      : "bg-sui-red";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-6 pb-32 px-4 max-w-3xl mx-auto"
    >
      <Link
        to="/results"
        className="text-gray-500 hover:text-sui-blue text-sm mb-6 inline-flex items-center gap-1"
      >
        ← Back to Results
      </Link>

      <div className="bg-sui-card border border-white/10 rounded-3xl p-8 mb-6 overflow-hidden relative">
        <div className={clsx("absolute top-0 left-0 w-full h-2", badgeColor)} />

        <div className="text-center mb-8">
          <div className="text-sm text-gray-500 uppercase tracking-widest mb-2">
            Final Result
          </div>
          <h1
            className={clsx(
              "text-6xl font-display font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r",
              isTie
                ? "from-gray-400 to-gray-600"
                : winnerName.toLowerCase() === "yes"
                ? "from-green-400 to-green-600"
                : "from-red-400 to-red-600"
            )}
          >
            {winnerName.toUpperCase()}
          </h1>
          <p className="text-gray-500">
            Ended on {formatDate(Number(proposal.deadline_ms))}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/5 rounded-2xl p-6">
            <h3 className="font-mono font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={18} /> Vote Breakdown
            </h3>
            <div className="space-y-4">
              {proposal.options.map((opt: string, idx: number) => {
                const count = Number(proposal.votes[idx]);
                const percent = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1 text-gray-300">
                      <span>{opt}</span>
                      <span className="font-mono font-bold">
                        {Math.round(percent)}%
                      </span>
                    </div>
                    <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className={clsx(
                          "h-full",
                          idx === winnerIdx ? badgeColor : "bg-gray-400"
                        )}
                      />
                    </div>
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {count} Votes
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 flex flex-col justify-center text-center">
            <div className="mb-4">
              <div className="text-4xl font-display font-bold text-white">
                {totalVotes}
              </div>
              <div className="text-xs text-gray-500 uppercase">Total Votes</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold text-white">
                {proposal.voters.length}
              </div>
              <div className="text-xs text-gray-500 uppercase">
                Unique Wallets
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h3 className="font-mono font-bold text-white mb-2">
            Proposal Context
          </h3>
          <h4 className="text-lg font-mono font-bold text-gray-300 mb-2">
            {proposal.title}
          </h4>
          <div className="prose prose-sm prose-invert max-w-none text-gray-400 mb-4">
            <ReactMarkdown>{proposal.description}</ReactMarkdown>
          </div>

          <div className="mt-4 pt-4 border-t border-dashed border-white/10 flex justify-between items-center text-xs">
            <span className="text-gray-500 font-mono">
              ID: {String(proposal.id.id)}
            </span>
            <a
              href={`${EXPLORER_URL}/${DAO_ID}`}
              target="_blank"
              rel="noreferrer"
              className="text-sui-blue hover:underline flex items-center gap-1"
            >
              Verify on Explorer <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
