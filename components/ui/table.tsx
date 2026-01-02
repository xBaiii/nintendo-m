import * as React from "react";

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="border-b border-[hsl(var(--border))]">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-b border-[hsl(var(--border))] transition-colors hover:bg-[hsl(var(--muted))]">
      {children}
    </tr>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="h-12 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))]">
      {children}
    </th>
  );
}

export function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="p-4 align-middle">{children}</td>;
}

