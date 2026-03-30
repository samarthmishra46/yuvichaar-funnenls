interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-card-bg border border-border rounded-2xl card-shadow transition-shadow duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className = '' }: CardProps) {
  return (
    <div className={`px-6 pt-6 pb-2 ${className}`}>{children}</div>
  );
}

function CardTitle({ children, className = '' }: CardProps) {
  return (
    <h3 className={`text-lg font-bold text-foreground ${className}`}>
      {children}
    </h3>
  );
}

function CardDescription({ children, className = '' }: CardProps) {
  return (
    <p className={`text-sm text-text-muted mt-1 ${className}`}>
      {children}
    </p>
  );
}

function CardContent({ children, className = '' }: CardProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

function CardFooter({ children, className = '' }: CardProps) {
  return (
    <div
      className={`px-6 pb-6 pt-2 border-t border-border-light mt-2 ${className}`}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
