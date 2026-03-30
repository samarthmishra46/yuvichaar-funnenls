interface TableProps {
  children: React.ReactNode;
  className?: string;
}

function Table({ children, className = '' }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border">
      <table className={`w-full text-sm ${className}`}>{children}</table>
    </div>
  );
}

function TableHeader({ children, className = '' }: TableProps) {
  return (
    <thead className={`bg-background-secondary ${className}`}>{children}</thead>
  );
}

function TableBody({ children, className = '' }: TableProps) {
  return <tbody className={`divide-y divide-border-light ${className}`}>{children}</tbody>;
}

function TableRow({ children, className = '' }: TableProps & { onClick?: () => void }) {
  return (
    <tr className={`transition-colors hover:bg-background-secondary/50 ${className}`}>
      {children}
    </tr>
  );
}

function TableHead({ children, className = '' }: TableProps) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}

function TableCell({ children, className = '' }: TableProps) {
  return (
    <td className={`px-4 py-3 text-foreground ${className}`}>{children}</td>
  );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
