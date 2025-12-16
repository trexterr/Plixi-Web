import SectionHeader from '../../components/SectionHeader';
import ToggleSwitch from '../../components/ToggleSwitch';
import ModuleCard from '../../components/ModuleCard';
import NumberInput from '../../components/NumberInput';
import useGuildSettings from '../../hooks/useGuildSettings';

export default function GuildShopPage() {
  const { guild, updateGuild, saveGuild, selectedGuild, lastSaved } = useGuildSettings();

  const addShopItem = () => {
    updateGuild((prev) => ({
      ...prev,
      serverShop: {
        ...prev.serverShop,
        items: [...prev.serverShop.items, { id: `shop-item-${Date.now()}`, name: 'New item', price: 0, featured: false }],
      },
    }));
  };

  const updateShopItem = (id, patch) => {
    updateGuild((prev) => ({
      ...prev,
      serverShop: {
        ...prev.serverShop,
        items: prev.serverShop.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      },
    }));
  };

  const removeShopItem = (id) => {
    updateGuild((prev) => ({
      ...prev,
      serverShop: { ...prev.serverShop, items: prev.serverShop.items.filter((item) => item.id !== id) },
    }));
  };

  return (
    <div className="page-stack guild-dashboard">
      <SectionHeader
        eyebrow="Guild Dashboard"
        title="Serverwide Shop"
        subtitle={`Curate hero slots, rotations, and layout for ${selectedGuild?.name ?? 'your guild'}.`}
        meta={<span className="status-pill">Shop</span>}
      />

      <div className="card-grid">
        <ModuleCard
          icon="🏪"
          title="Shop info"
          description="Rename, describe, and manage inventory."
          status="Active"
        >
          <label className="text-control">
            <span>Shop name</span>
            <input
              value={guild.serverShop.name}
              onChange={(event) => updateGuild((prev) => ({ ...prev, serverShop: { ...prev.serverShop, name: event.target.value } }))}
            />
          </label>
          <label className="text-control">
            <span>Description</span>
            <textarea
              rows={3}
              value={guild.serverShop.description}
              onChange={(event) =>
                updateGuild((prev) => ({ ...prev, serverShop: { ...prev.serverShop, description: event.target.value } }))
              }
            />
          </label>
          <button type="button" className="ghost-btn ghost-btn--small" onClick={addShopItem}>
            + Add shop item
          </button>
          {guild.serverShop.items.length ? (
            <ul className="list-body">
              {guild.serverShop.items.map((item) => (
                <li key={item.id} className="list-row">
                  <input value={item.name} onChange={(event) => updateShopItem(item.id, { name: event.target.value })} />
                  <NumberInput min={0} value={item.price} onChange={(value) => updateShopItem(item.id, { price: value })} />
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={item.featured}
                      onChange={(event) => updateShopItem(item.id, { featured: event.target.checked })}
                    />
                    <span>Featured</span>
                  </label>
                  <button type="button" className="list-icon-btn" onClick={() => removeShopItem(item.id)}>
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="helper-text">No items yet.</p>
          )}
        </ModuleCard>

        <ModuleCard
          icon="⚙️"
          title="Premium behaviors"
          description="Tomorrow previews, hero slots, and layouts."
          status={guild.serverShop.featuredHeroEnabled ? 'Active' : 'Disabled'}
        >
          <ToggleSwitch
            label="Show tomorrow's items"
            checked={guild.serverShop.tomorrowVisibility}
            onChange={(value) =>
              updateGuild((prev) => ({ ...prev, serverShop: { ...prev.serverShop, tomorrowVisibility: value } }))
            }
          />
          <ToggleSwitch
            label="Random rotation"
            checked={guild.serverShop.randomRotation}
            onChange={(value) =>
              updateGuild((prev) => ({ ...prev, serverShop: { ...prev.serverShop, randomRotation: value } }))
            }
          />
          <ToggleSwitch
            label="Featured hero item"
            checked={guild.serverShop.featuredHeroEnabled}
            onChange={(value) =>
              updateGuild((prev) => ({ ...prev, serverShop: { ...prev.serverShop, featuredHeroEnabled: value } }))
            }
          />
          <label className="text-control">
            <span>Background</span>
            <select
              value={guild.serverShop.backgroundStyle}
              onChange={(event) =>
                updateGuild((prev) => ({ ...prev, serverShop: { ...prev.serverShop, backgroundStyle: event.target.value } }))
              }
            >
              <option value="default">Default</option>
              <option value="aurora">Aurora</option>
              <option value="carbon">Carbon</option>
            </select>
          </label>
          <label className="text-control">
            <span>Layout</span>
            <select
              value={guild.serverShop.layout}
              onChange={(event) =>
                updateGuild((prev) => ({ ...prev, serverShop: { ...prev.serverShop, layout: event.target.value } }))
              }
            >
              <option value="grid">Grid</option>
              <option value="stacked">Stacked</option>
              <option value="carousel">Carousel</option>
            </select>
          </label>
          <ToggleSwitch
            label="Limited stock"
            checked={guild.serverShop.limitedStock}
            onChange={(value) =>
              updateGuild((prev) => ({ ...prev, serverShop: { ...prev.serverShop, limitedStock: value } }))
            }
          />
        </ModuleCard>
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
