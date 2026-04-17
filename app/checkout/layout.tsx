import type { ReactNode } from 'react';

export const metadata = {
  title: 'Checkout — Montana Data Company',
};

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-montana-bg pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </div>
  );
}
