import { useEffect, useMemo, useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import ModuleCard from '../../components/ModuleCard';
import NumberInput from '../../components/NumberInput';
import useGuildSettings from '../../hooks/useGuildSettings';

const SLOT_BATCH_SIZE = 8;

const uniqueId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;

const createSlotPayload = (index = 1) => ({
  id: `slot-${uniqueId()}`,
  label: `Slot ${index}`,
  itemName: '',
  price: '',
  stock: '',
  featured: false,
});

const createSlotBatch = (count = SLOT_BATCH_SIZE) => Array.from({ length: count }, (_, index) => createSlotPayload(index + 1));

export default function GuildShopPage() {
  const { guild, updateGuild, saveGuild, selectedGuild, lastSaved } = useGuildSettings();
  const serverShop = guild.serverShop;
  const layoutLabel = serverShop.layout ?? 'grid';
  const layoutStatus = layoutLabel.charAt(0).toUpperCase() + layoutLabel.slice(1);
  const backgroundStyle = serverShop.backgroundStyle ?? 'default';
  const accentColor = serverShop.accentColor || '#0ea5e9';
  const randomizedPool = serverShop.randomizedPool ?? [];
  const schedule = serverShop.schedule ?? [];
  const [selectedDate, setSelectedDate] = useState(() => schedule[0]?.date ?? '');
  const [expandedSlotId, setExpandedSlotId] = useState(null);
  const [activeEditor, setActiveEditor] = useState(null);
  const [isAppearancePreviewing, setIsAppearancePreviewing] = useState(false);

  const updateServerShop = (patch) => {
    updateGuild((prev) => ({ ...prev, serverShop: { ...prev.serverShop, ...patch } }));
  };

  const updateRandomizedPool = (updater) => {
    updateServerShop({
      randomizedPool:
        typeof updater === 'function' ? updater(serverShop.randomizedPool ?? []) : updater ?? [],
    });
  };

  const updateScheduleState = (updater) => {
    updateServerShop({
      schedule: typeof updater === 'function' ? updater(serverShop.schedule ?? []) : updater ?? [],
    });
  };

  const currentScheduleDay = useMemo(() => {
    if (!selectedDate) return null;
    return schedule.find((day) => day.date === selectedDate) ?? null;
  }, [schedule, selectedDate]);

  const previewEntries = serverShop.itemMode === 'scheduled' ? currentScheduleDay?.slots ?? [] : randomizedPool;

  useEffect(() => {
    if (activeEditor !== 'scheduled') {
      setExpandedSlotId(null);
      return;
    }

    if (!schedule.length) {
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
      updateScheduleState((days) => [
        ...days,
        {
          id: `schedule-day-${uniqueId()}`,
          date: today,
          slots: createSlotBatch(),
        },
      ]);
      return;
    }

    if (!selectedDate || !schedule.some((day) => day.date === selectedDate)) {
      setSelectedDate(schedule[0].date);
    }
  }, [activeEditor, schedule, selectedDate, updateScheduleState]);

  useEffect(() => {
    if (!schedule?.length) return;
    const needsPadding = schedule.some((day) => day.slots.length < SLOT_BATCH_SIZE);
    if (!needsPadding) return;
    updateScheduleState((days) =>
      days.map((day) => {
        if (day.slots.length >= SLOT_BATCH_SIZE) return day;
        const nextSlots = [...day.slots];
        while (nextSlots.length < SLOT_BATCH_SIZE) {
          nextSlots.push(createSlotPayload(nextSlots.length + 1));
        }
        return { ...day, slots: nextSlots };
      }),
    );
  }, [schedule, updateScheduleState]);

  const addPoolEntry = () => {
    updateRandomizedPool((pool) => {
      const next = [
        ...pool,
        { id: `pool-item-${uniqueId()}`, name: 'New item' },
      ];
      return next;
    });
  };

  const updatePoolEntry = (id, patch) => {
    updateRandomizedPool((pool) => pool.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  };

  const removePoolEntry = (id) => {
    updateRandomizedPool((pool) => pool.filter((entry) => entry.id !== id));
  };

  const ensureScheduleDay = (date) => {
    if (!date) return;
    if (schedule.some((day) => day.date === date)) return;
    updateScheduleState((days) => [
      ...days,
      {
        id: `schedule-day-${uniqueId()}`,
        date,
        slots: createSlotBatch(),
      },
    ]);
  };

  const handleDateSelect = (value) => {
    if (!value) return;
    ensureScheduleDay(value);
    setSelectedDate(value);
  };

  const updateSlot = (dayId, slotId, patch) => {
    updateScheduleState((days) =>
      days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              slots: day.slots.map((slot) => (slot.id === slotId ? { ...slot, ...patch } : slot)),
            }
          : day,
      ),
    );
  };

  const addSlot = (dayId) => {
    updateScheduleState((days) =>
      days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              slots: [...day.slots, createSlotPayload(day.slots.length + 1)],
            }
          : day,
      ),
    );
  };

  const removeSlot = (dayId, slotId) => {
    updateScheduleState((days) =>
      days.map((day) =>
        day.id === dayId ? { ...day, slots: day.slots.filter((slot) => slot.id !== slotId) } : day,
      ),
    );
    if (expandedSlotId === slotId) {
      setExpandedSlotId(null);
    }
  };

  const handleEditorOpen = (mode) => {
    if (mode === 'scheduled') {
      if (!schedule.length) {
        const today = new Date().toISOString().split('T')[0];
        ensureScheduleDay(today);
        setSelectedDate(today);
      } else if (!selectedDate) {
        setSelectedDate(schedule[0].date);
      }
    }
    setActiveEditor(mode);
  };

  const handleEditorClose = () => {
    setActiveEditor(null);
    setExpandedPoolId(null);
    setExpandedSlotId(null);
  };

  const handleAppearanceReset = () => {
    updateServerShop({
      accentColor: '#0ea5e9',
      backgroundStyle: 'default',
      layout: 'grid',
    });
  };

  const previewModeLabel = serverShop.itemMode === 'scheduled' ? 'Scheduled' : 'Randomized';

  const renderPreviewItems = (entries, scheduled) => (
    <div className={`shop-preview__canvas shop-preview__canvas--${backgroundStyle}`}>
      <header className="shop-preview__header">
        <div>
          <p>{serverShop.description || 'Rotating curated shop.'}</p>
          <strong>{serverShop.name}</strong>
        </div>
        <span className="shop-preview__accent" style={{ background: accentColor }}>
          {scheduled ? 'Scheduled' : 'Randomized'}
        </span>
      </header>
      <ul className="shop-preview__items">
        {entries.length ? (
          entries.map((entry, index) => {
            const entryName = scheduled ? entry.itemName || `Slot ${index + 1}` : entry.name;
            const stockLabel =
              entry.stock === '' || entry.stock === null || typeof entry.stock === 'undefined'
                ? 'Std stock'
                : `${entry.stock} in stock`;
            const meta = scheduled
              ? `${stockLabel}${entry.featured ? ' · Featured' : ''}`
              : `${entry.weight ? `${entry.weight} weight` : 'Even odds'}${
                  entry.stock ? ` · ${stockLabel}` : ''
                }`;
            return (
              <li key={entry.id}>
                <div>
                  <strong>{entryName || 'Unnamed item'}</strong>
                  <span>{meta}</span>
                </div>
                <span className="shop-preview__price" style={{ color: accentColor }}>
                  {entry.price ? `${entry.price} credits` : 'Base price'}
                </span>
              </li>
            );
          })
        ) : (
          <li className="shop-preview__empty">
            <p>{scheduled ? 'Select a day and add slots.' : 'Add entries to the pool.'}</p>
          </li>
        )}
      </ul>
    </div>
  );

  const renderAppearanceCard = (locked = false) => (
    <ModuleCard
      icon="🎨"
      title="Appearance & Format"
      description="Dial in color accents, backgrounds, and layout."
      status={layoutStatus}
      lockedOpen={locked}
    >
      <label className="text-control">
        <span>Color</span>
        <input
          value={serverShop.accentColor || ''}
          placeholder="#0ea5e9"
          onChange={(event) => updateServerShop({ accentColor: event.target.value })}
        />
      </label>
      <label className="text-control">
        <span>Background</span>
        <select value={serverShop.backgroundStyle || 'default'} onChange={(event) => updateServerShop({ backgroundStyle: event.target.value })}>
          <option value="default">Default</option>
          <option value="aurora">Aurora</option>
          <option value="carbon">Carbon</option>
        </select>
      </label>
      <label className="text-control">
        <span>Layout</span>
        <select value={serverShop.layout || 'grid'} onChange={(event) => updateServerShop({ layout: event.target.value })}>
          <option value="grid">Grid</option>
          <option value="stacked">Stacked</option>
          <option value="carousel">Carousel</option>
        </select>
      </label>
      <div className="appearance-reset">
        <button type="button" className="ghost-btn ghost-btn--small" onClick={handleAppearanceReset}>
          Reset To Default
        </button>
      </div>
      {!locked && (
        <div className="box-editor-launch">
          <button type="button" className="primary-btn" onClick={() => setIsAppearancePreviewing(true)}>
            See preview
          </button>
          <p className="helper-text">Open a focused preview with larger layout and color sample.</p>
        </div>
      )}
    </ModuleCard>
  );

  const renderAppearancePreviewPanel = () => (
    <div className="appearance-preview__panel">{renderPreviewItems(previewEntries, serverShop.itemMode === 'scheduled')}</div>
  );

  const clearRandomizedPool = () => {
    updateRandomizedPool([]);
  };

  const renderRandomizedEditor = () => (
    <div className="job-editor shop-pool-editor">
      <div className="job-editor__top">
        <strong className="job-editor__title">Randomized pool</strong>
        <div className="job-editor__actions">
          <button type="button" className="ghost-btn ghost-btn--xs" onClick={addPoolEntry}>
            + Add entry
          </button>
          <button type="button" className="ghost-btn ghost-btn--xs" onClick={clearRandomizedPool} disabled={!randomizedPool.length}>
            Clear pool
          </button>
        </div>
        <div className="job-editor__top-right">
          <span className="status-pill">{randomizedPool.length} items</span>
        </div>
      </div>
      <div className="job-editor__body">
        {randomizedPool.length ? (
          <ul className="job-list pool-list">
            {randomizedPool.map((entry) => (
              <li key={entry.id}>
                <input
                  value={entry.name}
                  placeholder="Item name"
                  onChange={(event) => updatePoolEntry(entry.id, { name: event.target.value })}
                />
                <button type="button" className="list-icon-btn" onClick={() => removePoolEntry(entry.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="helper-text">No entries yet. Add an item to start.</p>
        )}
      </div>
    </div>
  );

  const renderScheduledEditor = () => (
    <div className="shop-mode-editor">
      <div className="shop-mode-editor__left">
        <label className="text-control">
          <span>Select date</span>
          <input type="date" value={selectedDate} onChange={(event) => handleDateSelect(event.target.value)} />
        </label>
        {schedule.length > 1 && (
          <div className="schedule-day-picker">
            {schedule
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((day) => (
                <button type="button" key={day.id} className={day.date === selectedDate ? 'is-active' : ''} onClick={() => handleDateSelect(day.date)}>
                  {new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </button>
              ))}
          </div>
        )}
        {currentScheduleDay ? (
          <>
            <div className="slot-accordion">
              {currentScheduleDay.slots.map((slot, index) => {
                const isOpen = expandedSlotId === slot.id;
                return (
                  <div key={slot.id} className={`slot-accordion__item ${isOpen ? 'is-open' : ''}`}>
                    <button type="button" className="slot-accordion__toggle" onClick={() => setExpandedSlotId(isOpen ? null : slot.id)}>
                      <div>
                        <strong>{slot.label || `Slot ${index + 1}`}</strong>
                        <span>{slot.itemName || 'Empty slot'}</span>
                      </div>
                      <span>{isOpen ? '▴' : '▾'}</span>
                    </button>
                    {isOpen && (
                      <div className="slot-accordion__body">
                        <label className="text-control">
                          <span>Display label</span>
                          <input value={slot.label} onChange={(event) => updateSlot(currentScheduleDay.id, slot.id, { label: event.target.value })} />
                        </label>
                        <label className="text-control">
                          <span>Item</span>
                          <input value={slot.itemName} onChange={(event) => updateSlot(currentScheduleDay.id, slot.id, { itemName: event.target.value })} />
                        </label>
                        <label className="text-control">
                          <span>Price override</span>
                          <NumberInput min={0} value={slot.price === '' ? '' : slot.price} onChange={(value) => updateSlot(currentScheduleDay.id, slot.id, { price: value })} />
                        </label>
                        <label className="text-control">
                          <span>Stock</span>
                          <NumberInput min={0} value={slot.stock === '' ? '' : slot.stock} onChange={(value) => updateSlot(currentScheduleDay.id, slot.id, { stock: value })} />
                        </label>
                        <label className="checkbox">
                          <input type="checkbox" checked={slot.featured} onChange={(event) => updateSlot(currentScheduleDay.id, slot.id, { featured: event.target.checked })} />
                          <span>Mark as featured</span>
                        </label>
                        <button type="button" className="list-icon-btn" onClick={() => removeSlot(currentScheduleDay.id, slot.id)}>
                          Remove slot
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button type="button" className="ghost-btn ghost-btn--small" onClick={() => addSlot(currentScheduleDay.id)}>
              + Add slot
            </button>
          </>
        ) : (
          <p className="helper-text">Select or create a day to configure slots.</p>
        )}
      </div>
      <div className="shop-mode-editor__right">{renderPreviewItems(currentScheduleDay?.slots ?? [], true)}</div>
    </div>
  );

  if (activeEditor === 'randomized') {
    return (
      <div className="page-stack guild-dashboard">
        <SectionHeader
          eyebrow="Guild Dashboard"
          title="Randomized Pool Editor"
          subtitle="Manage the list of items the shop can randomly pull from."
          meta={<span className="status-pill">Randomized</span>}
        />
        <div className="box-editor__toolbar">
          <button type="button" className="ghost-btn" onClick={handleEditorClose}>
            ← Back to shop
          </button>
          <span className="status-pill">{randomizedPool.length} entries</span>
        </div>
        {renderRandomizedEditor()}
        <div className="page-actions">
          <div>
            <span>Last saved</span>
            <strong>{lastSaved ? new Date(lastSaved).toLocaleString() : 'Not yet saved'}</strong>
          </div>
          <button type="button" className="primary-btn" onClick={() => saveGuild('Randomized pool saved')}>
            Save changes
          </button>
        </div>
      </div>
    );
  }

  if (activeEditor === 'scheduled') {
    return (
      <div className="page-stack guild-dashboard">
        <SectionHeader
          eyebrow="Guild Dashboard"
          title="Scheduled Slots Editor"
          subtitle="Pick a day and configure which items appear in each slot."
          meta={<span className="status-pill">Scheduled</span>}
        />
        <div className="box-editor__toolbar">
          <button type="button" className="ghost-btn" onClick={handleEditorClose}>
            ← Back to shop
          </button>
          <span className="status-pill">{selectedDate || 'No date selected'}</span>
        </div>
        {renderScheduledEditor()}
        <div className="page-actions">
          <div>
            <span>Last saved</span>
            <strong>{lastSaved ? new Date(lastSaved).toLocaleString() : 'Not yet saved'}</strong>
          </div>
          <button type="button" className="primary-btn" onClick={() => saveGuild('Schedule saved')}>
            Save changes
          </button>
        </div>
      </div>
    );
  }

  if (isAppearancePreviewing) {
    return (
      <div className="page-stack guild-dashboard">
        <SectionHeader
          eyebrow="Guild Dashboard"
          title="Appearance Preview"
          subtitle="Review layout, colors, and current mode presentation."
          meta={<span className="status-pill">{previewModeLabel}</span>}
        />
        <div className="box-editor__toolbar">
          <button type="button" className="ghost-btn" onClick={() => setIsAppearancePreviewing(false)}>
            ← Back to shop
          </button>
          <span className="status-pill">{layoutStatus}</span>
        </div>
        <div className="appearance-preview appearance-preview--full is-open">
          {renderAppearanceCard(true)}
          {renderAppearancePreviewPanel()}
        </div>
        <div className="page-actions">
          <div>
            <span>Last saved</span>
            <strong>{lastSaved ? new Date(lastSaved).toLocaleString() : 'Not yet saved'}</strong>
          </div>
          <button type="button" className="primary-btn" onClick={() => saveGuild('Appearance saved')}>
            Save changes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack guild-dashboard">
      <SectionHeader
        eyebrow="Guild Dashboard"
        title="Serverwide Shop"
        subtitle={`Curate hero slots, rotations, and layout for ${selectedGuild?.name ?? 'your guild'}.`}
        meta={<span className="status-pill">Shop</span>}
      />

      <div className="card-grid">
        <ModuleCard icon="🏪" title="Shop info" description="Rename, describe, and manage inventory." status="Active">
          <label className="text-control">
            <span>Shop name</span>
            <input value={serverShop.name} onChange={(event) => updateServerShop({ name: event.target.value })} />
          </label>
          <label className="text-control">
            <span>Description</span>
            <textarea rows={3} value={serverShop.description} onChange={(event) => updateServerShop({ description: event.target.value })} />
          </label>
        </ModuleCard>

        <ModuleCard
          icon="🛠️"
          title="Mode & Scheduling"
          description="Open an editor to configure each mode independently."
          status={serverShop.itemMode === 'scheduled' ? 'Scheduled' : 'Randomized'}
        >
          <label className="text-control">
            <span>Active shop mode</span>
            <select value={serverShop.itemMode} onChange={(event) => updateServerShop({ itemMode: event.target.value })}>
              <option value="randomized">Randomized</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </label>
          {serverShop.itemMode === 'randomized' ? (
            <div className="box-editor-launch">
              <button type="button" className="primary-btn" onClick={() => handleEditorOpen('randomized')}>
                Edit randomized pool
              </button>
              <p className="helper-text">Open a focused list view to manage the random selection pool.</p>
            </div>
          ) : (
            <div className="box-editor-launch">
              <button type="button" className="primary-btn" onClick={() => handleEditorOpen('scheduled')}>
                Edit schedule
              </button>
              <p className="helper-text">Switch to a calendar slot editor for daily rotations.</p>
            </div>
          )}
        </ModuleCard>

        {renderAppearanceCard(false)}
      </div>

      <div className="page-actions">
        <div>
          <span>Last saved</span>
          <strong>{lastSaved ? new Date(lastSaved).toLocaleString() : 'Not yet saved'}</strong>
        </div>
        <button type="button" className="primary-btn" onClick={() => saveGuild('Server shop saved')}>
          Save changes
        </button>
      </div>
    </div>
  );
}
