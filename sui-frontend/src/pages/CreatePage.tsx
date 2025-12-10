import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
import {
  PACKAGE_ID,
  DAO_ID,
  MODULE,
  CLOCK_ID,
  ADMIN_CAP_ID,
} from "../utils/constants";

export const CreatePage = () => {
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
          <h2 className="text-2xl font-display font-bold text-white mb-2">
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
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            Access Denied
          </h2>
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
        { onSuccess: () => resolve(true), onError: (err) => reject(err) }
      );
    });

    toast
      .promise(promise, {
        loading: "Creating...",
        success: () => {
          setLoading(false);
          navigate("/proposals");
          return "Published!";
        },
        error: "Failed.",
      })
      .catch(() => setLoading(false));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-6 pb-32 px-4 max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-2 mb-8">
        <span className="bg-sui-green text-black px-2 py-0.5 rounded text-xs font-bold uppercase">
          Admin Access
        </span>
      </div>
      <h2 className="text-4xl font-display font-bold mb-8 text-white">
        Create Proposal
      </h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-mono font-bold text-gray-400 mb-2 uppercase">
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
          <label className="block text-sm font-mono font-bold text-gray-400 mb-2 uppercase">
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
            <label className="block text-sm font-mono font-bold text-gray-400 mb-2">
              Options
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
          className="w-full px-8 py-4 bg-sui-blue text-white font-display font-bold text-lg rounded-xl shadow-[4px_4px_0px_#2563ED] hover:translate-y-1 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" /> : "Publish"}
        </button>
      </div>
    </motion.div>
  );
};
