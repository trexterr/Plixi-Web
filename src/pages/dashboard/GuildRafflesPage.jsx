import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SectionHeader from '../../components/SectionHeader';
import ToggleSwitch from '../../components/ToggleSwitch';
import SliderInput from '../../components/SliderInput';
import ModuleCard from '../../components/ModuleCard';
import NumberInput from '../../components/NumberInput';
import useGuildSettings from '../../hooks/useGuildSettings';

export default function GuildRafflesPage() {
  const location = useLocation();
  const { guild, updateGuild, saveGuild, selectedGuild, lastSaved } = useGuildSettings();
  const [selectedRaffleId, setSelectedRaffleId] = useState(null);
  const activeRaffles =
    Array.isArray(guild.raffles.active) && guild.raffles.active.length
      ? guild.raffles.active
      : [
          {
            id: 'raffle-1',
            name: 'Nebula Core',
            ticketsSold: 120,
            closesIn: '6h 12m',
            creator: '@Nova',
            price: guild.raffles.ticketPrice,
            prize: guild.raffles.prizeName,
            prizeQuantity: guild.raffles.prizeQuantity,
            topBuyers: [
              { id: 'buyer-1', name: '@CosmicWhale', tickets: 32 },
              { id: 'buyer-2', name: '@NebulaVibes', tickets: 28 },
              { id: 'buyer-3', name: '@AstroNova', tickets: 24 },
              { id: 'buyer-4', name: '@StarlitPulse', tickets: 20 },
              { id: 'buyer-5', name: '@QuantumKoi', tickets: 18 },
              { id: 'buyer-6', name: '@LiquidAurora', tickets: 16 },
              { id: 'buyer-7', name: '@PrismaticRay', tickets: 14 },
              { id: 'buyer-8', name: '@OrbitRider', tickets: 12 },
              { id: 'buyer-9', name: '@PlasmaMoth', tickets: 10 },
              { id: 'buyer-10', name: '@VioletQuasar', tickets: 9 },
              { id: 'buyer-11', name: '@EchoLyric', tickets: 8 },
              { id: 'buyer-12', name: '@FrostedNova', tickets: 7 },
              { id: 'buyer-13', name: '@GlacierByte', tickets: 6 },
              { id: 'buyer-14', name: '@SolarVelvet', tickets: 5 },
              { id: 'buyer-15', name: '@MidnightRift', tickets: 4 },
              { id: 'buyer-16', name: '@PulseCascade', tickets: 3 },
              { id: 'buyer-17', name: '@HyperBloom', tickets: 3 },
              { id: 'buyer-18', name: '@LanternFlux', tickets: 2 },
              { id: 'buyer-19', name: '@ZenithMuse', tickets: 2 },
              { id: 'buyer-20', name: '@OrbitStitch', tickets: 1 },
            ],
          },
          {
            id: 'raffle-2',
            name: 'Photon Cape',
            ticketsSold: 45,
            closesIn: '18h 04m',
            creator: '@PulseOps',
            price: guild.raffles.ticketPrice,
            prize: 'Mystery Tokens',
            prizeQuantity: 2,
            topBuyers: [
              { id: 'buyer-6', name: '@Pulse', tickets: 12 },
              { id: 'buyer-7', name: '@Nova', tickets: 10 },
              { id: 'buyer-8', name: '@Glow', tickets: 6 },
              { id: 'buyer-9', name: '@Comet', tickets: 5 },
            ],
          },
        ];
  const selectedRaffle = activeRaffles.find((raffle) => raffle.id === selectedRaffleId) ?? null;
  const selectedRaffleTopBuyers = selectedRaffle
    ? Array.isArray(selectedRaffle.topBuyers)
      ? selectedRaffle.topBuyers
      : selectedRaffle.topBuyer
        ? [{ id: `${selectedRaffle.id}-top`, name: selectedRaffle.topBuyer, tickets: selectedRaffle.ticketsSold ?? 0 }]
        : []
    : [];
  const prizeQuantity = selectedRaffle?.prizeQuantity ?? guild.raffles.prizeQuantity ?? 1;
  const prevLocationKeyRef = useRef(location.key);

  useEffect(() => {
    const prevKey = prevLocationKeyRef.current;
    if (prevKey !== location.key && selectedRaffleId) {
      setSelectedRaffleId(null);
    }
    prevLocationKeyRef.current = location.key;
  }, [location.key, selectedRaffleId]);

  if (selectedRaffle) {
    return (
      <div className="page-stack guild-dashboard">
        <SectionHeader
          eyebrow="Guild Dashboard"
          title={`Raffle · ${selectedRaffle.name}`}
          subtitle="Deep dive into performance, buyers, and timing."
          meta={<span className="status-pill">Raffle details</span>}
        />

        <div className="raffle-detail">
          <div className="raffle-detail__header">
            <button type="button" className="ghost-btn ghost-btn--xs" onClick={() => setSelectedRaffleId(null)}>
              ← Back to raffles
            </button>
            <span className="status-pill">{selectedRaffle.ticketsSold ?? 0} tickets sold</span>
          </div>
          <div className="raffle-detail__layout">
            <div className="raffle-detail__buyers">
              <h4>Top buyers</h4>
              {selectedRaffleTopBuyers.length ? (
                <ul>
                  {selectedRaffleTopBuyers.slice(0, 10).map((buyer) => (
                    <li key={buyer.id ?? buyer.name}>
                      <strong>{buyer.name}</strong>
                      <span>{buyer.tickets} tickets</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="helper-text">No buyer data yet.</p>
              )}
            </div>
            <div className="raffle-detail__content">
              <div className="raffle-detail__row">
                <span>Prize</span>
                <strong>{`${selectedRaffle?.prize ?? guild.raffles.prizeName} × ${prizeQuantity}`}</strong>
              </div>
              <div className="raffle-detail__row">
                <span>Ticket price</span>
                <strong>{selectedRaffle.price ?? guild.raffles.ticketPrice}</strong>
              </div>
              <div className="raffle-detail__row">
                <span>Created by</span>
                <strong>{selectedRaffle.creator ?? 'Unknown'}</strong>
              </div>
              <div className="raffle-detail__row">
                <span>Tickets sold</span>
                <strong>{selectedRaffle.ticketsSold ?? 0}</strong>
              </div>
              <div className="raffle-detail__row">
                <span>Time left</span>
                <strong>{selectedRaffle.closesIn ?? 'No timer'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack guild-dashboard">
      <SectionHeader
        eyebrow="Guild Dashboard"
        title="Raffles"
        subtitle={`Reward funnels, ticket caps, and prize pools for ${selectedGuild?.name ?? 'your guild'}.`}
        meta={<span className="status-pill">Raffles</span>}
      />

      <div className="card-grid">
        <ModuleCard
          icon="🎟️"
          title="Raffles"
          description="Ticket pricing, prize pools, durations, and logging."
          status="Active"
        >
          <label className="text-control">
            <span>Prize type</span>
            <select
              value={guild.raffles.prizeMode}
              onChange={(event) => updateGuild((prev) => ({ ...prev, raffles: { ...prev.raffles, prizeMode: event.target.value } }))}
            >
              <option value="item">Item</option>
              <option value="currency">Currency</option>
            </select>
          </label>
          <label className="text-control">
            <span>Prize name / amount</span>
            <input
              value={guild.raffles.prizeName}
              onChange={(event) => updateGuild((prev) => ({ ...prev, raffles: { ...prev.raffles, prizeName: event.target.value } }))}
            />
          </label>
          <label className="text-control">
            <span>Prize quantity</span>
            <NumberInput
              min={1}
              value={guild.raffles.prizeQuantity}
              onChange={(value) => updateGuild((prev) => ({ ...prev, raffles: { ...prev.raffles, prizeQuantity: value } }))}
            />
          </label>
          <SliderInput
            label="Duration (days)"
            min={1}
            max={30}
            value={guild.raffles.durationDays}
            onChange={(value) => updateGuild((prev) => ({ ...prev, raffles: { ...prev.raffles, durationDays: value } }))}
          />
          <ToggleSwitch
            label="Scaling prize pool"
            description="Premium upsell — pot grows as tickets sell."
            checked={guild.raffles.scalingPot}
            onChange={(value) => updateGuild((prev) => ({ ...prev, raffles: { ...prev.raffles, scalingPot: value } }))}
          />
          <SliderInput
            label="Prize pool contribution %"
            min={0}
            max={100}
            value={guild.raffles.prizePoolPercent}
            onChange={(value) =>
              updateGuild((prev) => ({ ...prev, raffles: { ...prev.raffles, prizePoolPercent: value } }))
            }
          />
          <ToggleSwitch
            label="Raffle history logs"
            checked={guild.raffles.logHistory}
            onChange={(value) => updateGuild((prev) => ({ ...prev, raffles: { ...prev.raffles, logHistory: value } }))}
          />
          {guild.raffles.logHistory && (
            <label className="text-control">
              <span>History channel</span>
              <input
                value={guild.raffles.logChannel}
                onChange={(event) => updateGuild((prev) => ({ ...prev, raffles: { ...prev.raffles, logChannel: event.target.value } }))}
              />
            </label>
          )}
        </ModuleCard>

        <ModuleCard
          icon="📣"
          title="Active raffles"
          description="Live events members can join right now."
          status={`${activeRaffles.length}/${guild.raffles.activeLimit} live`}
        >
          {activeRaffles.length ? (
            <ul className="raffle-summary">
              {activeRaffles.map((raffle) => (
                <li key={raffle.id}>
                  <div>
                    <strong>{raffle.name}</strong>
                    <span>{raffle.closesIn ? `Closes in ${raffle.closesIn}` : 'No timer'}</span>
                  </div>
                  <p>{raffle.ticketsSold ?? 0} tickets sold</p>
                  <div className="raffle-summary__actions">
                    <button type="button" className="ghost-btn ghost-btn--xs" onClick={() => setSelectedRaffleId(raffle.id)}>
                      View stats
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="helper-text">No active raffles right now. Launch one to hype your community.</p>
          )}
        </ModuleCard>
      </div>

      <div className="page-actions">
        <div>
          <span>Last saved</span>
          <strong>{lastSaved ? new Date(lastSaved).toLocaleString() : 'Not yet saved'}</strong>
        </div>
        <button type="button" className="primary-btn" onClick={() => saveGuild('Raffles settings saved')}>
          Save changes
        </button>
      </div>
    </div>
  );
}
