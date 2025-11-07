import { cn } from '@/lib/utils';
import { CheckSubstatus, PaymentStatus, RequestStatus } from '@/lib/types';

type ChipVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

const getVariantStyles = (variant: ChipVariant) => {
  const styles = {
    default: 'bg-secondary text-secondary-foreground',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    error: 'bg-destructive/10 text-destructive border-destructive/20',
    info: 'bg-primary/10 text-primary border-primary/20',
  };
  return styles[variant];
};

export const RequestStatusChip = ({ status }: { status: RequestStatus }) => {
  const config: Record<RequestStatus, { label: string; variant: ChipVariant }> = {
    DRAFT: { label: 'Draft', variant: 'default' },
    PAYMENT_PENDING: { label: 'Payment Pending', variant: 'warning' },
    PAYMENT_SUCCESS: { label: 'Payment Success', variant: 'success' },
    IN_PROGRESS: { label: 'In Progress', variant: 'info' },
    VERIFIED: { label: 'Verified', variant: 'success' },
    REJECTED: { label: 'Rejected', variant: 'error' },
  };

  const { label, variant } = config[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getVariantStyles(variant)
      )}
    >
      {label}
    </span>
  );
};

export const PaymentStatusChip = ({ status }: { status: PaymentStatus }) => {
  const config: Record<PaymentStatus, { label: string; variant: ChipVariant }> = {
    NOT_PAID: { label: 'Not Paid', variant: 'default' },
    PAID: { label: 'Paid', variant: 'success' },
    FAILED: { label: 'Failed', variant: 'error' },
  };

  const { label, variant } = config[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getVariantStyles(variant)
      )}
    >
      {label}
    </span>
  );
};

export const CheckStatusChip = ({ status }: { status: CheckSubstatus }) => {
  const config: Record<CheckSubstatus, { label: string; variant: ChipVariant }> = {
    NOT_STARTED: { label: 'Not Started', variant: 'default' },
    IN_PROGRESS: { label: 'In Progress', variant: 'info' },
    VERIFIED: { label: 'Verified', variant: 'success' },
    ISSUE: { label: 'Issue', variant: 'error' },
  };

  const { label, variant } = config[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getVariantStyles(variant)
      )}
    >
      {label}
    </span>
  );
};
