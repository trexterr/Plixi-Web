import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SectionHeader from '../../components/SectionHeader';
import ToggleSwitch from '../../components/ToggleSwitch';
import ModuleCard from '../../components/ModuleCard';
import useGuildSettings from '../../hooks/useGuildSettings';

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

export default function GuildBoxesPage() {
  const { guild, updateGuild, saveGuild, selectedGuild, lastSaved } = useGuildSettings();
  const location = useLocation();
  const [selectedBoxId, setSelectedBoxId] = useState(guild.boxes.collection[0]?.id ?? null);
  const [guildSnapshot, setGuildSnapshot] = useState(() => JSON.stringify(guild));
  const [editingBoxId, setEditingBoxId] = useState(null);
  const [editorSnapshot, setEditorSnapshot] = useState(null);
  const [editorError, setEditorError] = useState('');
  const lastLocationKeyRef = useRef(location.key);
  const guildSnapshotRef = useRef(guildSnapshot);
  const hasGuildChangesRef = useRef(false);
  const editingBoxIdRef = useRef(editingBoxId);
  const availableBoxItems = useMemo(() => {
    const names = new Set();
    (guild.items?.catalog ?? []).forEach((item) => names.add(item.name));
    guild.boxes.collection.forEach((box) => box.items.forEach((item) => names.add(item.name)));
    return Array.from(names);
  }, [guild.boxes.collection, guild.items?.catalog]);
  const itemRarityMap = useMemo(() => {
    const map = {};
    (guild.items?.catalog ?? []).forEach((item) => {
      map[item.name] = item.rarity ?? 'Common';
    });
    return map;
  }, [guild.items?.catalog]);

  useEffect(() => {
    if (editingBoxId && !guild.boxes.collection.some((box) => box.id === editingBoxId)) {
      setEditingBoxId(null);
    }
  }, [editingBoxId, guild.boxes.collection]);

  useEffect(() => {
    if (!guild.boxes.collection.length) {
      setSelectedBoxId(null);
      return;
    }

    if (!selectedBoxId || !guild.boxes.collection.some((box) => box.id === selectedBoxId)) {
      setSelectedBoxId(guild.boxes.collection[0].id);
    }
  }, [guild.boxes.collection, selectedBoxId]);
  useEffect(() => {
    setGuildSnapshot(JSON.stringify(guild));
  }, [selectedGuild?.id]);

  useEffect(() => {
    if (lastSaved) {
      setGuildSnapshot(JSON.stringify(guild));
    }
  }, [lastSaved]);

  useEffect(() => {
    guildSnapshotRef.current = guildSnapshot;
  }, [guildSnapshot]);

  useEffect(() => {
    hasGuildChangesRef.current = hasGuildChanges;
  }, [hasGuildChanges]);

  useEffect(() => {
    editingBoxIdRef.current = editingBoxId;
  }, [editingBoxId]);

  useEffect(
    () => () => {
      if (editingBoxIdRef.current) {
        exitEditor(true);
        return;
      }
      if (hasGuildChangesRef.current) {
        try {
          const snapshot = JSON.parse(guildSnapshotRef.current);
          updateGuild(() => snapshot);
        } catch {
          // ignore restore errors
        }
      }
    },
    [], // run cleanup on unmount only
  );

  useEffect(() => {
    if (!editingBoxId) return;
    if (!location.pathname.endsWith('/boxes')) return;
    setEditingBoxId(null);
    setEditorError('');
    setEditorSnapshot(null);
  }, [location.key]);

  const addBox = () => {
    const newId = `box-${Date.now()}`;
    const newBox = {
      id: newId,
      name: 'New box',
      color: '#7c3aed',
      price: 0,
      forSale: true,
      items: [],
    };

    setSelectedBoxId(newId);
    setEditingBoxId(null);
    updateGuild((prev) => ({
      ...prev,
      boxes: {
        ...prev.boxes,
        collection: [...prev.boxes.collection, newBox],
      },
    }));
  };

  const updateBox = (id, patch) => {
    updateGuild((prev) => ({
      ...prev,
      boxes: {
        ...prev.boxes,
        collection: prev.boxes.collection.map((box) => (box.id === id ? { ...box, ...patch } : box)),
      },
    }));
  };

  const removeBox = (id) => {
    updateGuild((prev) => ({
      ...prev,
      boxes: { ...prev.boxes, collection: prev.boxes.collection.filter((box) => box.id !== id) },
    }));
  };

  const addBoxItem = (boxId) => {
    updateGuild((prev) => ({
      ...prev,
      boxes: {
        ...prev.boxes,
        collection: prev.boxes.collection.map((box) =>
          box.id === boxId
            ? {
                ...box,
                items: [
                  ...box.items,
                  { id: `box-item-${Date.now()}`, name: 'Mystery drop', odds: 1, quantity: 1, rarity: 'Common' },
                ],
              }
            : box,
        ),
      },
    }));
  };

  const updateBoxItem = (boxId, itemId, patch) => {
    updateGuild((prev) => ({
      ...prev,
      boxes: {
        ...prev.boxes,
        collection: prev.boxes.collection.map((box) =>
          box.id === boxId
            ? {
                ...box,
                items: box.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
              }
            : box,
        ),
      },
    }));
  };

  const reorderBoxItems = (boxId) => {
    updateGuild((prev) => ({
      ...prev,
      boxes: {
        ...prev.boxes,
        collection: prev.boxes.collection.map((box) =>
          box.id === boxId
            ? {
                ...box,
                items: [...box.items].sort((a, b) => (Number(a.odds) || 0) - (Number(b.odds) || 0)),
              }
            : box,
        ),
      },
    }));
  };

  const removeBoxItem = (boxId, itemId) => {
    updateGuild((prev) => ({
      ...prev,
      boxes: {
        ...prev.boxes,
        collection: prev.boxes.collection.map((box) =>
          box.id === boxId
            ? { ...box, items: box.items.filter((item) => item.id !== itemId) }
            : box,
        ),
      },
    }));
  };

  const updateBehavior = (patch) => {
    updateGuild((prev) => ({
      ...prev,
      boxes: { ...prev.boxes, behavior: { ...prev.boxes.behavior, ...patch } },
    }));
  };

  const handlePageSave = () => {
    saveGuild('Mystery boxes saved');
    setGuildSnapshot(JSON.stringify(guild));
  };

  const selectedBox = guild.boxes.collection.find((box) => box.id === selectedBoxId) ?? null;
  const editingBox = editingBoxId
    ? guild.boxes.collection.find((box) => box.id === editingBoxId) ?? null
    : null;
  const guildSignature = JSON.stringify(guild);
  const hasGuildChanges = guildSignature !== guildSnapshot;
  const editorSignature = editingBox ? JSON.stringify(editingBox) : null;
  const hasEditorChanges = Boolean(
    editingBox && (editorSnapshot === null || editorSignature !== editorSnapshot),
  );

  const enterEditor = (boxId) => {
    const target = guild.boxes.collection.find((box) => box.id === boxId);
    setEditingBoxId(boxId);
    setEditorSnapshot(target ? JSON.stringify(target) : null);
    setEditorError('');
  };

  const exitEditor = () => {
    setEditingBoxId(null);
    setEditorError('');
    setEditorSnapshot(null);
  };

  if (editingBox) {
    const totalOdds = editingBox.items.reduce(
      (sum, item) => sum + (Number(item.odds) || 0),
      0,
    );
    const oddsError = totalOdds !== 100;

    const handleEditorSave = () => {
      if (oddsError) {
        setEditorError('Total odds must equal 100%');
        return;
      }
      setEditorError('');
      saveGuild('Mystery box updated');
      setEditorSnapshot(editorSignature);
      setGuildSnapshot(JSON.stringify(guild));
    };

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
                {oddsError && <p className="error-text">Total odds must equal 100%</p>}
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
                          <select
                            value={item.name}
                            onChange={(event) => {
                              const nextName = event.target.value;
                              const derivedRarity = itemRarityMap[nextName] ?? item.rarity ?? 'Common';
                              updateBoxItem(editingBox.id, item.id, { name: nextName, rarity: derivedRarity });
                            }}
                          >
                            {availableBoxItems.length === 0 && <option value="">Select item</option>}
                            {availableBoxItems.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                            {!availableBoxItems.includes(item.name) && (
                              <option value={item.name}>{item.name}</option>
                            )}
                          </select>
                        </td>
                        <td>
                          <div className={`percent-input ${oddsError ? 'has-error' : ''}`}>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={item.odds}
                              onChange={(event) =>
                                updateBoxItem(editingBox.id, item.id, {
                                  odds: event.target.value === '' ? '' : Number(event.target.value),
                                })
                              }
                              onBlur={(event) => {
                                if (event.target.value === '') {
                                  updateBoxItem(editingBox.id, item.id, {
                                    odds: Number(event.target.min ?? 0),
                                  });
                                }
                              }}
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
                          <input
                            type="number"
                            min={0}
                            value={item.quantity ?? 0}
                            onChange={(event) =>
                              updateBoxItem(editingBox.id, item.id, {
                                quantity: event.target.value === '' ? '' : Number(event.target.value),
                              })
                            }
                            onBlur={(event) => {
                              if (event.target.value === '') {
                                updateBoxItem(editingBox.id, item.id, {
                                  quantity: Number(event.target.min ?? 0),
                                });
                              }
                            }}
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
                          <button
                            type="button"
                            className="list-icon-btn"
                            onClick={() => removeBoxItem(editingBox.id, item.id)}
                          >
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
                  const odds = Number(item.odds) || 0;
                  const quantity = item.quantity ?? 0;
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
        <div className="page-actions">
          <div>
            <span>Last saved</span>
            <strong>{lastSaved ? new Date(lastSaved).toLocaleString() : 'Not yet saved'}</strong>
          </div>
          <div className="page-actions__stack">
            {editorError && <p className="error-text">{editorError}</p>}
            {hasEditorChanges && (
              <button
                type="button"
                className="primary-btn"
                onClick={handleEditorSave}
                disabled={oddsError}
              >
                Save changes
              </button>
            )}
          </div>
        </div>
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
          icon="🪄"
          title="General"
          description="Enable boxes, control animation, and global logging."
          status={guild.boxes.enabled ? 'Active' : 'Disabled'}
        >
          <ToggleSwitch
            label="Enable mystery boxes"
            checked={guild.boxes.enabled}
            onChange={(value) => updateGuild((prev) => ({ ...prev, boxes: { ...prev.boxes, enabled: value } }))}
          />
          <label className="text-control">
            <span>Animation background</span>
            <select
              value={guild.boxes.behavior.animationBackground}
              onChange={(event) => updateBehavior({ animationBackground: event.target.value })}
            >
              {ANIMATION_BACKGROUNDS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-control">
            <span>Animation speed</span>
            <select
              value={guild.boxes.behavior.animationSpeed}
              onChange={(event) => updateBehavior({ animationSpeed: event.target.value })}
            >
              {ANIMATION_SPEEDS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <ToggleSwitch
            label="Announce rare openings"
            checked={guild.boxes.behavior.announceRare}
            onChange={(value) => updateBehavior({ announceRare: value })}
          />
          {guild.boxes.behavior.announceRare && (
            <label className="text-control">
              <span>Announcement channel</span>
              <input
                value={guild.boxes.behavior.announceChannel}
                onChange={(event) => updateBehavior({ announceChannel: event.target.value })}
              />
            </label>
          )}
          <ToggleSwitch
            label="Log every opening"
            checked={guild.boxes.behavior.logOpenings}
            onChange={(value) => updateBehavior({ logOpenings: value })}
          />
          <ToggleSwitch
            label="Stock limited"
            checked={guild.boxes.behavior.stockLimited}
            onChange={(value) => updateBehavior({ stockLimited: value })}
          />
          <ToggleSwitch
            label="Override for-sale switches"
            description="Force all boxes on sale for events."
            checked={guild.boxes.behavior.forSaleOverride}
            onChange={(value) => updateBehavior({ forSaleOverride: value })}
          />
        </ModuleCard>

        <ModuleCard
          icon="🎯"
          title="Customization"
          description="Pick a crate to edit metadata, price, and drop odds."
          status={`${guild.boxes.collection.length} box${guild.boxes.collection.length === 1 ? '' : 'es'}`}
        >
          <div className="input-row">
            <label className="text-control">
              <select value={selectedBoxId ?? ''} onChange={(event) => setSelectedBoxId(event.target.value || null)}>
                {guild.boxes.collection.length === 0 && <option value="">No boxes yet</option>}
                {guild.boxes.collection.map((box) => (
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
              <div className="input-row">
                <label className="text-control">
                  <span>Name</span>
                  <input
                    value={selectedBox.name}
                    onChange={(event) => updateBox(selectedBox.id, { name: event.target.value })}
                  />
                </label>
                <label className="text-control">
                  <span>Accent color</span>
                  <input
                    type="color"
                    value={selectedBox.color}
                    onChange={(event) => updateBox(selectedBox.id, { color: event.target.value })}
                  />
                </label>
                <label className="text-control">
                  <span>Price</span>
                  <input
                    type="number"
                    min={0}
                    value={selectedBox.price}
                    onChange={(event) =>
                      updateBox(selectedBox.id, {
                        price: event.target.value === '' ? '' : Number(event.target.value),
                      })
                    }
                    onBlur={(event) => {
                      if (event.target.value === '') {
                        updateBox(selectedBox.id, { price: Number(event.target.min ?? 0) });
                      }
                    }}
                  />
                </label>
              </div>
              <ToggleSwitch
                label="For sale"
                checked={selectedBox.forSale}
                onChange={(value) => updateBox(selectedBox.id, { forSale: value })}
              />
              <div className="box-editor-launch">
                <button type="button" className="primary-btn" onClick={() => enterEditor(selectedBox.id)}>
                  Edit box contents
                </button>
                <p className="helper-text">Open a focused view to manage this crate’s loot table.</p>
              </div>
              <button type="button" className="danger-btn" onClick={() => removeBox(selectedBox.id)}>
                Delete box
              </button>
            </>
          ) : (
            <p className="helper-text">
              No boxes yet. Create your first crate to start customizing drops and odds.
            </p>
          )}
        </ModuleCard>

        <ModuleCard
          icon="⚔️"
          title="Box battles (beta)"
          description="PvP openings for whales and highlight reels."
          status={guild.boxBattles.enabled ? 'Active' : 'Disabled'}
        >
          <ToggleSwitch
            label="Enable box battles"
            checked={guild.boxBattles.enabled}
            onChange={(value) => updateGuild((prev) => ({ ...prev, boxBattles: { ...prev.boxBattles, enabled: value } }))}
          />
          <p className="helper-text">
            Four-player duels open identical boxes simultaneously with dramatic overlays and shareable stats.
          </p>
        </ModuleCard>
      </div>

      <div className="page-actions">
        <div>
          <span>Last saved</span>
          <strong>{lastSaved ? new Date(lastSaved).toLocaleString() : 'Not yet saved'}</strong>
        </div>
        {hasGuildChanges && (
          <button type="button" className="primary-btn" onClick={handlePageSave}>
            Save changes
          </button>
        )}
      </div>
    </div>
  );
}
  useEffect(
    () => () => {
      if (editingBoxId) return;
      if (!hasGuildChanges) return;
      try {
        const snapshot = JSON.parse(guildSnapshot);
        updateGuild(() => snapshot);
      } catch {
        // ignore corrupted snapshot
      }
    },
    [editingBoxId, hasGuildChanges, guildSnapshot, updateGuild],
  );
