import { NavLink, Link } from 'react-router-dom';
import { TOP_NAV_LINKS } from '../data';
import { useSelectedGuild } from '../context/SelectedGuildContext';

export default function TopNavigation() {
  const { user, selectedGuild } = useSelectedGuild();

  return (
    <header className="top-nav">
      <Link to="/" className="brand-mark">
        <div className="glyph">PX</div>
        <div>
          <strong>Plixi</strong>
          <small>{selectedGuild?.name ?? 'Trusted guilds'}</small>
        </div>
      </Link>

      <nav className="top-nav-links">
        {TOP_NAV_LINKS.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            end={Boolean(link.end)}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="top-nav-actions">
        <button type="button" className="icon-btn" aria-label="View notifications">
          🔔
        </button>
        <button type="button" className="icon-btn" aria-label="Search">
          ⌕
        </button>
        <Link to="/pricing" className="primary-btn">
          Upgrade to Premium
        </Link>
        <div className="avatar-chip">
          <img src={user.avatar} alt={user.username} />
          <span>{user.username}</span>
        </div>
      </div>
    </header>
  );
}
