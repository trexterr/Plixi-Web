import SectionHeader from '../../components/SectionHeader';
import ToggleSwitch from '../../components/ToggleSwitch';
import SliderInput from '../../components/SliderInput';
import ModuleCard from '../../components/ModuleCard';
import NumberInput from '../../components/NumberInput';
import useGuildSettings from '../../hooks/useGuildSettings';

const DEFAULT_APPEARANCE = { title: 'Marketplace', color: '#7c3aed' };

export default function GuildMarketplacePage() {
  const { guild, updateGuild, saveGuild, selectedGuild, lastSaved } = useGuildSettings();
  const appearance = guild.marketplaceSuite.appearance ?? DEFAULT_APPEARANCE;
  const isCustomized = appearance.title !== DEFAULT_APPEARANCE.title || appearance.color !== DEFAULT_APPEARANCE.color;

  const updateAppearance = (patch) => {
    updateGuild((prev) => ({
      ...prev,
      marketplaceSuite: {
        ...prev.marketplaceSuite,
        appearance: { ...(prev.marketplaceSuite.appearance ?? {}), ...patch },
      },
    }));
  };

  return (
    <div className="page-stack guild-dashboard">
      <SectionHeader
        eyebrow="Guild Dashboard"
        title="Marketplace & Trades"
        subtitle={`Shape listings, pagination, and peer-to-peer flows for ${selectedGuild?.name ?? 'your guild'}.`}
        meta={<span className="status-pill">Marketplace</span>}
      />

      <div className="card-grid">
        <ModuleCard icon="🛒" title="Settings" description="Listings, pagination, and taxes." status={guild.marketplaceSuite.enabled ? 'Active' : 'Disabled'}>
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
            <label className="text-control">
              <span>Fee percent</span>
              <NumberInput
                min={0}
                max={25}
                suffix="%"
                value={guild.marketplaceSuite.feePercent}
                onChange={(value) =>
                  updateGuild((prev) => ({ ...prev, marketplaceSuite: { ...prev.marketplaceSuite, feePercent: value } }))
                }
              />
            </label>
          )}
        </ModuleCard>

        <ModuleCard icon="🎨" title="Appearance" description="Update the marketplace name and color accents." status={isCustomized ? 'Customized' : 'Default'}>
          <label className="text-control">
            <span>Display title</span>
            <input value={appearance.title} onChange={(event) => updateAppearance({ title: event.target.value })} placeholder="Marketplace" />
          </label>
          <label className="text-control">
            <span>Color</span>
            <input
              type="text"
              value={appearance.color}
              placeholder="#7c3aed"
              onChange={(event) => updateAppearance({ color: event.target.value })}
            />
          </label>
          <button type="button" className="ghost-btn" onClick={() => updateAppearance(DEFAULT_APPEARANCE)} disabled={!isCustomized}>
            Reset To Default
          </button>
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
