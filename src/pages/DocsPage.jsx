import { Link } from 'react-router-dom';

const DOC_TOPICS = [
  {
    title: 'Getting started',
    description: 'Invite Plixi, configure your first economy preset, and onboard moderators.',
    href: '/docs/getting-started',
    icon: '🚀',
  },
  {
    title: 'Economy engine',
    description: 'Adjust payouts, cooldowns, streaks, and automation for /daily and /work.',
    href: '/docs/economy',
    icon: '💸',
  },
  {
    title: 'Shops & marketplace',
    description: 'Create catalogues, user shops, and drops that feel premium.',
    href: '/docs/marketplace',
    icon: '🛍️',
  },
  {
    title: 'Events & hype',
    description: 'Use raffles, boxes, and auctions to keep retention high.',
    href: '/docs/events',
    icon: '🎟️',
  },
];

const GUIDE_ARTICLES = [
  {
    title: 'Designing streak-worthy jobs',
    readingTime: '7 min read',
  },
  {
    title: 'How to balance premium-only perks',
    readingTime: '5 min read',
  },
  {
    title: 'Crash course: migrating from other bots',
    readingTime: '6 min read',
  },
];

export default function DocsPage() {
  return (
    <div className="docs-page">
      <section className="docs-hero">
        <p className="eyebrow">Documentation</p>
        <h1>Everything you need to run a thriving Discord economy.</h1>
        <p>Guides, API references, and playbooks maintained by the Plixi core team.</p>
        <div className="docs-search">
          <input type="search" placeholder="Search commands, guides, or troubleshooting..." aria-label="Search docs" />
          <button type="button" className="ghost-btn ghost-btn--small">
            Search
          </button>
        </div>
      </section>

      <section className="docs-grid">
        {DOC_TOPICS.map((topic) => (
          <article key={topic.title} className="docs-card">
            <div className="docs-icon" aria-hidden="true">
              {topic.icon}
            </div>
            <div>
              <h3>{topic.title}</h3>
              <p>{topic.description}</p>
            </div>
            <Link to={topic.href} className="link-btn">
              Read section →
            </Link>
          </article>
        ))}
      </section>

      <section className="docs-guides">
        <header>
          <div>
            <p className="eyebrow">Featured Guides</p>
            <h2>Playbooks from our team</h2>
            <p>Quick reads for staff training, premium funnels, and event strategy.</p>
          </div>
          <Link to="/pricing" className="ghost-btn ghost-btn--small">
            View pricing
          </Link>
        </header>
        <div className="guides-list">
          {GUIDE_ARTICLES.map((guide) => (
            <article key={guide.title}>
              <div>
                <strong>{guide.title}</strong>
                <span>{guide.readingTime}</span>
              </div>
              <button type="button" className="link-btn">
                Open →
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
