import { Link } from 'react-router-dom';
import SectionHeader from '../../components/SectionHeader';
import { useSelectedGuild } from '../../context/SelectedGuildContext';
import useGuildSettings from '../../hooks/useGuildSettings';

const GUILD_AREAS = [
  {
    key: 'economy',
    title: 'Economy & Currency',
    description: 'Name your Credits, tweak /daily, and run the job pool.',
    path: '/app/guild/economy',
    icon: '💸',
  },
  {
    key: 'items',
    title: 'Items',
    description: 'Create items, manage rarities, and audit transfers.',
    path: '/app/guild/items',
    icon: '🎫',
  },
  {
    key: 'boxes',
    title: 'Mystery Boxes',
    description: 'Curate box lineups, drops, odds, and behaviors.',
    path: '/app/guild/boxes',
    icon: '🎁',
  },
  {
    key: 'market',
    title: 'Marketplace & Trades',
    description: 'Fees, pagination, trading, and gifting.',
    path: '/app/guild/marketplace',
    icon: '🛍️',
  },
  {
    key: 'auctions',
    title: 'Auctions',
    description: 'Standalone auction house fees and bidding utilities.',
    path: '/app/guild/auctions',
    icon: '🏦',
  },
  {
    key: 'raffles',
    title: 'Raffles',
    description: 'Ticket caps, prize pools, and rare-win alerts.',
    path: '/app/guild/raffles',
    icon: '🎟️',
  },
  {
    key: 'shop',
    title: 'Serverwide Shop',
    description: 'Hero slots, random rotation, and limited stock drops.',
    path: '/app/guild/shop',
    icon: '🏪',
  },
  {
    key: 'leaderboards',
    title: 'Leaderboards & Permissions',
    description: 'Cadences, restricted roles, and admin gating.',
    path: '/app/guild/leaderboards',
    icon: '🏆',
  },
  {
    key: 'audit',
    title: 'Audit, Billing & System',
    description: 'Audit streams, premium perks, locale, and resets.',
    path: '/app/guild/audit',
    icon: '🛡️',
  },
];

export default function DashboardHomePage() {
  const { selectedGuild } = useSelectedGuild();
  const { guild, lastSaved } = useGuildSettings();

  return (
    <div className="page-stack guild-dashboard">
      <SectionHeader
        eyebrow="Plixi Control Center"
        title={`Welcome back to ${selectedGuild?.name ?? 'your guild'}`}
        subtitle="Choose a surface below to configure currency, drops, raffles, permissions, and more."
        meta={<span className="status-pill">Guild dashboard</span>}
      />

      <div className="guild-area-grid">
        {GUILD_AREAS.map((area) => (
          <article key={area.key}>
            <span className="area-icon" aria-hidden="true">
              {area.icon}
            </span>
            <div>
              <h3>{area.title}</h3>
              <p>{area.description}</p>
            </div>
            <Link to={area.path} className="link-btn">
              Open →
            </Link>
          </article>
        ))}
      </div>

      <div className="page-actions">
        <div>
          <span>Last saved</span>
          <strong>{lastSaved ? new Date(lastSaved).toLocaleString() : 'Not yet saved'}</strong>
        </div>
        <Link to="/app/guild/audit" className="primary-btn">
          Reset or manage billing
        </Link>
      </div>
    </div>
  );
}
