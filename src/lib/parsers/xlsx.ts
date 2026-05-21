import * as XLSX from "xlsx";
import Papa from "papaparse";
import { parseCSV, ColumnMapping } from "./csv";
import { ParsedTransaction } from "@/lib/normalizers";

export async function parseXLSX(
  buffer: ArrayBuffer,
  userId: string,
  mapping?: ColumnMapping,
): Promise<{ transactions: ParsedTransaction[]; headers: string[]; mapping: ColumnMapping; errors: string[] }> {
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
  const csv = Papa.unparse(json);
  return parseCSV(csv, userId, mapping);
}
