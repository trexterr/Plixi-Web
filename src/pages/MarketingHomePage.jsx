import { Link } from 'react-router-dom';
import { FEATURE_MODULES } from '../data';

export default function MarketingHomePage() {
  const highlightedModules = FEATURE_MODULES.slice(0, 6);

  return (
    <div className="marketing-page">
      <section className="marketing-hero">
        <div>
          <p className="eyebrow">Plixi // Discord automation</p>
          <h1>All-in-one Discord bot for economies, events, and premium guild ops.</h1>
          <p>
            Plixi combines XP engines, jobs, raffles, and concierge-grade analytics so you can run a thriving community
            without touching code. Inspired by MEE6, rebuilt for today.
          </p>
          <div className="cta-group">
            <Link to="/app" className="primary-btn">
              Add to Discord
            </Link>
            <a href="#features" className="ghost-btn">
              Explore Features
            </a>
          </div>
          <ul className="hero-highlights">
            <li>
              <strong>3.2M+</strong>
              <span>economy payouts/day</span>
            </li>
            <li>
              <strong>100% client-side</strong>
              <span>demo with saved state</span>
            </li>
            <li>
              <strong>Premium-ready</strong>
              <span>blurred upsells and toasts</span>
            </li>
          </ul>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <p>Discord snippet</p>
            <div className="mock-message">
              <div className="avatar" aria-hidden="true">
                PX
              </div>
              <div>
                <strong>/work</strong>
                <p>Earn +180 credits • cooldown 6h • auto tax 5%</p>
              </div>
            </div>
            <div className="pulse" />
          </div>
          <div className="hero-card secondary">
            <p>Dashboard</p>
            <strong>Live preview</strong>
            <span>Sliders update instantly</span>
          </div>
        </div>
      </section>

      <section id="features" className="marketing-features">
        <header>
          <p className="eyebrow">Feature suite</p>
          <h2>Everything you expect from a MEE6-class dashboard</h2>
          <p>Toggle modules on/off, gate premium perks, and configure every detail from an elegant SPA.</p>
        </header>
        <div className="marketing-feature-grid">
          {highlightedModules.map((module) => (
            <article key={module.key}>
              <div className="icon">{module.icon}</div>
              <div>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </div>
              <Link to="/app" className="ghost-btn">
                Configure
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
