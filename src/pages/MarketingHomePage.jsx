import { Link } from 'react-router-dom';
import { FEATURE_MODULES } from '../data';
import CommandMatrix from '../components/CommandMatrix';

export default function MarketingHomePage() {
  const highlightedModules = FEATURE_MODULES.slice(0, 6);

  return (
    <div className="marketing-page">
      <section className="marketing-hero">
        <div>
          <p className="eyebrow">Plixi // Discord economy bot</p>
          <h1>The best new-gen economy Discord bot.</h1>
          <p>
            Build shops, open mystery boxes, trade with friends, and climb leaderboards — everything your community needs
            to stay active, competitive, and invested.
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
      </section>

      <section id="features" className="marketing-features">
        <header>
          <p className="eyebrow">Features</p>
          <h2>Everything you'd expect from the best Discord Economy Bot</h2>
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

      <CommandMatrix />
    </div>
  );
}
