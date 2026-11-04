import { useState } from 'react';
import { useData } from '../../data/store';
import { matchesQuery } from '../../domain/search';
import { GUIDE_TOPIC_COLOR } from '../../domain/colors';
import type { GuideTopic } from '../../domain/types';
import { GUIDE_TOPICS } from '../../domain/types';
import { EmptyState } from '../../ui/EmptyState';
import ui from '../../ui/ui.module.css';
import { useEditMode } from '../edit-mode/editMode';
import { AddCard, ItemCard, SearchBox } from '../catalog/CatalogParts';
import { useCatalogActions } from '../catalog/useCatalogActions';
import { useItemRoute } from '../catalog/useItemRoute';
import { GuideDetail } from './GuideDetail';
import { GuideForm } from './GuideForm';
import cat from '../catalog/catalog.module.css';
import s from './info.module.css';

export function GuidesView() {
  const { guides } = useData();
  const { editing } = useEditMode();
  const { deleteItem, moveHandlers } = useCatalogActions();
  const route = useItemRoute();
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<GuideTopic | null>(null);

  const topics = GUIDE_TOPICS.filter((t) => guides.some((g) => g.topic === t.key));
  const visible = guides.filter((g) => (!topic || g.topic === topic) && matchesQuery(query, [g.title, g.body]));
  const canReorder = editing && !query.trim() && !topic;

  const selected = route.itemId ? guides.find((g) => g.id === route.itemId) : undefined;
  const editingGuide = route.editId && route.editId !== 'new' ? guides.find((g) => g.id === route.editId) : null;

  return (
    <>
      <div className={s.toolbarRow}>
        <SearchBox value={query} onChange={setQuery} placeholder="Cerca fitxes" />
      </div>
      {topics.length > 1 && (
        <div className={cat.chipsRow} style={{ padding: '0 0 16px' }}>
          <button
            type="button"
            className={[ui.segment, !topic && ui.segmentOn].filter(Boolean).join(' ')}
            onClick={() => setTopic(null)}
          >
            Totes
          </button>
          {topics.map((t) => (
            <button
              key={t.key}
              type="button"
              className={[ui.segment, topic === t.key && ui.segmentOn].filter(Boolean).join(' ')}
              onClick={() => setTopic(topic === t.key ? null : t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      <div className={cat.grid}>
        {editing && <AddCard label="Afegeix una fitxa" onClick={() => route.openEdit('new')} />}
        {visible.map((g) => (
          <ItemCard
            key={g.id}
            itemId={g.id}
            image={g.image}
            icon="book"
            color={GUIDE_TOPIC_COLOR[g.topic]}
            title={g.title}
            subtitle={g.body.split('\n')[0].slice(0, 110) + (g.body.length > 110 ? '…' : '')}
            badges={<span className={ui.badge}>{GUIDE_TOPICS.find((t) => t.key === g.topic)?.label}</span>}
            onOpen={() => route.openItem(g.id)}
            edit={
              editing
                ? {
                    onEdit: () => route.openEdit(g.id),
                    onDelete: () => void deleteItem(g),
                    move: canReorder ? moveHandlers('guides', guides, guides.indexOf(g)) : undefined,
                  }
                : undefined
            }
          />
        ))}
      </div>
      {visible.length === 0 && !editing && (
        <EmptyState icon="book" title={guides.length ? 'Cap fitxa coincideix' : 'Encara no hi ha fitxes'}>
          {!guides.length && (
            <p>Afegeix fitxes per explicar als clients coses de la ciutat, la cuina o el restaurant.</p>
          )}
        </EmptyState>
      )}

      {selected && (
        <GuideDetail
          key={selected.id}
          guide={selected}
          onClose={route.close}
          onEdit={() => route.openEdit(selected.id)}
          onDelete={async () => {
            if (await deleteItem(selected)) route.close();
          }}
        />
      )}
      {editing && route.editId && (editingGuide || route.editId === 'new') && (
        <GuideForm
          key={route.editId}
          guide={editingGuide ?? null}
          defaultTopic={topic ?? 'girona'}
          onClose={route.close}
          onSaved={(g) => route.openItem(g.id)}
        />
      )}
    </>
  );
}
