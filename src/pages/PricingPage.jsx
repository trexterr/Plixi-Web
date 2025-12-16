import { useState } from 'react';
import PricingCard from '../components/PricingCard';
import { PLAN_COMPARISON, PRICING_PLANS } from '../data';

export default function PricingPage() {
  const [billing, setBilling] = useState('monthly');

  return (
    <div className="pricing-page">
      <header className="pricing-hero">
        <p className="eyebrow">Plixi Premium</p>
        <h1>Choose a plan that scales with your Discord empire.</h1>
        <p>Monthly or yearly billing. Switch plans anytime.</p>
        <div className="billing-toggle">
          <button className={billing === 'monthly' ? 'active' : ''} onClick={() => setBilling('monthly')} type="button">
            Pay Monthly
          </button>
          <button className={billing === 'yearly' ? 'active' : ''} onClick={() => setBilling('yearly')} type="button">
            Pay Yearly (Save 25%)
          </button>
        </div>
      </header>

      <section className="pricing-grid">
        {PRICING_PLANS.map((plan) => (
          <PricingCard key={plan.id} plan={plan} billing={billing} emphasized={plan.id === 'premium'} />
        ))}
      </section>

      <section className="comparison-table">
        <header>
          <h2>Compare plans</h2>
          <p>See what you unlock as you upgrade from Free through Ultra.</p>
        </header>
        <div className="table">
          <div className="table-header">
            <span>Feature</span>
            <span>Free</span>
            <span>Lite</span>
            <span>Premium</span>
            <span>Ultra</span>
          </div>
          {PLAN_COMPARISON.map((row) => (
            <div key={row.feature} className="table-row">
              <span>{row.feature}</span>
              {['free', 'lite', 'premium', 'ultra'].map((tier) => (
                <span key={tier} className={row.tiers[tier] ? 'check' : 'x'}>
                  {row.tiers[tier] ? '✔' : '✖'}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
