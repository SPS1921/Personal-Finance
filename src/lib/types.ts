export const TxnType = {
  EXPENSE: "EXPENSE",
  INCOME: "INCOME",
  TRANSFER: "TRANSFER",
} as const;
export type TxnType = (typeof TxnType)[keyof typeof TxnType];

export const PaymentMode = {
  CASH: "CASH",
  UPI: "UPI",
  CARD: "CARD",
  NETBANKING: "NETBANKING",
  WALLET: "WALLET",
  AUTODEBIT: "AUTODEBIT",
  OTHER: "OTHER",
} as const;
export type PaymentMode = (typeof PaymentMode)[keyof typeof PaymentMode];

export const Category = {
  FOOD: "FOOD",
  TRAVEL: "TRAVEL",
  RENT: "RENT",
  EMI: "EMI",
  SHOPPING: "SHOPPING",
  ENTERTAINMENT: "ENTERTAINMENT",
  INVESTMENT: "INVESTMENT",
  UTILITIES: "UTILITIES",
  HEALTH: "HEALTH",
  FAMILY: "FAMILY",
  BUSINESS: "BUSINESS",
  SALARY: "SALARY",
  FREELANCE: "FREELANCE",
  INTEREST: "INTEREST",
  REFUND: "REFUND",
  MISC: "MISC",
} as const;
export type Category = (typeof Category)[keyof typeof Category];

export const AccountType = {
  BANK: "BANK",
  CARD: "CARD",
  CASH: "CASH",
  WALLET: "WALLET",
  INVESTMENT: "INVESTMENT",
} as const;
export type AccountType = (typeof AccountType)[keyof typeof AccountType];

export const DebtType = {
  PERSONAL_LOAN: "PERSONAL_LOAN",
  HOME_LOAN: "HOME_LOAN",
  CAR_LOAN: "CAR_LOAN",
  CREDIT_CARD: "CREDIT_CARD",
  EDUCATION_LOAN: "EDUCATION_LOAN",
  BORROWED: "BORROWED",
  OTHER: "OTHER",
} as const;
export type DebtType = (typeof DebtType)[keyof typeof DebtType];

export const GoalStatus = {
  ACTIVE: "ACTIVE",
  ACHIEVED: "ACHIEVED",
  PAUSED: "PAUSED",
  CANCELLED: "CANCELLED",
} as const;
export type GoalStatus = (typeof GoalStatus)[keyof typeof GoalStatus];

export const ImportStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  PARTIAL: "PARTIAL",
} as const;
export type ImportStatus = (typeof ImportStatus)[keyof typeof ImportStatus];

export const ImportSource = {
  CSV: "CSV",
  XLSX: "XLSX",
  PDF: "PDF",
  RECEIPT: "RECEIPT",
  MANUAL: "MANUAL",
  GOOGLE_SHEETS: "GOOGLE_SHEETS",
  API: "API",
} as const;
export type ImportSource = (typeof ImportSource)[keyof typeof ImportSource];

export const NotificationType = {
  EMI_DUE: "EMI_DUE",
  LOW_BALANCE: "LOW_BALANCE",
  GOAL_ACHIEVED: "GOAL_ACHIEVED",
  BUDGET_EXCEEDED: "BUDGET_EXCEEDED",
  INCOME_DELAYED: "INCOME_DELAYED",
  INSIGHT: "INSIGHT",
  SYSTEM: "SYSTEM",
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
