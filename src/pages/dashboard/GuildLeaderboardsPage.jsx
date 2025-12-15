import SectionHeader from '../../components/SectionHeader';
import SettingCard from '../../components/SettingCard';
import ToggleSwitch from '../../components/ToggleSwitch';
import TierSection from '../../components/TierSection';
import useGuildSettings from '../../hooks/useGuildSettings';

const CADENCES = ['daily', 'weekly', 'monthly', 'yearly', 'seasonal'];

export default function GuildLeaderboardsPage() {
  const { guild, updateGuild, saveGuild, selectedGuild, lastSaved } = useGuildSettings();

  const toggleCadence = (cadence) => {
    updateGuild((prev) => {
      const exists = prev.leaderboards.cadences.includes(cadence);
      return {
        ...prev,
        leaderboards: {
          ...prev.leaderboards,
          cadences: exists
            ? prev.leaderboards.cadences.filter((entry) => entry !== cadence)
            : [...prev.leaderboards.cadences, cadence],
        },
      };
    });
  };

  const updatePermissions = (field, value) => {
    updateGuild((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [field]: value.split('\n').map((entry) => entry.trim()).filter(Boolean) },
    }));
  };

  return (
    <div className="page-stack guild-dashboard">
      <SectionHeader
        eyebrow="Guild Dashboard"
        title="Leaderboards & Permissions"
        subtitle={`Expose cadences and gate commands for ${selectedGuild?.name ?? 'your guild'}.`}
        meta={<span className="status-pill">Leaderboards</span>}
      />

      <TierSection title="Core leaderboards" description="Currency, items, and cadence toggles.">
        <SettingCard title="Leaderboards" description="Currency, items, and cadence toggles.">
          <ToggleSwitch
            label="Enable leaderboards"
            checked={guild.leaderboards.enabled}
            onChange={(value) =>
              updateGuild((prev) => ({ ...prev, leaderboards: { ...prev.leaderboards, enabled: value } }))
            }
          />
          <ToggleSwitch
            label="Currency leaderboard"
            checked={guild.leaderboards.currency}
            onChange={(value) =>
              updateGuild((prev) => ({ ...prev, leaderboards: { ...prev.leaderboards, currency: value } }))
            }
          />
          <ToggleSwitch
            label="Item leaderboard"
            checked={guild.leaderboards.items}
            onChange={(value) =>
              updateGuild((prev) => ({ ...prev, leaderboards: { ...prev.leaderboards, items: value } }))
            }
          />
          <div className="cadence-grid">
            {CADENCES.map((cadence) => (
              <label key={cadence} className="checkbox">
                <input
                  type="checkbox"
                  checked={guild.leaderboards.cadences.includes(cadence)}
                  onChange={() => toggleCadence(cadence)}
                />
                <span>{cadence}</span>
              </label>
            ))}
          </div>
        </SettingCard>
      </TierSection>

      <TierSection title="Permissions & roles" description="Who can run what, plus block lists." tier="advanced">
        <SettingCard title="Permissions & roles" description="Who can run what, plus block lists.">
          <label className="text-control">
            <span>Admin roles</span>
            <textarea
              rows={3}
              value={guild.permissions.adminRoles.join('\n')}
              onChange={(event) => updatePermissions('adminRoles', event.target.value)}
            />
          </label>
          <label className="text-control">
            <span>Restricted roles</span>
            <textarea
              rows={3}
              value={guild.permissions.blockedRoles.join('\n')}
              onChange={(event) => updatePermissions('blockedRoles', event.target.value)}
            />
          </label>
          <label className="text-control">
            <span>Command restrictions</span>
            <textarea
              rows={3}
              placeholder="/pay, /gift..."
              value={guild.permissions.commandRestrictions.join('\n')}
              onChange={(event) => updatePermissions('commandRestrictions', event.target.value)}
            />
          </label>
        </SettingCard>
      </TierSection>

      <div className="page-actions">
        <div>
          <span>Last saved</span>
          <strong>{lastSaved ? new Date(lastSaved).toLocaleString() : 'Not yet saved'}</strong>
        </div>
        <button type="button" className="primary-btn" onClick={() => saveGuild('Leaderboard settings saved')}>
          Save changes
        </button>
      </div>
    </div>
  );
}
