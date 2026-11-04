import { useState } from 'react';
import { newId, nextOrder } from '../../data/actions';
import { useData } from '../../data/store';
import { sourceFields } from '../../domain/translation';
import type { Guide, GuideTopic } from '../../domain/types';
import { GUIDE_TOPICS } from '../../domain/types';
import { Segmented, TextArea, TextField } from '../../ui/Field';
import { ImagePicker } from '../../ui/ImagePicker';
import { FormSection, FormSheet } from '../forms/FormSheet';
import { TranslationEditor } from '../forms/TranslationEditor';
import { useItemForm } from '../forms/useItemForm';

function emptyGuide(topic: GuideTopic, order: number): Guide {
  const now = Date.now();
  return {
    id: newId(),
    kind: 'guide',
    title: '',
    topic,
    body: '',
    order,
    available: true,
    image: null,
    createdAt: now,
    updatedAt: now,
  };
}

interface Props {
  guide: Guide | null;
  defaultTopic: GuideTopic;
  onClose: () => void;
  onSaved: (guide: Guide) => void;
}

export function GuideForm({ guide, defaultTopic, onClose, onSaved }: Props) {
  const { guides } = useData();
  const [initial] = useState(() => guide ?? emptyGuide(defaultTopic, nextOrder(guides)));
  const live = guides.find((g) => g.id === initial.id);
  const form = useItemForm(initial, guide ? live : undefined, onSaved);
  const { draft, set } = form;

  return (
    <FormSheet
      title={guide ? `Edita: ${guide.title}` : 'Nova fitxa'}
      dirty={form.dirty}
      conflict={form.conflict}
      saving={form.saving}
      onClose={onClose}
      onSave={() => form.save(() => (draft.title.trim() ? null : 'Cal posar un títol a la fitxa.'))}
    >
      <FormSection
        title="Fitxa per explicar al client"
        note="Per exemple: què són les Fires de Girona, com arribar a la Catedral, què és el pa amb tomàquet…"
      >
        <TextField
          label="Títol"
          value={draft.title}
          onChange={(v) => set('title', v)}
          placeholder="Les Fires de Girona"
          autoFocus={!guide}
        />
        <Segmented
          label="Tema"
          options={GUIDE_TOPICS.map((t) => ({ value: t.key, label: t.label }))}
          value={draft.topic}
          allowEmpty={false}
          onChange={(v) => v && set('topic', v)}
        />
        <TextArea
          label="Explicació (en català)"
          value={draft.body}
          rows={9}
          onChange={(v) => set('body', v)}
          hint="Es traduirà automàticament al castellà, l'anglès i el francès."
        />
        <ImagePicker
          preview={form.previewImage}
          onSelect={(image) => form.setImageChange({ kind: 'set', image })}
          onRemove={() => form.setImageChange({ kind: 'remove' })}
        />
      </FormSection>

      <TranslationEditor
        fields={sourceFields(draft)}
        draft={form.trDraft}
        onChange={form.setTrDraft}
        savedStatus={initial.tr?.status}
        savedError={initial.tr?.error}
      />
    </FormSheet>
  );
}
