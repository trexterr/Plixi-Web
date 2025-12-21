import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedGuild } from '../context/SelectedGuildContext';

const INVITE_URL =
  'https://discord.com/oauth2/authorize?client_id=1371993653060436029&permissions=8&integration_type=0&scope=bot+applications.commands';

const renderGuildIcon = (guild) => {
  const icon = guild?.icon;
  if (typeof icon === 'string' && icon.startsWith('http')) {
    return <img src={icon} alt={`${guild?.name ?? 'Guild'} icon`} />;
  }
  return icon ?? '🛰️';
};

export default function ServerPickerPage() {
  const { guilds, selectGuild, selectedGuildId } = useSelectedGuild();
  const navigate = useNavigate();

  const sortedGuilds = useMemo(() => {
    return [...guilds].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [guilds]);

  const handleSelect = (guildId) => {
    selectGuild(guildId);
    navigate('/app');
  };

  const handleInvite = () => {
    window.open(INVITE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="server-picker">
      <div className="panel">
        <header>
          <p className="eyebrow">Server access</p>
          <h1>Select a Discord server</h1>
          <p>These are the servers you can manage. Choose one to open the dashboard or invite Plixi to another server.</p>
        </header>

        {sortedGuilds.length ? (
          <ul className="server-picker__list">
            {sortedGuilds.map((guild) => (
              <li key={guild.id}>
                <button
                  type="button"
                  className={`server-card${guild.id === selectedGuildId ? ' active' : ''}`}
                  onClick={() => handleSelect(guild.id)}
                >
                  <span className="server-card__icon" aria-hidden="true">
                    {renderGuildIcon(guild)}
                  </span>
                  <span className="server-card__meta">
                    <strong>{guild.name}</strong>
                    <span>{guild.memberCount ? `${guild.memberCount.toLocaleString()} members` : 'Member count unavailable'}</span>
                  </span>
                  {guild.premium && <span className="pill">Premium</span>}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="server-picker__empty">
            <p>No servers found for this account. Make sure your Discord user is added with manage access.</p>
          </div>
        )}

        <div className="server-picker__actions">
          <button type="button" className="primary-btn" onClick={handleInvite}>
            Invite Plixi to another server
          </button>
        </div>
      </div>
    </section>
  );
}
