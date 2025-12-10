import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import confetti from "canvas-confetti";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
  Loader2,
  Calendar,
  User,
  BarChart3,
  ExternalLink,
  Lock,
  CheckCircle2,
} from "lucide-react";
import clsx from "clsx";
import { useProposals } from "../hooks/useProposals";
import {
  PACKAGE_ID,
  DAO_ID,
  MODULE,
  CLOCK_ID,
  EXPLORER_URL,
} from "../utils/constants";
import { formatDate } from "../utils/formatter";

export const ProposalDetail = () => {
  const { id } = useParams();
  const { proposals, isLoading } = useProposals();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const [voted, setVoted] = useState(false);

  if (isLoading)
    return (
      <div className="flex justify-center pt-20">
        <Loader2 className="animate-spin text-sui-blue" />
      </div>
    );

  const proposal = proposals.find((p) => String(p.id.id) === String(id));

  if (!proposal)
    return (
      <div className="text-center pt-20 text-white">Proposal Not Found.</div>
    );

  const isExpired = Date.now() > Number(proposal.deadline_ms);
  const totalVotes = proposal.votes.reduce((a, b) => Number(a) + Number(b), 0);
  const uniqueVoters = proposal.voters.length;

  const handleVote = (optionIndex: number) => {
    if (!account) {
      toast.error("Please connect your wallet first!");
      return;
    }

    const votePromise = new Promise((resolve, reject) => {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE}::vote`,
        arguments: [
          tx.object(DAO_ID),
          tx.pure.u64(proposal.id.id),
          tx.pure.u64(optionIndex),
          tx.object(CLOCK_ID),
        ],
      });
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (res) => resolve(res),
          onError: (err) => reject(err),
        }
      );
    });

    toast.promise(votePromise, {
      loading: "Submitting vote...",
      success: () => {
        setVoted(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        return "Vote successfully cast!";
      },
      error: "Voting failed. Check console.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-6 pb-32 px-4 max-w-4xl mx-auto"
    >
      <Link
        to="/proposals"
        className="text-gray-500 hover:text-sui-blue text-sm mb-6 inline-flex items-center gap-1"
      >
        ← Back to Proposals
      </Link>

      {/* Header */}
      <div className="bg-sui-card border border-white/10 rounded-3xl p-6 md:p-8 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className={clsx(
                  "px-3 py-1 rounded-full text-xs font-mono font-bold uppercase",
                  !isExpired
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                )}
              >
                {!isExpired ? "OPEN" : "CLOSED"}
              </span>
              <span className="text-xs text-gray-500 font-mono">
                ID: #{String(proposal.id.id)}
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-display font-bold text-white leading-tight">
              {proposal.title}
            </h1>
          </div>
          <div className="text-left md:text-right w-full md:w-auto bg-white/5 md:bg-transparent p-3 md:p-0 rounded-xl">
            <div className="text-xs text-gray-500 mb-1">Deadline</div>
            <div className="font-mono font-bold text-white flex items-center gap-2">
              <Calendar size={16} /> {formatDate(Number(proposal.deadline_ms))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-400 border-t border-white/5 pt-4">
          <span className="flex items-center gap-1">
            <User size={14} /> Creator: DAO Admin
          </span>
          <span className="flex items-center gap-1">
            <BarChart3 size={14} /> {totalVotes} Votes
          </span>
          <span className="flex items-center gap-1">
            <User size={14} /> {uniqueVoters} Voters
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Detail */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-sui-card border border-white/10 rounded-3xl p-6 md:p-8">
            <h3 className="text-xl font-mono font-bold text-white mb-4">
              Description
            </h3>
            <div className="prose prose-sm prose-invert max-w-none text-gray-300">
              <ReactMarkdown>{proposal.description}</ReactMarkdown>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-sui-card border border-white/10 rounded-3xl p-6">
            <h3 className="text-sm font-mono font-bold text-white mb-4 uppercase tracking-wider">
              Metadata
            </h3>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Proposal ID</span>
                <span className="text-white truncate max-w-[150px]">
                  {String(proposal.id.id)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-gray-500">Explorer</span>
                <a
                  href={`${EXPLORER_URL}/${DAO_ID}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sui-blue hover:underline flex items-center gap-1"
                >
                  View Object <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Vote Section */}
        <div className="space-y-6">
          <div className="bg-sui-card border border-white/10 rounded-3xl p-6 sticky top-24">
            <h3 className="font-mono font-bold text-white mb-4 flex items-center gap-2">
              {isExpired ? <Lock size={18} /> : <CheckCircle2 size={18} />}
              {isExpired ? "Voting Closed" : "Cast Your Vote"}
            </h3>

            {!isExpired ? (
              !account ? (
                <div className="p-4 bg-white/5 rounded-xl text-center text-sm text-gray-500">
                  Connect wallet to vote
                </div>
              ) : !voted ? (
                <div className="space-y-3">
                  {proposal.options.map((opt: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleVote(idx)}
                      className="w-full py-4 px-4 rounded-xl border border-white/10 hover:border-sui-blue hover:bg-sui-blue/10 transition-all text-left flex justify-between items-center group active:scale-95"
                    >
                      <span className="font-mono font-bold text-white group-hover:text-sui-blue">
                        {opt}
                      </span>
                      <div className="w-5 h-5 rounded-full border-2 border-gray-500 group-hover:border-sui-blue"></div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-green-500/10 text-green-500 rounded-xl text-center font-mono font-bold border border-green-500/20">
                  You have voted!
                </div>
              )
            ) : (
              <div className="p-4 bg-white/5 rounded-xl text-center text-sm text-gray-500">
                This proposal has ended.
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="font-mono font-bold text-white mb-4 text-sm uppercase tracking-wide">
                Live Statistics
              </h3>
              <div className="space-y-4">
                {proposal.options.map((opt: string, idx: number) => {
                  const count = Number(proposal.votes[idx]);
                  const percent =
                    totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">{opt}</span>
                        <span className="font-mono font-bold text-white">
                          {Math.round(percent)}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          className={clsx(
                            "h-full",
                            idx === 0 ? "bg-sui-green" : "bg-sui-red"
                          )}
                        />
                      </div>
                      <div className="text-right text-[10px] text-gray-500 mt-0.5">
                        {count} Votes
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
