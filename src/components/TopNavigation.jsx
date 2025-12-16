import { NavLink, Link } from 'react-router-dom';
import { TOP_NAV_LINKS } from '../data';
import { useSelectedGuild } from '../context/SelectedGuildContext';
import plixiLogo from '../assets/PLIXI_OFFICIAL_PFP.png';

export default function TopNavigation() {
  const { user, selectedGuild } = useSelectedGuild();

  return (
    <header className="top-nav">
      <Link to="/" className="brand-mark">
        <div className="glyph">
          <img src={plixiLogo} alt="Plixi logo" />
        </div>
        <div className="brand-copy">
          <strong>PLIXI</strong>
        </div>
      </Link>

      <nav className="top-nav-links">
        {TOP_NAV_LINKS.map((link) => (
          link.external ? (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ) : (
            <NavLink
              key={link.label}
              to={link.to}
              end={Boolean(link.end)}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {link.label}
            </NavLink>
          )
        ))}
      </nav>

      <div className="top-nav-actions">
        <a
          href="https://discord.com/oauth2/authorize?client_id=1371993653060436029&permissions=8&integration_type=0&scope=bot+applications.commands"
          className="outline-btn"
          target="_blank"
          rel="noreferrer"
        >
          Invite
        </a>
        <Link to="/pricing" className="primary-btn">
          Premium
        </Link>
        <div className="avatar-chip">
          <img src={user.avatar} alt={user.username} />
          <span>{user.username}</span>
        </div>
      </div>
    </header>
  );
}
