export interface ProposalFields {
  id: { id: string };
  title: string;
  description: string;
  options: string[];
  votes: string[]; // On-chain usually returns numbers as strings
  deadline_ms: string;
  voters: string[];
}

export interface ProposalObject {
  data?: {
    content?: {
      dataType: string;
      fields: ProposalFields;
    };
  };
}

// Helper untuk data hasil query list
export interface SuiObjectResponse {
  data?: {
    content?: {
      dataType: string;
      fields: {
        proposals: Array<{ fields: ProposalFields }>;
      };
    };
  };
}
