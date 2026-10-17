import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getAdminSession } from "@/lib/auth";
import { buildReport, REPORT_TYPES, type ReportType } from "@/lib/reports";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { type: string } }) {
  const admin = getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!REPORT_TYPES.some((t) => t.key === params.type)) {
    return NextResponse.json({ error: "Unknown report" }, { status: 404 });
  }
  const from = req.nextUrl.searchParams.get("from") || undefined;
  const to = req.nextUrl.searchParams.get("to") || undefined;
  const report = await buildReport(params.type as ReportType, from, to);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(report.title);
  ws.addRow(report.headers);
  report.rows.forEach((r) => ws.addRow(r));
  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: report.headers.length } };
  ws.columns.forEach((col, i) => {
    const longest = Math.max(
      report.headers[i].length,
      ...report.rows.slice(0, 200).map((r) => String(r[i] ?? "").length)
    );
    col.width = Math.min(Math.max(longest + 2, 8), 45);
  });
  report.headers.forEach((h, i) => {
    if (/Amount|CGST|SGST|IGST|Spent/.test(h)) ws.getColumn(i + 1).numFmt = "0.00";
  });

  const buffer = await wb.xlsx.writeBuffer();
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${params.type}-report-${stamp}.xlsx"`,
    },
  });
}
