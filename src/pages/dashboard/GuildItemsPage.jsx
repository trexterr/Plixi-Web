import { useEffect, useMemo, useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import ToggleSwitch from '../../components/ToggleSwitch';
import NumberInput from '../../components/NumberInput';
import ModuleCard from '../../components/ModuleCard';
import useGuildSettings from '../../hooks/useGuildSettings';
import { DEFAULT_SETTINGS } from '../../data';
import { supabase } from '../../lib/supabase';

export default function GuildItemsPage() {
  const { guild, updateGuild, saveGuild, selectedGuild, lastSaved } = useGuildSettings();
  const [editingCatalog, setEditingCatalog] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [pinnedItemId, setPinnedItemId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draftItem, setDraftItem] = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      if (!selectedGuild?.id) return;
      setLoadingItems(true);
      try {
        const { data, error } = await supabase
          .from('server_items')
          .select('item_id, name, rarity, price')
          .eq('guild_id', selectedGuild.id);
        if (error) throw error;
        const items = Array.isArray(data)
          ? data.map((row) => ({
              id: String(row.item_id),
              name: row.name ?? 'Untitled item',
              rarity: row.rarity ?? 'Common',
              price: row.price ?? null,
              image: '',
              stock: 0,
            }))
          : [];
        updateGuild((prev) => ({
          ...prev,
          items: {
            ...prev.items,
            catalog: items,
          },
        }));
      } catch (error) {
        console.error('Failed to load items', error);
      } finally {
        setLoadingItems(false);
      }
    };
    loadItems();
  }, [selectedGuild?.id, updateGuild]);

  const beginNewItem = () => {
    const newItem = { id: `item-${Date.now()}`, name: 'New item', rarity: 'Common', image: '', stock: 0 };
    setIsCreating(true);
    setDraftItem(newItem);
    setSelectedItemId(null);
  };

  const addItem = (item) => {
    updateGuild((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        catalog: [...prev.items.catalog, item],
      },
    }));
  };

  const updateItem = (id, patch) => {
    updateGuild((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        catalog: prev.items.catalog.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      },
    }));
  };

  const removeItem = (id) => {
    updateGuild((prev) => ({
      ...prev,
      items: { ...prev.items, catalog: prev.items.catalog.filter((item) => item.id !== id) },
    }));
  };

  const persistItemUpdate = async (id, patch) => {
    if (!selectedGuild?.id || !id) return;
    const updatePayload = {};
    if (patch.name !== undefined) updatePayload.name = patch.name;
    if (patch.rarity !== undefined) updatePayload.rarity = patch.rarity;
    if (patch.price !== undefined) updatePayload.price = patch.price;

    if (!Object.keys(updatePayload).length) return;

    try {
      await supabase.from('server_items').update(updatePayload).eq('guild_id', selectedGuild.id).eq('item_id', id);
    } catch (error) {
      console.error('Failed to update item', error);
    }
  };

  const handleItemChange = (patch) => {
    if (isCreating) {
      setDraftItem((prev) => ({ ...prev, ...patch }));
    } else if (selectedItemId) {
      updateItem(selectedItemId, patch);
      persistItemUpdate(selectedItemId, patch);
    }
  };

  const handleAddItem = async () => {
    if (!isCreating || !draftItem) return;
    try {
      const { data, error } = await supabase
        .from('server_items')
        .insert({
          guild_id: selectedGuild?.id,
          name: draftItem.name,
          rarity: draftItem.rarity ?? 'Common',
          price: draftItem.price ?? null,
        })
        .select('item_id, name, rarity, price')
        .single();
      if (error) throw error;
      const persisted = {
        id: String(data.item_id),
        name: data.name ?? draftItem.name,
        rarity: data.rarity ?? draftItem.rarity ?? 'Common',
        price: data.price ?? draftItem.price ?? null,
        image: draftItem.image ?? '',
        stock: draftItem.stock ?? 0,
      };
      addItem(persisted);
      setIsCreating(false);
      setDraftItem(null);
      setSelectedItemId(persisted.id);
    } catch (error) {
      console.error('Failed to create item', error);
    }
  };

  const handleDeleteItem = async () => {
    if (isCreating) {
      setIsCreating(false);
      setDraftItem(null);
      return;
    }
    if (selectedItemId) {
      try {
        await supabase.from('server_items').delete().eq('guild_id', selectedGuild?.id).eq('item_id', selectedItemId);
        removeItem(selectedItemId);
        setSelectedItemId(null);
      } catch (error) {
        console.error('Failed to delete item', error);
      }
    }
  };

  const filteredItems = useMemo(() => {
    const baseList = guild.items.catalog;
    const query = itemSearch.trim().toLowerCase();
    const matches = query ? baseList.filter((item) => item.name.toLowerCase().includes(query)) : baseList.slice();
    matches.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aStarts = query && aName.startsWith(query);
      const bStarts = query && bName.startsWith(query);
      if (pinnedItemId) {
        if (a.id === pinnedItemId) return -1;
        if (b.id === pinnedItemId) return 1;
      }
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return aName.localeCompare(bName);
    });
    return matches;
  }, [guild.items.catalog, itemSearch, pinnedItemId]);

  const itemCount = guild.items.catalog.length;

  useEffect(() => {
    if (isCreating) return;
    if (!guild.items.catalog.length) {
      setSelectedItemId(null);
      return;
    }
    if (!selectedItemId || !guild.items.catalog.some((item) => item.id === selectedItemId)) {
      setSelectedItemId(guild.items.catalog[0].id);
    }
  }, [guild.items.catalog, selectedItemId, isCreating]);

  const selectedItem = isCreating
    ? draftItem
    : selectedItemId
      ? guild.items.catalog.find((item) => item.id === selectedItemId) ?? null
      : guild.items.catalog[0] ?? null;

  useEffect(() => {
    if (!selectedItemId) {
      setPinnedItemId(null);
      return;
    }
    const timer = setTimeout(() => {
      setPinnedItemId(selectedItemId);
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedItemId]);

  useEffect(() => {
    if (!guild.items.catalog.length && !isCreating && editingCatalog) {
      beginNewItem();
    }
  }, [guild.items.catalog.length, isCreating, editingCatalog]);

  if (editingCatalog) {
    return (
      <div className="page-stack guild-dashboard">
        <SectionHeader
          eyebrow="Guild Dashboard"
          title="Item List"
          subtitle="Manage every collectible in one focused view."
        />

        <div className="item-editor__toolbar">
          <button type="button" className="ghost-btn" onClick={() => setEditingCatalog(false)}>
            ← Back to Items
          </button>
          <span className="status-pill">{filteredItems.length ? `${filteredItems.length} items` : 'No matches'}</span>
        </div>
        <div className="item-list-shell">
          <aside className="item-selector">
            <div className="item-search">
              <input
                className="item-search__input"
                value={itemSearch}
                onChange={(event) => setItemSearch(event.target.value)}
                placeholder="Search items..."
              />
            </div>
            <div className="item-list-scroll">
              {filteredItems.length ? (
                <ul className="item-selector__list">
                  {filteredItems.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`item-selector__button ${!isCreating && selectedItem?.id === item.id ? 'is-active' : ''}`}
                        onClick={() => {
                          setIsCreating(false);
                          setDraftItem(null);
                          setSelectedItemId(item.id);
                        }}
                      >
                        <span className="item-selector__name">{item.name}</span>
                        <span className="item-selector__rarity">{item.rarity}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="helper-text">No matching items found.</p>
              )}
            </div>
          </aside>
          <section className="item-editor">
            {selectedItem ? (
              <>
                <div className="item-editor__summary">
                  <div
                    className="item-card__thumb"
                    style={{ backgroundImage: `url(${selectedItem.image || 'https://placehold.co/96x96'})` }}
                  />
                  <div>
                    <strong>{selectedItem.name}</strong>
                    <p className="item-editor__rarity">{selectedItem.rarity}</p>
                  </div>
                  <button
                    type="button"
                    className="ghost-btn ghost-btn--small"
                    onClick={() => {
                      beginNewItem();
                      setPinnedItemId(null);
                    }}
                  >
                    + Create New Item
                  </button>
                </div>
                <label className="text-control">
                  <span>Display name</span>
                  <input
                    value={selectedItem.name}
                    onChange={(event) => handleItemChange({ name: event.target.value })}
                    className="item-editor__input"
                  />
                </label>
                <label className="text-control">
                  <span>Image URL</span>
                  <input
                    value={selectedItem.image}
                    placeholder="https://..."
                    onChange={(event) => handleItemChange({ image: event.target.value })}
                    className="item-editor__input"
                  />
                </label>
                <label className="text-control">
                  <span>Rarity</span>
                  <select
                    value={selectedItem.rarity}
                    onChange={(event) => handleItemChange({ rarity: event.target.value })}
                    className="item-editor__input"
                  >
                    <option value="Common">Common</option>
                    <option value="Uncommon">Uncommon</option>
                    <option value="Rare">Rare</option>
                    <option value="Epic">Epic</option>
                    <option value="Legendary">Legendary</option>
                  </select>
                </label>
                <div className="item-editor__actions">
                  <button type="button" className="ghost-btn ghost-btn--danger" onClick={handleDeleteItem} disabled={!selectedItem && !isCreating}>
                    Delete item
                  </button>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleAddItem}
                    disabled={!isCreating || !draftItem?.name?.trim()}
                  >
                    Add item
                  </button>
                </div>
              </>
            ) : (
              <p className="helper-text">Pick an item from the list to edit its details.</p>
            )}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack guild-dashboard">
      <SectionHeader
        eyebrow="Guild Dashboard"
        title="Items"
        subtitle={`Curate catalogues for ${selectedGuild?.name ?? 'your guild'}.`}
        meta={<span className="status-pill">Items</span>}
      />

      <div className="card-grid">
        <ModuleCard
          icon="⚙️"
          title="Settings"
          description="Toggle whether the items system is available to members."
          status={guild.items.enabled ? 'Active' : 'Disabled'}
        >
          <ToggleSwitch
            label="Enable items"
            checked={guild.items.enabled}
            onChange={(value) => updateGuild((prev) => ({ ...prev, items: { ...prev.items, enabled: value } }))}
          />
        </ModuleCard>
        <ModuleCard
          icon="🎫"
          title="Items"
          description="Create equipment, cosmetics, or consumables."
          status={`${guild.items.catalog.length} ${guild.items.catalog.length === 1 ? 'item' : 'items'}`}
        >
          <p className="helper-text">{guild.items.catalog.length ? `${guild.items.catalog.length} items configured` : 'No items yet.'}</p>
          <button type="button" className="primary-btn" onClick={() => setEditingCatalog(true)} disabled={!guild.items.enabled}>
            Open Item List
          </button>
          <label className="text-control">
            <span>Rarity slots allowed</span>
            <NumberInput
              min={1}
              value={guild.items.rarityCap}
              onChange={(value) => updateGuild((prev) => ({ ...prev, items: { ...prev.items, rarityCap: value } }))}
            />
          </label>
          <ToggleSwitch
            label="Item audit log"
            checked={guild.items.auditLog.enabled}
            onChange={(value) =>
              updateGuild((prev) => ({
                ...prev,
                items: { ...prev.items, auditLog: { ...prev.items.auditLog, enabled: value } },
              }))
            }
          />
          {guild.items.auditLog.enabled && (
            <label className="text-control">
              <span>Log channel</span>
              <input
                value={guild.items.auditLog.channel}
                onChange={(event) =>
                  updateGuild((prev) => ({
                    ...prev,
                    items: { ...prev.items, auditLog: { ...prev.items.auditLog, channel: event.target.value } },
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
        <button type="button" className="primary-btn" onClick={() => saveGuild('Items and boxes saved')}>
          Save changes
        </button>
      </div>
    </div>
  );
}
