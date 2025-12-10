import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Search, User, Clock, Trophy } from "lucide-react";
import clsx from "clsx";
import { useProposals } from "../hooks/useProposals";
import { SkeletonCard } from "../components/SkeletonCard";

export const ProposalsPage = () => {
  const { proposals, isLoading, isError, refetch } = useProposals();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "closed">("all");

  useEffect(() => {
    refetch();
  }, [refetch]);

  const filteredProposals = proposals.filter((p) => {
    const matchesSearch = p.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const isExpired = Date.now() > Number(p.deadline_ms);

    let matchesFilter = true;
    if (filter === "active") matchesFilter = !isExpired;
    if (filter === "closed") matchesFilter = isExpired;

    return matchesSearch && matchesFilter;
  });

  if (isError)
    return (
      <div className="text-center pt-20 text-red-500 font-mono">
        Failed to load data. Check internet connection.
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-6 pb-32 px-4 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
            Proposals
          </h2>
          <p className="text-gray-400 text-sm">
            Vote on on-chain governance proposals.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-sui-card border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:border-sui-blue outline-none text-sm"
            />
          </div>
          <div className="flex bg-sui-card border border-white/10 rounded-xl p-1">
            {["all", "active", "closed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={clsx(
                  "px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                  filter === f
                    ? "bg-sui-blue text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              refetch();
              toast.success("Data Refreshed");
            }}
            className="text-xs text-sui-blue underline self-center sm:self-auto"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredProposals.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-sui-card border border-dashed border-white/10 rounded-2xl text-gray-500">
            No proposals found matching your criteria.
          </div>
        ) : (
          filteredProposals.map((p) => {
            const isExpired = Date.now() > Number(p.deadline_ms);
            const totalVotes = p.votes.reduce(
              (a, b) => Number(a) + Number(b),
              0
            );

            return (
              <Link
                to={`/proposal/${p.id.id}`}
                key={p.id.id}
                className="block h-full"
              >
                <motion.div
                  whileHover={{ y: -5 }}
                  className="group bg-sui-card rounded-2xl overflow-hidden border border-white/5 shadow-sm hover:shadow-sui-blue/20 transition-all h-full flex flex-col"
                >
                  <div
                    className={clsx(
                      "h-2 w-full",
                      isExpired ? "bg-gray-400" : "bg-sui-green"
                    )}
                  />
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-mono text-xs text-gray-500">
                        ID: #{String(p.id.id).slice(0, 4)}
                      </span>
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded text-xs font-mono font-bold uppercase",
                          !isExpired
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-800 text-gray-400"
                        )}
                      >
                        {!isExpired ? "OPEN" : "CLOSED"}
                      </span>
                    </div>
                    <h3 className="text-xl font-mono font-bold leading-tight mb-2 text-white group-hover:text-sui-blue transition-colors line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-2">
                      {p.description}
                    </p>

                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User size={12} /> Admin
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {isExpired ? "Ended" : "Active"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-mono font-bold text-white flex items-center gap-1">
                          <Trophy size={14} className="text-sui-blue" />{" "}
                          {totalVotes} Votes
                        </span>
                        <div className="text-xs bg-sui-blue/10 text-sui-blue px-3 py-1 rounded-full font-mono font-bold group-hover:bg-sui-blue group-hover:text-white transition-colors">
                          Details
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
