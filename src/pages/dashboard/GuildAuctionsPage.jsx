import SectionHeader from '../../components/SectionHeader';
import ToggleSwitch from '../../components/ToggleSwitch';
import ModuleCard from '../../components/ModuleCard';
import SliderInput from '../../components/SliderInput';
import NumberInput from '../../components/NumberInput';
import useGuildSettings from '../../hooks/useGuildSettings';

const DEFAULT_AUCTION_APPEARANCE = { title: 'Auction House', color: '#f97316' };

export default function GuildAuctionsPage() {
  const { guild, updateGuild, saveGuild, selectedGuild, lastSaved } = useGuildSettings();
  const auctions = guild.marketplaceSuite.auctions;
  const appearance = auctions.appearance ?? DEFAULT_AUCTION_APPEARANCE;
  const isCustomized =
    appearance.title !== DEFAULT_AUCTION_APPEARANCE.title || appearance.color !== DEFAULT_AUCTION_APPEARANCE.color;

  const updateAuctions = (patch) => {
    updateGuild((prev) => ({
      ...prev,
      marketplaceSuite: { ...prev.marketplaceSuite, auctions: { ...prev.marketplaceSuite.auctions, ...patch } },
    }));
  };

  const updateAppearance = (patch) => {
    updateAuctions({ appearance: { ...(auctions.appearance ?? {}), ...patch } });
  };

  return (
    <div className="page-stack guild-dashboard">
      <SectionHeader
        eyebrow="Guild Dashboard"
        title="Auctions"
        subtitle={`Run high-stakes bidding for ${selectedGuild?.name ?? 'your guild'}.`}
        meta={<span className="status-pill">Auctions</span>}
      />

      <div className="card-grid">
        <ModuleCard icon="🏦" title="Settings" description="Enable bidding, fees, and transparent history." status={auctions.enabled ? 'Active' : 'Disabled'}>
          <ToggleSwitch label="Enable auctions" checked={auctions.enabled} onChange={(value) => updateAuctions({ enabled: value })} />
          <ToggleSwitch
            label="Allow buyouts"
            description="Let sellers set instant purchase prices."
            checked={auctions.buyoutsEnabled ?? false}
            onChange={(value) => updateAuctions({ buyoutsEnabled: value })}
          />
          <SliderInput
            label="Results per page"
            min={3}
            max={8}
            value={auctions.resultsPerPage ?? 4}
            onChange={(value) => updateAuctions({ resultsPerPage: value })}
          />
          <ToggleSwitch
            label="Auction fees"
            description="Take a platform fee when auctions resolve."
            checked={auctions.feeEnabled}
            onChange={(value) => updateAuctions({ feeEnabled: value })}
          />
          {auctions.feeEnabled && (
            <label className="text-control">
              <span>Fee percent</span>
              <NumberInput min={0} max={25} suffix="%" value={auctions.feePercent ?? 6} onChange={(value) => updateAuctions({ feePercent: value })} />
            </label>
          )}
          <p className="helper-text">Auctions live separately from the standard marketplace feed with custom settings.</p>
        </ModuleCard>

        <ModuleCard icon="🎨" title="Appearance" description="Update the auction house name and highlight color." status={isCustomized ? 'Customized' : 'Default'}>
          <label className="text-control">
            <span>Display title</span>
            <input value={appearance.title} onChange={(event) => updateAppearance({ title: event.target.value })} placeholder="Auction House" />
          </label>
          <label className="text-control">
            <span>Color</span>
            <input type="text" value={appearance.color} placeholder="#f97316" onChange={(event) => updateAppearance({ color: event.target.value })} />
          </label>
          <button type="button" className="ghost-btn" onClick={() => updateAppearance(DEFAULT_AUCTION_APPEARANCE)} disabled={!isCustomized}>
            Reset To Default
          </button>
        </ModuleCard>
      </div>

      <div className="page-actions">
        <div>
          <span>Last saved</span>
          <strong>{lastSaved ? new Date(lastSaved).toLocaleString() : 'Not yet saved'}</strong>
        </div>
        <button type="button" className="primary-btn" onClick={() => saveGuild('Auction settings saved')}>
          Save changes
        </button>
      </div>
    </div>
  );
}
