import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SectionHeader from '../../components/SectionHeader';
import ToggleSwitch from '../../components/ToggleSwitch';
import ModuleCard from '../../components/ModuleCard';
import NumberInput from '../../components/NumberInput';
import useGuildSettings from '../../hooks/useGuildSettings';
import { useToast } from '../../components/ToastProvider';

const ANIMATION_BACKGROUNDS = [
  { key: 'still', label: 'Still artwork' },
  { key: 'aurora', label: 'Aurora gradient' },
  { key: 'nebula', label: 'Nebula swirl' },
];

const ANIMATION_SPEEDS = [
  { key: 'slow', label: 'Slow' },
  { key: 'standard', label: 'Standard' },
  { key: 'fast', label: 'Fast' },
];

const createId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const coerceNumber = (value, fallback = 0) => {
  if (value === '' || value === null || typeof value === 'undefined') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const deepClone = (value) => JSON.parse(JSON.stringify(value ?? {}));

const normalizeItem = (item = {}) => ({
  id: item.id ?? createId('box-item'),
  name: item.name ?? 'Mystery drop',
  odds: typeof item.odds === 'number' ? item.odds : 0,
  quantity: typeof item.quantity === 'number' ? item.quantity : 1,
  rarity: item.rarity ?? 'Common',
});

const normalizeBox = (box = {}) => ({
  id: box.id ?? createId('box'),
  name: box.name ?? 'New box',
  color: box.color ?? '#7c3aed',
  price: typeof box.price === 'number' ? box.price : 0,
  forSale: typeof box.forSale === 'boolean' ? box.forSale : true,
  items: Array.isArray(box.items) ? box.items.map(normalizeItem) : [],
});

const normalizeBehavior = (behavior = {}) => ({
  animationBackground: behavior.animationBackground ?? 'still',
  animationSpeed: behavior.animationSpeed ?? 'standard',
  announceRare: Boolean(behavior.announceRare),
  announceChannel: behavior.announceChannel ?? '',
  logOpenings: Boolean(behavior.logOpenings),
  stockLimited: Boolean(behavior.stockLimited),
  forSaleOverride: Boolean(behavior.forSaleOverride),
  openOnPurchase: behavior.openOnPurchase ?? true,
});

const buildBoxesDraft = (source = {}) => ({
  enabled: Boolean(source.enabled),
  behavior: normalizeBehavior(source.behavior ?? {}),
  collection: Array.isArray(source.collection) ? source.collection.map(normalizeBox) : [],
});

const normalizeBoxBattles = (battle = {}) => ({
  enabled: Boolean(battle.enabled),
});

const serializeBoxes = (draft) => ({
  enabled: Boolean(draft.enabled),
  behavior: { ...draft.behavior },
  collection: draft.collection.map((box) => ({
    id: box.id,
    name: box.name,
    color: box.color,
    price: coerceNumber(box.price, 0),
    forSale: Boolean(box.forSale),
    items: box.items.map((item) => ({
      id: item.id,
      name: item.name,
      odds: coerceNumber(item.odds, 0),
      quantity: coerceNumber(item.quantity, 0),
      rarity: item.rarity,
    })),
  })),
});

const serializeBoxBattles = (draft) => ({
  enabled: Boolean(draft.enabled),
});

const ODDS_EPSILON = 0.001;

const getOddsIssue = (box) => {
  const items = Array.isArray(box.items) ? box.items : [];
  if (!items.length) return 'Add at least one reward to every box';

  let total = 0;
  for (const item of items) {
    const odds = coerceNumber(item.odds, 0);
    if (odds > 100) return 'Individual odds cannot exceed 100%';
    total += odds;
  }

  if (total - 100 > ODDS_EPSILON) return 'Odds exceed 100%';
  if (100 - total > ODDS_EPSILON) return 'Odds must total 100%';
  return null;
};

export default function GuildBoxesPage() {
  const location = useLocation();
  const { guild, updateGuild, saveGuild, selectedGuild, lastSaved } = useGuildSettings();
  const { showToast } = useToast();

  const guildBoxes = useMemo(() => buildBoxesDraft(guild.boxes ?? {}), [guild.boxes]);
  const guildBoxBattles = useMemo(() => normalizeBoxBattles(guild.boxBattles ?? {}), [guild.boxBattles]);

  const [boxesDraft, setBoxesDraft] = useState(() => deepClone(guildBoxes));
  const [boxBattlesDraft, setBoxBattlesDraft] = useState(() => ({ ...guildBoxBattles }));
  const [selectedBoxId, setSelectedBoxId] = useState(() => guildBoxes.collection[0]?.id ?? null);
  const [editingBoxId, setEditingBoxId] = useState(null);

  useEffect(() => {
    setBoxesDraft(deepClone(guildBoxes));
  }, [guildBoxes]);

  useEffect(() => {
    setBoxBattlesDraft({ ...guildBoxBattles });
  }, [guildBoxBattles]);

  useEffect(() => {
    if (!boxesDraft.collection.length) {
      setSelectedBoxId(null);
      return;
    }
    if (!selectedBoxId || !boxesDraft.collection.some((box) => box.id === selectedBoxId)) {
      setSelectedBoxId(boxesDraft.collection[0].id);
    }
  }, [boxesDraft.collection, selectedBoxId]);

  useEffect(() => {
    if (editingBoxId && !boxesDraft.collection.some((box) => box.id === editingBoxId)) {
      setEditingBoxId(null);
    }
  }, [boxesDraft.collection, editingBoxId]);

  const prevLocationKeyRef = useRef(location.key);

  useEffect(() => {
    const prevKey = prevLocationKeyRef.current;
    if (prevKey !== location.key && editingBoxId) {
      setEditingBoxId(null);
    }
    prevLocationKeyRef.current = location.key;
  }, [location.key, editingBoxId]);

  const availableBoxItems = useMemo(() => {
    const names = new Set();
    (guild.items?.catalog ?? []).forEach((item) => names.add(item.name));
    boxesDraft.collection.forEach((box) => box.items.forEach((item) => names.add(item.name)));
    return Array.from(names);
  }, [guild.items?.catalog, boxesDraft.collection]);

  const itemRarityMap = useMemo(() => {
    const map = {};
    (guild.items?.catalog ?? []).forEach((item) => {
      map[item.name] = item.rarity ?? 'Common';
    });
    return map;
  }, [guild.items?.catalog]);

  const selectedBox = boxesDraft.collection.find((box) => box.id === selectedBoxId) ?? null;
  const editingBox = editingBoxId ? boxesDraft.collection.find((box) => box.id === editingBoxId) ?? null : null;

  const boxIssues = useMemo(() => {
    const issues = {};
    boxesDraft.collection.forEach((box) => {
      const issue = getOddsIssue(box);
      if (issue) issues[box.id] = issue;
    });
    return issues;
  }, [boxesDraft.collection]);

  const editingIssue = editingBox ? boxIssues[editingBox.id] ?? null : null;
  const hasBlockingIssue = editingBox ? Boolean(editingIssue) : Object.keys(boxIssues).length > 0;

  const hasUnsavedChanges = useMemo(() => {
    const baseChanged = JSON.stringify(boxesDraft) !== JSON.stringify(guildBoxes);
    const battleChanged = JSON.stringify(boxBattlesDraft) !== JSON.stringify(guildBoxBattles);
    return baseChanged || battleChanged;
  }, [boxesDraft, guildBoxes, boxBattlesDraft, guildBoxBattles]);

  const updateBehavior = (patch) => {
    setBoxesDraft((prev) => ({ ...prev, behavior: { ...prev.behavior, ...patch } }));
  };

  const updateBox = (boxId, patch) => {
    setBoxesDraft((prev) => ({
      ...prev,
      collection: prev.collection.map((box) => (box.id === boxId ? { ...box, ...patch } : box)),
    }));
  };

  const addBox = () => {
    const newBox = {
      id: createId('box'),
      name: 'New box',
      color: '#7c3aed',
      price: 0,
      forSale: true,
      items: [],
    };

    setBoxesDraft((prev) => ({ ...prev, collection: [...prev.collection, newBox] }));
    setSelectedBoxId(newBox.id);
    setEditingBoxId(null);
  };

  const removeBox = (boxId) => {
    setBoxesDraft((prev) => ({
      ...prev,
      collection: prev.collection.filter((box) => box.id !== boxId),
    }));
    if (selectedBoxId === boxId) {
      setSelectedBoxId(null);
    }
    if (editingBoxId === boxId) {
      setEditingBoxId(null);
    }
  };

  const addBoxItem = (boxId) => {
    const nextItem = {
      id: createId('box-item'),
      name: 'Mystery drop',
      odds: 1,
      quantity: 1,
      rarity: 'Common',
    };

    setBoxesDraft((prev) => ({
      ...prev,
      collection: prev.collection.map((box) =>
        box.id === boxId ? { ...box, items: [...box.items, nextItem] } : box,
      ),
    }));
  };

  const updateBoxItem = (boxId, itemId, patch) => {
    setBoxesDraft((prev) => ({
      ...prev,
      collection: prev.collection.map((box) =>
        box.id === boxId
          ? { ...box, items: box.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)) }
          : box,
      ),
    }));
  };

  const removeBoxItem = (boxId, itemId) => {
    setBoxesDraft((prev) => ({
      ...prev,
      collection: prev.collection.map((box) =>
        box.id === boxId ? { ...box, items: box.items.filter((item) => item.id !== itemId) } : box,
      ),
    }));
  };

  const reorderBoxItems = (boxId) => {
    setBoxesDraft((prev) => ({
      ...prev,
      collection: prev.collection.map((box) =>
        box.id === boxId
          ? {
              ...box,
              items: [...box.items].sort((a, b) => coerceNumber(a.odds, 0) - coerceNumber(b.odds, 0)),
            }
          : box,
      ),
    }));
  };

  const handleItemSelect = (boxId, itemId, nextName) => {
    const derivedRarity = itemRarityMap[nextName] ?? 'Common';
    updateBoxItem(boxId, itemId, { name: nextName, rarity: derivedRarity });
  };

  const enterEditor = (boxId) => {
    setEditingBoxId(boxId);
  };

  const exitEditor = () => {
    setEditingBoxId(null);
  };

  const handlePageSave = () => {
    if (hasBlockingIssue) {
      showToast('Resolve box odds before saving', 'error');
      return;
    }

    updateGuild((prev) => ({
      ...prev,
      boxes: serializeBoxes(boxesDraft),
      boxBattles: serializeBoxBattles(boxBattlesDraft),
    }));
    saveGuild('Mystery boxes saved');
  };

  const handleDiscard = () => {
    setBoxesDraft(deepClone(guildBoxes));
    setBoxBattlesDraft({ ...guildBoxBattles });
    setSelectedBoxId(guildBoxes.collection[0]?.id ?? null);
    setEditingBoxId(null);
  };

  const renderPageActions = () => (
    <div className="page-actions">
      <div>
        <span>Last saved</span>
        <strong>{lastSaved ? new Date(lastSaved).toLocaleString() : 'Not yet saved'}</strong>
      </div>
      {hasUnsavedChanges && (
        <div className="page-actions__stack">
          {hasBlockingIssue && <span className="error-text">Resolve box odds before saving</span>}
          <div className="page-actions__buttons">
            <button type="button" className="ghost-btn" onClick={handleDiscard}>
              Discard changes
            </button>
            <button type="button" className="primary-btn" onClick={handlePageSave} disabled={hasBlockingIssue}>
              Save changes
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (editingBox) {
    const totalOdds = editingBox.items.reduce((sum, item) => sum + coerceNumber(item.odds, 0), 0);

    return (
      <div className="page-stack guild-dashboard">
        <SectionHeader
          eyebrow="Mystery Boxes"
          title={`Editing ${editingBox.name}`}
          subtitle="Fine-tune the drop table for this crate."
          meta={<span className="status-pill">Box editor</span>}
        />
        <div className="box-editor__toolbar">
          <button type="button" className="ghost-btn" onClick={exitEditor}>
            ← Back to boxes
          </button>
          <span className="status-pill">{editingBox.items.length} items</span>
        </div>
        <div className="box-editor__layout">
          <div className="box-editor__table-card">
            <div className="box-editor__table-header">
              <div>
                <h3>Box contents</h3>
                <p>Edit the loot pool and associated weights.</p>
                {editingIssue && <p className="error-text">{editingIssue}</p>}
              </div>
              <button type="button" className="ghost-btn ghost-btn--small" onClick={() => addBoxItem(editingBox.id)}>
                + Add item
              </button>
            </div>
            <div className="box-editor__table-wrapper">
              <table className="box-editor__table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Chance (%)</th>
                    <th>Quantity</th>
                    <th>Rarity</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {editingBox.items.length ? (
                    editingBox.items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <select value={item.name} onChange={(event) => handleItemSelect(editingBox.id, item.id, event.target.value)}>
                            {availableBoxItems.length === 0 && <option value="">Select item</option>}
                            {availableBoxItems.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                            {!availableBoxItems.includes(item.name) && <option value={item.name}>{item.name}</option>}
                          </select>
                        </td>
                        <td>
                          <div className={`percent-input ${editingIssue ? 'has-error' : ''}`}>
                            <NumberInput
                              min={0}
                              max={100}
                              value={item.odds === '' ? '' : item.odds}
                              onChange={(value) => updateBoxItem(editingBox.id, item.id, { odds: value })}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  reorderBoxItems(editingBox.id);
                                }
                              }}
                            />
                            <span>%</span>
                          </div>
                        </td>
                        <td>
                          <NumberInput
                            min={0}
                            value={item.quantity === '' ? '' : item.quantity}
                            onChange={(value) => updateBoxItem(editingBox.id, item.id, { quantity: value })}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                reorderBoxItems(editingBox.id);
                              }
                            }}
                          />
                        </td>
                        <td>
                          <span className="rarity-pill">{item.rarity ?? 'Common'}</span>
                        </td>
                        <td>
                          <button type="button" className="list-icon-btn" onClick={() => removeBoxItem(editingBox.id, item.id)}>
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="box-editor__empty-row">
                      <td colSpan={5}>No items yet. Add your first drop to begin.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <aside className="box-editor__preview">
            <h4>{editingBox.name}</h4>
            <p>{totalOdds}% total odds allocated</p>
            {editingBox.items.length ? (
              <ul className="box-preview-list">
                {editingBox.items.map((item) => {
                  const odds = coerceNumber(item.odds, 0);
                  const quantity = coerceNumber(item.quantity, 0);
                  const share = totalOdds ? Math.min((odds / totalOdds) * 100, 100) : 0;
                  return (
                    <li key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>
                          {quantity} qty · {item.rarity ?? 'Common'}
                        </span>
                      </div>
                      <strong>{odds}%</strong>
                      <div className="box-preview-bar">
                        <span style={{ width: `${share}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="helper-text">Add items to see a live distribution preview.</p>
            )}
          </aside>
        </div>
        {renderPageActions()}
      </div>
    );
  }

  return (
    <div className="page-stack guild-dashboard">
      <SectionHeader
        eyebrow="Guild Dashboard"
        title="Mystery Boxes"
        subtitle={`Curate crates, drops, and reveals for ${selectedGuild?.name ?? 'your guild'}.`}
        meta={<span className="status-pill">Boxes</span>}
      />

      <div className="card-grid">
        <ModuleCard
          icon="⚙️"
          title="General"
          description="Enable boxes, control animation, and global logging."
          status={boxesDraft.enabled ? 'Active' : 'Disabled'}
        >
          <ToggleSwitch
            label="Enable Mystery Boxes"
            checked={boxesDraft.enabled}
            onChange={(value) => setBoxesDraft((prev) => ({ ...prev, enabled: value }))}
          />
          <label className="text-control">
            <span>Animation speed</span>
            <select value={boxesDraft.behavior.animationSpeed} onChange={(event) => updateBehavior({ animationSpeed: event.target.value })}>
              {ANIMATION_SPEEDS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <ToggleSwitch
            label="Announce Rare Openings"
            checked={boxesDraft.behavior.announceRare}
            onChange={(value) => updateBehavior({ announceRare: value })}
          />
          {boxesDraft.behavior.announceRare && (
            <label className="text-control">
              <span>Announcement channel</span>
              <input value={boxesDraft.behavior.announceChannel} onChange={(event) => updateBehavior({ announceChannel: event.target.value })} />
            </label>
          )}
          <ToggleSwitch
            label="Log Every Opening"
            checked={boxesDraft.behavior.logOpenings}
            onChange={(value) => updateBehavior({ logOpenings: value })}
          />
          <ToggleSwitch
            label="Open Boxes On Purchase"
            description={
              <>
                Toggle <strong>OFF</strong> to store purchased boxes in inventory.
              </>
            }
            checked={boxesDraft.behavior.openOnPurchase}
            onChange={(value) => updateBehavior({ openOnPurchase: value })}
          />
        </ModuleCard>

        <ModuleCard
          icon="🛠️"
          title="Customization"
          description="Pick a crate to edit metadata, price, and drop odds."
          status={`${boxesDraft.collection.length} box${boxesDraft.collection.length === 1 ? '' : 'es'}`}
        >
          <div className="input-row">
            <label className="text-control">
              <select value={selectedBoxId ?? ''} onChange={(event) => setSelectedBoxId(event.target.value || null)}>
                {boxesDraft.collection.length === 0 && <option value="">No boxes yet</option>}
                {boxesDraft.collection.map((box) => (
                  <option key={box.id} value={box.id}>
                    {box.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="ghost-btn ghost-btn--xs" onClick={addBox}>
              + New box
            </button>
          </div>
          {selectedBox ? (
            <>
              <div className="field-stack">
                <div className="field-row">
                  <span className="field-row__label">Name</span>
                  <input
                    value={selectedBox.name}
                    onChange={(event) => updateBox(selectedBox.id, { name: event.target.value })}
                  />
                </div>
                <div className="field-row">
                  <span className="field-row__label">Color</span>
                  <input
                    type="text"
                    value={selectedBox.color}
                    placeholder="#7c3aed"
                    onChange={(event) => updateBox(selectedBox.id, { color: event.target.value })}
                  />
                </div>
                <div className="field-row">
                  <span className="field-row__label">Price</span>
                  <NumberInput
                    min={0}
                    value={selectedBox.price === '' ? '' : selectedBox.price}
                    onChange={(value) => updateBox(selectedBox.id, { price: value })}
                  />
                </div>
              </div>
              <ToggleSwitch
                label="For Sale"
                checked={selectedBox.forSale}
                onChange={(value) => updateBox(selectedBox.id, { forSale: value })}
              />
              <div className="box-editor-launch">
                <button type="button" className="primary-btn" onClick={() => enterEditor(selectedBox.id)}>
                  Edit Box Contents
                </button>
                <p className="helper-text">Open a focused view to manage this crate’s loot table.</p>
              </div>
              <button type="button" className="danger-btn" onClick={() => removeBox(selectedBox.id)}>
                Delete box
              </button>
            </>
          ) : (
            <p className="helper-text">No boxes yet. Create your first crate to start customizing drops and odds.</p>
          )}
        </ModuleCard>

        <ModuleCard
          icon="⚔️"
          title="Box battles (beta)"
          description="PvP openings for whales and highlight reels."
          status={boxBattlesDraft.enabled ? 'Active' : 'Disabled'}
        >
          <ToggleSwitch
            label="Enable Box Battles"
            checked={boxBattlesDraft.enabled}
            onChange={(value) => setBoxBattlesDraft({ enabled: value })}
          />
          <p className="helper-text">
            Four-player duels open identical boxes simultaneously with dramatic overlays and shareable stats.
          </p>
        </ModuleCard>
      </div>

      {renderPageActions()}
    </div>
  );
}
