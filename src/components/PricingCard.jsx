const formatCurrency = (amount) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PricingCard({ plan, billing, emphasized }) {
  const price = billing === 'yearly' ? plan.yearly : plan.monthly;
  const afterPrice = billing === 'yearly' ? plan.yearlyAfter : plan.monthlyAfter;
  const subtext =
    billing === 'yearly'
      ? `$${formatCurrency(price * 12)} first year · $${formatCurrency(afterPrice * 12)} after`
      : `$${price} first month · $${afterPrice} after`;

  return (
    <article className={`pricing-card ${emphasized ? 'is-featured' : ''}`}>
      {plan.badge && <span className="pricing-badge">{plan.badge}</span>}
      <header>
        <h3>{plan.name}</h3>
        <div className="price">
          <span className="amount">${price}</span>
          <span className="period">/mo</span>
        </div>
        <small>{subtext}</small>
      </header>
      <ul>
        {plan.features.map((feature) => (
          <li key={feature.label} className={feature.included ? '' : 'muted'}>
            <span aria-hidden="true">{feature.included ? '✔' : '✖'}</span>
            {feature.label}
          </li>
        ))}
      </ul>
      <button className="primary-btn" type="button">
        Get the {plan.name} plan
      </button>
    </article>
  );
}
