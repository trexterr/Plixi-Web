import { Link } from 'react-router-dom';
import { FEATURE_MODULES } from '../data';
import CommandMatrix from '../components/CommandMatrix';

export default function MarketingHomePage() {
  const highlightedModules = FEATURE_MODULES.slice(0, 7);

  const scrollToFeatures = () => {
    const target = document.getElementById('features');
    if (!target) return;

    const startY = window.scrollY;
    const targetY = target.getBoundingClientRect().top + window.scrollY - 40;
    const duration = 1100;
    const startTime = performance.now();

    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, startY + (targetY - startY) * eased);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  return (
    <div className="marketing-page">
      <section className="marketing-hero hero-with-image">
        <div className="hero-overlay" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">Plixi // Discord economy bot</p>
          <h1>The best new-gen economy Discord bot.</h1>
          <p className="lead">
            Build shops, open mystery boxes, trade with friends, and climb leaderboards — everything your community needs
            to stay active, competitive, and invested.
          </p>
          <div className="cta-group">
            <Link to="/servers" className="primary-btn">
              Add to Discord
            </Link>
            <button type="button" className="ghost-btn" onClick={scrollToFeatures}>
              See features
            </button>
          </div>
          <ul className="hero-highlights">
            <li>
              <strong>Used by 3.2+ million servers</strong>
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
              <Link to="/app" className="link-btn">
                Learn more →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <CommandMatrix />
    </div>
  );
}
