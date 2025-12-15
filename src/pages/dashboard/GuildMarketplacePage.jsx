import SectionHeader from '../../components/SectionHeader';
import ToggleSwitch from '../../components/ToggleSwitch';
import SliderInput from '../../components/SliderInput';
import ModuleCard from '../../components/ModuleCard';
import useGuildSettings from '../../hooks/useGuildSettings';

export default function GuildMarketplacePage() {
  const { guild, updateGuild, saveGuild, selectedGuild, lastSaved } = useGuildSettings();

  return (
    <div className="page-stack guild-dashboard">
      <SectionHeader
        eyebrow="Guild Dashboard"
        title="Marketplace & Trades"
        subtitle={`Shape listings, pagination, and peer-to-peer flows for ${selectedGuild?.name ?? 'your guild'}.`}
        meta={<span className="status-pill">Marketplace</span>}
      />

      <div className="card-grid">
        <ModuleCard
          icon="🛒"
          title="Marketplace core"
          description="Listings, pagination, and taxes."
          status={guild.marketplaceSuite.enabled ? 'Active' : 'Disabled'}
        >
          <ToggleSwitch
            label="Enable marketplace"
            checked={guild.marketplaceSuite.enabled}
            onChange={(value) =>
              updateGuild((prev) => ({ ...prev, marketplaceSuite: { ...prev.marketplaceSuite, enabled: value } }))
            }
          />
          <SliderInput
            label="Results per page"
            min={3}
            max={8}
            value={guild.marketplaceSuite.resultsPerPage}
            onChange={(value) =>
              updateGuild((prev) => ({ ...prev, marketplaceSuite: { ...prev.marketplaceSuite, resultsPerPage: value } }))
            }
          />
          <ToggleSwitch
            label="Marketplace fees"
            description="Take a % cut when enabled."
            checked={guild.marketplaceSuite.feesEnabled}
            onChange={(value) =>
              updateGuild((prev) => ({ ...prev, marketplaceSuite: { ...prev.marketplaceSuite, feesEnabled: value } }))
            }
          />
          {guild.marketplaceSuite.feesEnabled && (
            <SliderInput
              label="Fee percent"
              min={0}
              max={25}
              value={guild.marketplaceSuite.feePercent}
              onChange={(value) =>
                updateGuild((prev) => ({ ...prev, marketplaceSuite: { ...prev.marketplaceSuite, feePercent: value } }))
              }
            />
          )}
        </ModuleCard>

        <ModuleCard
          icon="🤝"
          title="Trades & gifts"
          description="Peer-to-peer transfers and logging."
          status={guild.marketplaceSuite.trading.enabled ? 'Active' : 'Disabled'}
        >
          <ToggleSwitch
            label="Enable trading"
            checked={guild.marketplaceSuite.trading.enabled}
            onChange={(value) =>
              updateGuild((prev) => ({
                ...prev,
                marketplaceSuite: {
                  ...prev.marketplaceSuite,
                  trading: { ...prev.marketplaceSuite.trading, enabled: value },
                },
              }))
            }
          />
          <ToggleSwitch
            label="Enable gifting"
            checked={guild.marketplaceSuite.trading.giftingEnabled}
            onChange={(value) =>
              updateGuild((prev) => ({
                ...prev,
                marketplaceSuite: {
                  ...prev.marketplaceSuite,
                  trading: { ...prev.marketplaceSuite.trading, giftingEnabled: value },
                },
              }))
            }
          />
          <ToggleSwitch
            label="Trade logs"
            checked={guild.marketplaceSuite.trading.tradeLogs}
            onChange={(value) =>
              updateGuild((prev) => ({
                ...prev,
                marketplaceSuite: {
                  ...prev.marketplaceSuite,
                  trading: { ...prev.marketplaceSuite.trading, tradeLogs: value },
                },
              }))
            }
          />
          {guild.marketplaceSuite.trading.tradeLogs && (
            <label className="text-control">
              <span>Trade log channel</span>
              <input
                value={guild.marketplaceSuite.trading.tradeChannel}
                onChange={(event) =>
                  updateGuild((prev) => ({
                    ...prev,
                    marketplaceSuite: {
                      ...prev.marketplaceSuite,
                      trading: { ...prev.marketplaceSuite.trading, tradeChannel: event.target.value },
                    },
                  }))
                }
              />
            </label>
          )}
        </ModuleCard>
      </div>

      <div className="page-actions">
        <div>
          <span>Last saved</span>
          <strong>{lastSaved ? new Date(lastSaved).toLocaleString() : 'Not yet saved'}</strong>
        </div>
        <button type="button" className="primary-btn" onClick={() => saveGuild('Marketplace settings saved')}>
          Save changes
        </button>
      </div>
    </div>
  );
}
