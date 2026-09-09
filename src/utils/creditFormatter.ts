export function formatCreditRate(creditRate: number, billingUnitLabel?: string): string {
  let label = billingUnitLabel || 'Student';
  if (label.startsWith('PER_')) {
    label = label.replace('PER_', '').toLowerCase();
    label = label.charAt(0).toUpperCase() + label.slice(1);
  }
  const unitText = creditRate === 1 ? 'Credit' : 'Credits';
  return `${creditRate} ${unitText} / ${label}`;
}

