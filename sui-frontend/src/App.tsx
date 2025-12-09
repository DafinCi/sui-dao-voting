import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast"; // LIBRARY BARU
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClientQuery,
  useCurrentWallet,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
  Home,
  FileText,
  PlusCircle,
  Trophy,
  ArrowRight,
  Lock,
  Loader2,
  AlertTriangle,
  Trophy as TrophyIcon,
  ExternalLink,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  BarChart3,
  WifiOff,
} from "lucide-react";
import clsx from "clsx";

// --- CONFIGURATION ---
const PACKAGE_ID =
  "0x171662eaaafb29c95f8329545f6f0548423568d69a55b526fce287434d2092a3";
const DAO_ID =
  "0xe0d944f57ad9f0291acf7ed46eddecb79482a0290b6a4d4ce062a3c17c05460b";
const ADMIN_CAP_ID =
  "0x924c047575c952e9fc34cbd71962bd074eb90ced2290984267771a97f70f7dcf";

const CLOCK_ID = "0x6";
const MODULE = "vote";
const EXPLORER_URL = "https://suiscan.xyz/testnet/object";

// --- HELPERS ---
const formatDate = (ms: number) =>
  new Date(ms).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// --- ANIMATION VARIANTS ---
const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// --- NEW COMPONENTS (UX UPGRADES) ---

// 1. Skeleton Loading Card (Untuk Proposal List)
const SkeletonCard = () => (
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

// 2. Network Guard (Peringatan Salah Jaringan)
const NetworkGuard = () => {
  const { currentWallet, connectionStatus } = useCurrentWallet();

  // Deteksi sederhana: Jika connect tapi chain bukan 'sui:testnet'
  // Catatan: Implementasi detail tergantung wallet standard, ini basic check
  const isWrongNetwork =
    connectionStatus === "connected" &&
    currentWallet?.accounts[0]?.chains?.[0] &&
    !currentWallet.accounts[0].chains[0].includes("testnet");

  if (!isWrongNetwork) return null;

  return (
    <div className="bg-red-500/90 text-white text-center py-2 px-4 text-sm font-bold flex justify-center items-center gap-2 fixed top-16 left-0 right-0 z-30 backdrop-blur-md">
      <WifiOff size={16} />
      Warning: You are on the wrong network. Please switch your wallet to Sui
      Testnet.
    </div>
  );
};

// --- MAIN COMPONENTS ---

const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { path: "/", icon: Home, label: "Overview" },
    { path: "/proposals", icon: FileText, label: "Proposals" },
    { path: "/create", icon: PlusCircle, label: "Create" },
    { path: "/results", icon: Trophy, label: "Results" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-sui-dark/90 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
      <div className="max-w-md mx-auto flex justify-around p-2">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (location.pathname.startsWith(item.path) && item.path !== "/");
          return (
            <Link key={item.path} to={item.path} className="relative w-full">
              <div
                className={clsx(
                  "flex flex-col items-center py-2 rounded-xl transition-all active:scale-95",
                  isActive
                    ? "text-sui-blue"
                    : "text-gray-500 hover:text-gray-300"
                )}
              >
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold mt-1">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute top-0 w-12 h-1 bg-sui-blue rounded-full shadow-[0_0_10px_#4DA2FF]"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const Header = () => (
  <header className="sticky top-0 z-40 bg-sui-dark/80 backdrop-blur-md border-b border-white/5">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2 font-black text-xl tracking-tighter text-white">
        <div className="w-8 h-8 bg-gradient-to-br from-sui-blue to-sui-cyan rounded-lg flex items-center justify-center text-black shadow-lg shadow-sui-blue/20">
          S
        </div>
        SuiDAO
      </div>
      <div className="flex items-center gap-3">
        <ConnectButton className="!bg-white/10 !text-white !font-bold !border-none !rounded-full hover:!bg-white/20 transition-all active:scale-95" />
      </div>
    </div>
    <NetworkGuard />
  </header>
);

// --- PAGES ---

// 1. LANDING PAGE
const LandingPage = () => (
  <motion.div
    variants={pageTransition}
    initial="initial"
    animate="animate"
    exit="exit"
    className="pt-10 pb-32 px-6 min-h-[80vh] flex flex-col justify-center text-center"
  >
    <div className="max-w-2xl mx-auto">
      <div className="inline-block px-3 py-1 mb-6 rounded-full border border-sui-blue/30 bg-sui-blue/10 text-sui-blue font-mono text-xs animate-pulse">
        &lt;DAO&gt; Live on Testnet &lt;/DAO&gt;
      </div>
      <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-6 text-white">
        SUI <br />{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sui-blue to-sui-purple">
          VOTING
        </span>
      </h1>
      <p className="text-gray-400 text-lg mb-10 font-medium">
        Decentralized governance. Transparent. Secure.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/proposals"
          className="px-8 py-4 bg-sui-blue text-white font-black text-lg rounded-xl shadow-[4px_4px_0px_#2563EB] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          Vote Now <ArrowRight size={20} />
        </Link>
        <Link
          to="/results"
          className="px-8 py-4 bg-sui-card border-2 border-white/20 text-white font-bold text-lg rounded-xl transition-all hover:bg-white/5 active:scale-95"
        >
          See Results
        </Link>
      </div>
    </div>
  </motion.div>
);

// 2. PROPOSALS LIST (ALL)
const ProposalsPage = () => {
  const { data, isLoading, isError, refetch } = useSuiClientQuery("getObject", {
    id: DAO_ID,
    options: { showContent: true },
  });

  const proposals =
    data?.data?.content?.dataType === "moveObject"
      ? (data.data.content.fields as any).proposals
      : [];
  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isError)
    return (
      <div className="text-center pt-20 text-red-500 font-bold">
        Gagal memuat data. Cek koneksi internet.
      </div>
    );

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="pt-6 pb-32 px-4 max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8 px-2">
        <h2 className="text-3xl md:text-4xl font-black text-white">
          All Proposals
        </h2>
        <button
          onClick={() => {
            refetch();
            toast.success("Data Refreshed");
          }}
          className="text-xs text-sui-blue underline"
        >
          Refresh
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* SKELETON LOADING STATE */}
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : proposals.map((p: any) => {
              const isExpired = Date.now() > Number(p.fields.deadline_ms);
              const totalVotes = p.fields.votes.reduce(
                (a: any, b: any) => Number(a) + Number(b),
                0
              );

              return (
                <Link
                  to={`/proposal/${p.fields.id}`}
                  key={p.fields.id}
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
                          ID: #{p.fields.id}
                        </span>
                        <span
                          className={clsx(
                            "px-2 py-0.5 rounded text-xs font-bold uppercase",
                            !isExpired
                              ? "bg-green-500/20 text-green-400"
                              : "bg-gray-800 text-gray-400"
                          )}
                        >
                          {!isExpired ? "OPEN" : "CLOSED"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold leading-tight mb-2 text-white group-hover:text-sui-blue transition-colors line-clamp-2">
                        {p.fields.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-2">
                        {p.fields.description}
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
                          <span className="text-sm font-bold text-white flex items-center gap-1">
                            <TrophyIcon size={14} className="text-sui-blue" />{" "}
                            {totalVotes} Votes
                          </span>
                          <div className="text-xs bg-sui-blue/10 text-sui-blue px-3 py-1 rounded-full font-bold group-hover:bg-sui-blue group-hover:text-white transition-colors">
                            Details
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
      </div>
    </motion.div>
  );
};

// 3. PROPOSAL DETAIL PAGE
const ProposalDetail = () => {
  const { id } = useParams();
  const { data, isLoading, isError } = useSuiClientQuery("getObject", {
    id: DAO_ID,
    options: { showContent: true },
  });
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const [voted, setVoted] = useState(false);

  if (isLoading)
    return (
      <div className="flex justify-center pt-20">
        <Loader2 className="animate-spin text-sui-blue w-10 h-10" />
      </div>
    );
  if (isError || !data?.data)
    return (
      <div className="text-center pt-20 text-red-500">
        Error loading Proposal.
      </div>
    );

  const proposals =
    data?.data?.content?.dataType === "moveObject"
      ? (data.data.content.fields as any).proposals
      : [];
  const proposal = proposals.find(
    (p: any) => String(p.fields.id) === String(id)
  );

  if (!proposal)
    return (
      <div className="text-center pt-20 text-white">Proposal Not Found.</div>
    );

  const isExpired = Date.now() > Number(proposal.fields.deadline_ms);
  const totalVotes = (proposal.fields.votes || []).reduce(
    (a: any, b: any) => Number(a) + Number(b),
    0
  );
  const uniqueVoters = proposal.fields.voters
    ? proposal.fields.voters.length
    : 0;

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
          tx.pure.u64(proposal.fields.id),
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
        return "Vote successfully cast!";
      },
      error: "Voting failed. Check console.",
    });
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="pt-6 pb-32 px-4 max-w-4xl mx-auto"
    >
      <Link
        to="/proposals"
        className="text-gray-500 hover:text-sui-blue text-sm mb-6 inline-flex items-center gap-1 transition-colors"
      >
        ← Back to Proposals
      </Link>

      {/* Header Mobile Responsive */}
      <div className="bg-sui-card border border-white/10 rounded-3xl p-6 md:p-8 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className={clsx(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase",
                  !isExpired
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                )}
              >
                {!isExpired ? "OPEN" : "CLOSED"}
              </span>
              <span className="text-xs text-gray-500 font-mono">
                ID: #{proposal.fields.id}
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
              {proposal.fields.title}
            </h1>
          </div>
          <div className="text-left md:text-right w-full md:w-auto bg-white/5 md:bg-transparent p-3 md:p-0 rounded-xl">
            <div className="text-xs text-gray-500 mb-1">Deadline</div>
            <div className="font-bold text-white flex items-center gap-2">
              <Calendar size={16} />{" "}
              {formatDate(Number(proposal.fields.deadline_ms))}
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
            <h3 className="text-xl font-bold text-white mb-4">
              Description & Goals
            </h3>
            <div className="prose prose-sm prose-invert max-w-none text-gray-300">
              <p className="whitespace-pre-wrap leading-relaxed">
                {proposal.fields.description}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-sui-card border border-white/10 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              Metadata
            </h3>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Proposal ID</span>
                <span className="text-white truncate max-w-[150px]">
                  {proposal.fields.id}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Contract</span>
                <span className="text-white">{MODULE}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-gray-500">Explorer</span>
                <a
                  href={`${EXPLORER_URL}/${DAO_ID}`}
                  target="_blank"
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
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
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
                  {proposal.fields.options.map((opt: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleVote(idx)}
                      className="w-full py-4 px-4 rounded-xl border border-white/10 hover:border-sui-blue hover:bg-sui-blue/10 transition-all text-left flex justify-between items-center group active:scale-95"
                    >
                      <span className="font-bold text-white group-hover:text-sui-blue">
                        {opt}
                      </span>
                      <div className="w-5 h-5 rounded-full border-2 border-gray-500 group-hover:border-sui-blue"></div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-green-500/10 text-green-500 rounded-xl text-center font-bold border border-green-500/20">
                  You have voted!
                </div>
              )
            ) : (
              <div className="p-4 bg-white/5 rounded-xl text-center text-sm text-gray-500">
                This proposal has ended.
              </div>
            )}

            {/* Live Stats */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wide">
                Live Statistics
              </h3>
              <div className="space-y-4">
                {proposal.fields.options.map((opt: string, idx: number) => {
                  const count = Number(proposal.fields.votes[idx]);
                  const percent =
                    totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">{opt}</span>
                        <span className="font-bold text-white">
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

// 4. RESULTS PAGE (CLOSED ONLY)
const ResultsPage = () => {
  const { data, isLoading, refetch } = useSuiClientQuery("getObject", {
    id: DAO_ID,
    options: { showContent: true },
  });
  const proposals =
    data?.data?.content?.dataType === "moveObject"
      ? (data.data.content.fields as any).proposals
      : [];

  const closedProposals = proposals.filter(
    (p: any) => Date.now() > Number(p.fields.deadline_ms)
  );

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="pt-6 pb-32 px-4 max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8 px-2">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white">
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
          {closedProposals.map((p: any) => {
            const votes = p.fields.votes.map(Number);
            const totalVotes = votes.reduce((a: number, b: number) => a + b, 0);

            let winnerName = "N/A";
            let badgeColor = "bg-gray-500";

            if (totalVotes > 0) {
              const maxVotes = Math.max(...votes);
              const isTie =
                votes.filter((v: number) => v === maxVotes).length > 1;
              const winnerIdx = votes.indexOf(maxVotes);
              winnerName = isTie ? "TIE" : p.fields.options[winnerIdx];
              badgeColor = isTie
                ? "bg-gray-500"
                : winnerName.toLowerCase() === "yes" ||
                  winnerName.toLowerCase() === "setuju"
                ? "bg-sui-green"
                : "bg-sui-red";
            }

            return (
              <Link to={`/result/${p.fields.id}`} key={p.fields.id}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-sui-card rounded-2xl overflow-hidden border border-white/5 shadow-sm hover:shadow-md transition-all h-full flex flex-col"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-mono text-gray-500">
                        #{p.fields.id}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(Number(p.fields.deadline_ms)).split(",")[0]}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-6 line-clamp-2">
                      {p.fields.title}
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
                      <div className="text-2xl font-black">
                        {winnerName.toUpperCase()}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {p.fields.options.map((opt: string, idx: number) => {
                        const count = Number(p.fields.votes[idx]);
                        const percent =
                          totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                        return (
                          <div
                            key={idx}
                            className="flex justify-between text-xs text-gray-300"
                          >
                            <span>{opt}</span>
                            <span className="font-bold">
                              {Math.round(percent)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-auto p-4 bg-white/5 border-t border-white/5 text-center text-sui-blue font-bold text-sm hover:bg-white/10 transition-colors">
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

// 5. RESULT DETAIL (READ ONLY)
const ResultDetail = () => {
  const { id } = useParams();
  const { data, isLoading } = useSuiClientQuery("getObject", {
    id: DAO_ID,
    options: { showContent: true },
  });

  if (isLoading)
    return (
      <div className="flex justify-center pt-20">
        <Loader2 className="animate-spin text-sui-blue" />
      </div>
    );

  const proposals =
    data?.data?.content?.dataType === "moveObject"
      ? (data.data.content.fields as any).proposals
      : [];
  const proposal = proposals.find(
    (p: any) => String(p.fields.id) === String(id)
  );

  if (!proposal)
    return (
      <div className="text-center pt-20 text-white">Result Not Found.</div>
    );

  const votes = proposal.fields.votes.map(Number);
  const totalVotes = votes.reduce((a: number, b: number) => a + b, 0);

  let winnerName = "NO VOTES";
  let badgeColor = "bg-gray-500";
  let winnerIdx = -1;
  let isTie = false;

  if (totalVotes > 0) {
    const maxVotes = Math.max(...votes);
    isTie = votes.filter((v: number) => v === maxVotes).length > 1;
    winnerIdx = votes.indexOf(maxVotes);
    winnerName = isTie ? "TIE" : proposal.fields.options[winnerIdx];
    badgeColor = isTie
      ? "bg-gray-500"
      : winnerName.toLowerCase() === "yes" ||
        winnerName.toLowerCase() === "setuju"
      ? "bg-sui-green"
      : "bg-sui-red";
  }

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
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
              "text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r",
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
            Ended on {formatDate(Number(proposal.fields.deadline_ms))}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/5 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={18} /> Vote Breakdown
            </h3>
            <div className="space-y-4">
              {proposal.fields.options.map((opt: string, idx: number) => {
                const count = Number(proposal.fields.votes[idx]);
                const percent = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1 text-gray-300">
                      <span>{opt}</span>
                      <span className="font-bold">{Math.round(percent)}%</span>
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
              <div className="text-4xl font-black text-white">{totalVotes}</div>
              <div className="text-xs text-gray-500 uppercase">Total Votes</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white">
                {proposal.fields.voters.length}
              </div>
              <div className="text-xs text-gray-500 uppercase">
                Unique Wallets
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h3 className="font-bold text-white mb-2">Proposal Context</h3>
          <h4 className="text-lg font-bold text-gray-300 mb-2">
            {proposal.fields.title}
          </h4>
          <p className="text-sm text-gray-400 line-clamp-3">
            {proposal.fields.description}
          </p>

          <div className="mt-4 pt-4 border-t border-dashed border-white/10 flex justify-between items-center text-xs">
            <span className="text-gray-500 font-mono">
              ID: {proposal.fields.id}
            </span>
            <a
              href={`${EXPLORER_URL}/${DAO_ID}`}
              target="_blank"
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

// 6. CREATE PAGE (ADMIN ONLY)
const CreatePage = () => {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    desc: "",
    options: "",
    deadline: 7,
  });
  const [loading, setLoading] = useState(false);

  const { data: ownedObjects, isLoading: checkingAdmin } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address || "",
      filter: { StructType: `${PACKAGE_ID}::vote::AdminCap` },
    },
    { enabled: !!account }
  );

  const isAdmin = ownedObjects?.data && ownedObjects.data.length > 0;

  if (!account)
    return (
      <div className="pt-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-sui-card p-8 rounded-3xl border border-red-500/30 shadow-sm">
          <Lock size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-400 mb-6">Connect wallet first.</p>
        </div>
      </div>
    );
  if (checkingAdmin)
    return (
      <div className="flex justify-center pt-20">
        <Loader2 className="animate-spin text-sui-blue" />
      </div>
    );
  if (!isAdmin)
    return (
      <div className="pt-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-sui-card p-8 rounded-3xl border border-red-500 shadow-md">
          <AlertTriangle size={32} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">
            Only <strong>Admin</strong> can create proposals.
          </p>
          <Link to="/proposals" className="text-sui-blue hover:underline">
            Go Back
          </Link>
        </div>
      </div>
    );

  const handleSubmit = () => {
    if (!form.title || !form.desc || !form.options) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);

    const promise = new Promise((resolve, reject) => {
      const tx = new Transaction();
      const deadlineMs = BigInt(
        Date.now() + form.deadline * 24 * 60 * 60 * 1000
      );
      const optionsVec = form.options
        .split(",")
        .map((o) => o.trim())
        .filter((o) => o);
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE}::create_proposal`,
        arguments: [
          tx.object(ADMIN_CAP_ID),
          tx.object(DAO_ID),
          tx.pure.string(form.title),
          tx.pure.string(form.desc),
          tx.pure.vector("string", optionsVec),
          tx.pure.u64(deadlineMs),
          tx.object(CLOCK_ID),
        ],
      });
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => resolve(true),
          onError: (err) => reject(err),
        }
      );
    });

    toast
      .promise(promise, {
        loading: "Creating Proposal...",
        success: () => {
          setLoading(false);
          navigate("/proposals");
          return "Proposal Published!";
        },
        error: "Failed to create proposal.",
      })
      .catch(() => setLoading(false));
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="pt-6 pb-32 px-4 max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-2 mb-8">
        <span className="bg-sui-green text-black px-2 py-0.5 rounded text-xs font-bold uppercase">
          Admin Access
        </span>
      </div>
      <h2 className="text-4xl font-black mb-8 text-white">Create Proposal</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">
            Title
          </label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            type="text"
            className="w-full bg-sui-card border-2 border-[#30363d] rounded-xl p-4 text-white focus:border-sui-blue outline-none"
            placeholder="Title"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">
            Description
          </label>
          <textarea
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            rows={5}
            className="w-full bg-sui-card border-2 border-[#30363d] rounded-xl p-4 text-white focus:border-sui-blue outline-none"
            placeholder="Description..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              Duration (Days)
            </label>
            <input
              type="number"
              min="1"
              value={form.deadline}
              onChange={(e) =>
                setForm({ ...form, deadline: parseInt(e.target.value) })
              }
              className="w-full bg-sui-card border-2 border-[#30363d] rounded-xl p-4 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              Options (Comma separated)
            </label>
            <input
              type="text"
              value={form.options}
              onChange={(e) => setForm({ ...form, options: e.target.value })}
              className="w-full bg-sui-card border-2 border-[#30363d] rounded-xl p-4 text-white"
              placeholder="Yes, No"
            />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          type="button"
          className="w-full py-5 bg-gradient-to-r from-sui-blue to-sui-purple text-white text-xl font-black rounded-xl shadow-lg hover:shadow-sui-blue/50 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" /> : "Publish"}
        </button>
      </div>
    </motion.div>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <Router>
      <div className="min-h-screen relative font-sans selection:bg-sui-blue selection:text-white pb-20 bg-sui-dark text-white transition-colors duration-300">
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#161B22",
              color: "#fff",
              border: "1px solid #30363d",
            },
          }}
        />
        <Header />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/proposals" element={<ProposalsPage />} />
            <Route path="/proposal/:id" element={<ProposalDetail />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/result/:id" element={<ResultDetail />} />
          </Routes>
        </AnimatePresence>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
