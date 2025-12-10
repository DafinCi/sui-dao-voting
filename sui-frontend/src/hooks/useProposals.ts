import { useSuiClientQuery } from "@mysten/dapp-kit";
import { DAO_ID } from "../utils/constants";

export interface ProposalFields {
  id: { id: string };
  title: string;
  description: string;
  options: string[];
  votes: string[];
  deadline_ms: string;
  voters: string[];
}

export const useProposals = () => {
  const { data, isLoading, isError, refetch } = useSuiClientQuery("getObject", {
    id: DAO_ID,
    options: { showContent: true },
  });

  // Safe parsing untuk mencegah crash jika data belum siap
  const rawData = data as any;

  const proposals: ProposalFields[] =
    rawData?.data?.content?.dataType === "moveObject" &&
    "proposals" in rawData.data.content.fields
      ? rawData.data.content.fields.proposals.map((p: any) => p.fields)
      : [];

  return { proposals, isLoading, isError, refetch };
};
