import SectionHeader from '../../components/SectionHeader';
import ToggleSwitch from '../../components/ToggleSwitch';
import ModuleCard from '../../components/ModuleCard';
import useGuildSettings from '../../hooks/useGuildSettings';

export default function GuildTradesPage() {
  const { guild, updateGuild, saveGuild, selectedGuild, lastSaved } = useGuildSettings();
  const trading = guild.marketplaceSuite.trading;

  const updateTrading = (patch) => {
    updateGuild((prev) => ({
      ...prev,
      marketplaceSuite: { ...prev.marketplaceSuite, trading: { ...prev.marketplaceSuite.trading, ...patch } },
    }));
  };

  return (
    <div className="page-stack guild-dashboard">
      <SectionHeader
        eyebrow="Guild Dashboard"
        title="Trades & Gifts"
        subtitle={`Regulate peer-to-peer trades and gifting permissions for ${selectedGuild?.name ?? 'your guild'}.`}
        meta={<span className="status-pill">Trades</span>}
      />

      <div className="card-grid">
        <ModuleCard icon="🤝" title="Trading" description="Enable direct exchanges between members." status={trading.enabled ? 'Active' : 'Disabled'}>
          <ToggleSwitch label="Enable trading" checked={trading.enabled} onChange={(value) => updateTrading({ enabled: value })} />
        </ModuleCard>
        <ModuleCard icon="🎁" title="Gifting" description="Allow members to send items without a trade." status={trading.giftingEnabled ? 'Active' : 'Disabled'}>
          <ToggleSwitch
            label="Enable gifting"
            checked={trading.giftingEnabled}
            disabled={!trading.enabled}
            onChange={(value) => updateTrading({ giftingEnabled: value })}
          />
        </ModuleCard>
      </div>

      <div className="page-actions">
        <div>
          <span>Last saved</span>
          <strong>{lastSaved ? new Date(lastSaved).toLocaleString() : 'Not yet saved'}</strong>
        </div>
        <button type="button" className="primary-btn" onClick={() => saveGuild('Trades and gifts saved')}>
          Save changes
        </button>
      </div>
    </div>
  );
}
