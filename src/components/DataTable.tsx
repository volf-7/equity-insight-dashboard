import { ComputedRow } from "@/lib/quant";
import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface DataTableProps {
  data: ComputedRow[];
}

const DataTable = ({ data }: DataTableProps) => {
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const totalPages = Math.ceil(data.length / pageSize);
  const slice = data.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="chart-container">
      <h3 className="section-title mb-4">Return Data</h3>
      <div className="overflow-auto max-h-[400px]">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="font-mono text-xs text-muted-foreground">Date</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground text-right">Close</TableHead>
              <TableHead className="font-mono text-xs text-muted-foreground text-right">Log Return</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.map((row, i) => (
              <TableRow key={i} className="border-border">
                <TableCell className="font-mono text-xs">{row.dateStr}</TableCell>
                <TableCell className="font-mono text-xs text-right">{row.close.toFixed(2)}</TableCell>
                <TableCell className={`font-mono text-xs text-right ${
                  row.logReturn === null ? "text-muted-foreground" :
                  row.logReturn >= 0 ? "text-chart-up" : "text-destructive"
                }`}>
                  {row.logReturn !== null ? (row.logReturn * 100).toFixed(4) + "%" : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-xs font-mono text-muted-foreground">
          <span>Page {page + 1} / {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1 rounded bg-secondary text-secondary-foreground disabled:opacity-30 hover:bg-primary hover:text-primary-foreground transition-colors">
              Prev
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="px-3 py-1 rounded bg-secondary text-secondary-foreground disabled:opacity-30 hover:bg-primary hover:text-primary-foreground transition-colors">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
