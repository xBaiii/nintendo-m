"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface AvailableDate {
  date: string;
  day: string;
}

interface MonthResult {
  month: string;
  available: AvailableDate[];
  soldOut: number;
}

interface ScrapeResult {
  months: MonthResult[];
  checked: string;
  error?: string;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResult | null>(null);

  const checkTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/check-tickets");
      const data = await response.json();
      setResult(data);
    } catch {
      setResult({
        months: [],
        checked: new Date().toISOString(),
        error: "Failed to fetch",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 gap-8">
      <Button onClick={checkTickets} loading={loading}>
        Check Tickets
      </Button>

      {result && (
        <div className="w-full max-w-lg space-y-6">
          {result.error ? (
            <p className="text-red-400 text-center">{result.error}</p>
          ) : (
            result.months.map((month) => (
              <div key={month.month}>
                <h2 className="text-lg font-medium mb-2 text-[hsl(var(--muted-foreground))]">
                  {month.month}
                </h2>
                {month.available.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Day</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {month.available.map((d) => (
                        <TableRow key={d.date}>
                          <TableCell>{d.date}</TableCell>
                          <TableCell>{d.day}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-[hsl(var(--muted-foreground))] text-sm">
                    No available dates ({month.soldOut} sold out)
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}
