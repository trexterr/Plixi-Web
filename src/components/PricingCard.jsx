import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const formatCurrency = (amount) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PricingCard({ plan, billing, emphasized }) {
  const [loading, setLoading] = useState(false);
  const rate = billing === 'yearly' ? plan.yearly : plan.monthly;
  const afterRate = billing === 'yearly' ? plan.yearlyAfter : plan.monthlyAfter;
  const detailLine =
    billing === 'yearly'
      ? `$${formatCurrency(rate * 12)} first year · $${formatCurrency(afterRate * 12)} after`
      : `$${rate} first month · $${afterRate} after`;
  const planKey = `${plan.id}_${billing}`;

  // Reset the button state if the user navigates back from Stripe (bfcache pageshow).
  useEffect(() => {
    const resetLoading = () => setLoading(false);
    window.addEventListener('pageshow', resetLoading);
    window.addEventListener('focus', resetLoading);
    return () => {
      window.removeEventListener('pageshow', resetLoading);
      window.removeEventListener('focus', resetLoading);
    };
  }, []);

  const handleCheckout = async () => {
    if (loading) return;
    setLoading(true);
    let navigated = false;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user?.id) {
        alert('Please sign in to start a subscription.');
        return;
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planKey,
          userId: data.user.id,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        console.error('Checkout session failed', body);
        alert(body?.error || 'Failed to start checkout. Please try again.');
        return;
      }

      const { url } = await response.json();
      if (url) {
        navigated = true;
        window.location.href = url;
      } else {
        alert('Failed to start checkout. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error', err);
      alert('Failed to start checkout. Please try again.');
    } finally {
      if (!navigated) setLoading(false);
    }
  };

  return (
    <article className={`pricing-card ${emphasized ? 'is-featured' : ''}`}>
      {plan.badge && <span className="pricing-badge">{plan.badge}</span>}
      <header>
        <h3>{plan.name}</h3>
        <div className="price">
          <span className="amount">${rate}</span>
          <span className="period">/mo</span>
        </div>
        <small className="pricing-subline">{detailLine}</small>
      </header>
      <ul>
        {plan.features.map((feature) => (
          <li key={feature.label} className={feature.included ? '' : 'muted'}>
            <span aria-hidden="true">{feature.included ? '✔' : '✖'}</span>
            {feature.label}
          </li>
        ))}
      </ul>
      <button className="primary-btn" type="button" onClick={handleCheckout} disabled={loading}>
        {loading ? 'Redirecting…' : `Get the ${plan.name} plan`}
      </button>
    </article>
  );
}
