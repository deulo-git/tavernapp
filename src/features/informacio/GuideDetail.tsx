import { useState } from 'react';
import { hasTranslation, translatedField } from '../../domain/translation';
import type { Guide } from '../../domain/types';
import { GUIDE_TOPICS } from '../../domain/types';
import { Button, IconButton } from '../../ui/Button';
import { ItemImage } from '../../ui/ItemImage';
import { Sheet } from '../../ui/Sheet';
import { useEditMode } from '../edit-mode/editMode';
import { PresentView } from '../present/PresentView';
import { DetailLayout, ExplanationBlock, UpdatedNote } from '../catalog/DetailParts';
import s from '../catalog/detail.module.css';

interface Props {
  guide: Guide;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function GuideDetail({ guide, onClose, onEdit, onDelete }: Props) {
  const { editing } = useEditMode();
  const [presenting, setPresenting] = useState(false);
  const topic = GUIDE_TOPICS.find((t) => t.key === guide.topic)?.label ?? 'Fitxa';

  return (
    <Sheet
      title={topic}
      onClose={onClose}
      actions={
        editing && (
          <>
            <Button variant="edit" icon="edit" onClick={onEdit}>
              Edita
            </Button>
            <IconButton icon="trash" label="Elimina" danger onClick={onDelete} />
          </>
        )
      }
    >
      <DetailLayout
        aside={
          <>
            <ItemImage itemId={guide.id} image={guide.image} alt={guide.title} icon="book" full className={s.image} />
            <Button variant="primary" size="lg" icon="present" block onClick={() => setPresenting(true)}>
              Mostra al client
            </Button>
          </>
        }
      >
        <h1 className={s.name}>{guide.title}</h1>
        <ExplanationBlock item={guide} field="body" titleField="title" title="Explicació" />
        <UpdatedNote item={guide} />
      </DetailLayout>

      {presenting && (
        <PresentView
          itemId={guide.id}
          image={guide.image}
          icon="book"
          available={(l) => l === 'ca' || hasTranslation(guide, l)}
          onClose={() => setPresenting(false)}
          content={(lang) => ({
            title: translatedField(guide, lang, 'title'),
            originalTitle: lang === 'ca' ? undefined : guide.title,
            description: translatedField(guide, lang, 'body'),
          })}
        />
      )}
    </Sheet>
  );
}
