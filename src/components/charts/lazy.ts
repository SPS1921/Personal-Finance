"use client";
import dynamic from "next/dynamic";

const skeleton = () => null;

export const CashflowChart = dynamic(
  () => import("./CashflowChart").then((m) => m.CashflowChart),
  { ssr: false, loading: skeleton },
);

export const SpendByCategory = dynamic(
  () => import("./SpendByCategory").then((m) => m.SpendByCategory),
  { ssr: false, loading: skeleton },
);

export const ForecastChart = dynamic(
  () => import("./ForecastChart").then((m) => m.ForecastChart),
  { ssr: false, loading: skeleton },
);
