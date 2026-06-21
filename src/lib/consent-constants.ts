export const POLICY_VERSION = "1.0";

export type ConsentType =
  | "career_support"
  | "third_party_company_submission";

export type ConsentState = Record<ConsentType, boolean>;
