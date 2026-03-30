type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'outline' | 'purple' | 'pink';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-background-tertiary text-text-secondary',
  success: 'bg-success-light text-success',
  warning: 'bg-amber-500/10 text-amber-500',
  error: 'bg-error-light text-error',
  outline: 'bg-transparent border border-border text-text-secondary',
  purple: 'bg-badge-purple-bg text-badge-purple-text',
  pink: 'bg-badge-pink-bg text-badge-pink-text',
};

function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
