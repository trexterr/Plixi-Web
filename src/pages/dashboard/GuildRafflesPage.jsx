import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SectionHeader from '../../components/SectionHeader';
import ToggleSwitch from '../../components/ToggleSwitch';
import ModuleCard from '../../components/ModuleCard';
import NumberInput from '../../components/NumberInput';
import useGuildSettings from '../../hooks/useGuildSettings';

export default function GuildRafflesPage() {
  const location = useLocation();
  const { guild, updateGuild, saveGuild, selectedGuild, lastSaved } = useGuildSettings();
  const [selectedRaffleId, setSelectedRaffleId] = useState(null);
  const [newRaffle, setNewRaffle] = useState(() => ({
    name: '',
    ticketPrice: guild.raffles.ticketPrice ?? 0,
    prizeName: '',
    prizeQuantity: guild.raffles.prizeQuantity ?? 1,
    durationValue: guild.raffles.durationDays ?? 1,
    durationUnit: 'days',
  }));
  const rafflesEnabled = guild.raffles.enabled !== false;
  const activeRaffles =
    !rafflesEnabled
      ? []
      : Array.isArray(guild.raffles.active) && guild.raffles.active.length
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
  const activeLimit = guild.raffles.activeLimit ?? Infinity;
  const remainingSlots = Math.max(activeLimit - activeRaffles.length, 0);
  const slotLabel =
    remainingSlots === Infinity
      ? '∞ slots open'
      : `${remainingSlots} ${remainingSlots === 1 ? 'slot' : 'slots'} open`;
  const durationInvalid =
    !Number.isFinite(newRaffle.durationValue) ||
    !Number.isInteger(newRaffle.durationValue) ||
    newRaffle.durationValue < 1;
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
  const createRaffleDisabled = !rafflesEnabled || remainingSlots <= 0;
  const canCreateRaffle =
    rafflesEnabled && newRaffle.name.trim().length > 0 && newRaffle.prizeName.trim().length > 0;

  useEffect(() => {
    const prevKey = prevLocationKeyRef.current;
    if (prevKey !== location.key && selectedRaffleId) {
      setSelectedRaffleId(null);
    }
    prevLocationKeyRef.current = location.key;
  }, [location.key, selectedRaffleId]);

  useEffect(() => {
    setNewRaffle((prev) => ({
      ...prev,
      ticketPrice: guild.raffles.ticketPrice ?? prev.ticketPrice ?? 0,
      prizeQuantity: guild.raffles.prizeQuantity ?? prev.prizeQuantity ?? 1,
      durationValue: guild.raffles.durationDays ?? prev.durationValue ?? 1,
    }));
  }, [guild.raffles.ticketPrice, guild.raffles.prizeQuantity, guild.raffles.durationDays]);

  const handleCreateRaffle = () => {
    if (!canCreateRaffle || durationInvalid) return;
    const next = {
      id: `raffle-${Date.now()}`,
      name: newRaffle.name.trim(),
      ticketsSold: 0,
      closesIn: `${newRaffle.durationValue}${newRaffle.durationUnit === 'minutes' ? 'm' : newRaffle.durationUnit === 'hours' ? 'h' : 'd'}`,
      creator: '@You',
      price: newRaffle.ticketPrice,
      prize: newRaffle.prizeName.trim(),
      prizeQuantity: newRaffle.prizeQuantity,
      durationUnit: newRaffle.durationUnit,
      durationValue: newRaffle.durationValue,
      topBuyers: [],
    };
    updateGuild((prev) => ({
      ...prev,
      raffles: {
        ...prev.raffles,
        active: [...(Array.isArray(prev.raffles.active) ? prev.raffles.active : []), next],
      },
    }));
    setNewRaffle({
      name: '',
      ticketPrice: guild.raffles.ticketPrice ?? 0,
      prizeName: '',
      prizeQuantity: guild.raffles.prizeQuantity ?? 1,
      durationValue: guild.raffles.durationDays ?? 1,
      durationUnit: newRaffle.durationUnit,
    });
  };

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
        meta={<span className="status-pill">{rafflesEnabled ? 'Raffles live' : 'Disabled'}</span>}
      />

      <div className="card-grid">
        <ModuleCard
          icon="⚙️"
          title="Settings"
          description="Ticket pricing, prize pools, durations, and logging."
          status={rafflesEnabled ? 'Active' : 'Disabled'}
        >
          <ToggleSwitch
            label="Enable raffles"
            checked={guild.raffles.enabled}
            onChange={(value) => updateGuild((prev) => ({ ...prev, raffles: { ...prev.raffles, enabled: value } }))}
          />
        </ModuleCard>

        <ModuleCard
          icon="📣"
          title="Active Raffles"
          description="Live events members can join right now."
          status={
            rafflesEnabled
              ? `${activeRaffles.length}/${activeLimit === Infinity ? '∞' : activeLimit} live`
              : 'Disabled'
          }
        >
          {!rafflesEnabled ? (
            <p className="helper-text">Raffles are disabled. Enable them to view live events.</p>
          ) : activeRaffles.length ? (
            <ul className="raffle-summary">
              {activeRaffles.map((raffle) => (
                <li key={raffle.id}>
                  <div className="raffle-summary__header">
                    <div className="raffle-summary__title">
                      <strong>{raffle.name}</strong>
                      <p>{raffle.ticketsSold ?? 0} tickets sold</p>
                    </div>
                    <span className="raffle-summary__timer">
                      {raffle.closesIn ? `Closes in ${raffle.closesIn}` : 'No timer'}
                    </span>
                  </div>
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

        <ModuleCard
          icon="🎟️"
          title="Create Raffle"
          description="Spin up a new event with preset pricing."
          status={
            rafflesEnabled
              ? slotLabel
              : 'Disabled'
          }
        >
          <label className="text-control">
            <span>Raffle name</span>
            <input
              value={newRaffle.name}
              onChange={(event) => setNewRaffle((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Nebula Eclipse"
              disabled={createRaffleDisabled}
            />
          </label>
          <label className="text-control">
            <span>Ticket price</span>
            <NumberInput
              min={0}
              value={newRaffle.ticketPrice}
              onChange={(value) => setNewRaffle((prev) => ({ ...prev, ticketPrice: value }))}
              disabled={createRaffleDisabled}
            />
          </label>
          <label className="text-control">
            <span>Prize name</span>
            <input
              value={newRaffle.prizeName}
              onChange={(event) => setNewRaffle((prev) => ({ ...prev, prizeName: event.target.value }))}
              placeholder="Mythic Token"
              disabled={createRaffleDisabled}
            />
          </label>
          <label className="text-control">
            <span>Prize quantity</span>
            <NumberInput
              min={1}
              value={newRaffle.prizeQuantity}
              onChange={(value) => setNewRaffle((prev) => ({ ...prev, prizeQuantity: value }))}
              disabled={createRaffleDisabled}
            />
          </label>
          <label className={`text-control ${durationInvalid ? 'has-error' : ''}`}>
            <span>Duration</span>
            <div className="duration-input">
              <NumberInput
                min={1}
                step={1}
                value={newRaffle.durationValue}
                onChange={(value) => setNewRaffle((prev) => ({ ...prev, durationValue: value }))}
                disabled={createRaffleDisabled}
              />
              <select
                value={newRaffle.durationUnit}
                onChange={(event) => setNewRaffle((prev) => ({ ...prev, durationUnit: event.target.value }))}
                disabled={createRaffleDisabled}
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
            {durationInvalid && <p className="error-text">Duration must be a whole number.</p>}
          </label>
          <div className="module-card__actions">
            <button
              type="button"
              className="primary-btn"
              disabled={createRaffleDisabled || !canCreateRaffle || durationInvalid}
              onClick={handleCreateRaffle}
            >
              Create raffle
            </button>
          </div>
          {!rafflesEnabled && <p className="helper-text">Enable raffles to create a new event.</p>}
          {rafflesEnabled && remainingSlots <= 0 && (
            <p className="helper-text">You're at capacity. Remove a raffle to free a slot.</p>
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
