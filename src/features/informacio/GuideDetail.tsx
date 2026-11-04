import type { Guide } from '../../domain/types';
import { GUIDE_TOPICS } from '../../domain/types';
import { Button, IconButton } from '../../ui/Button';
import { Sheet } from '../../ui/Sheet';
import { useEditMode } from '../edit-mode/editMode';
import { DetailImage, DetailLayout, ExplanationBlock, UpdatedNote } from '../catalog/DetailParts';
import s from '../catalog/detail.module.css';

interface Props {
  guide: Guide;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function GuideDetail({ guide, onClose, onEdit, onDelete }: Props) {
  const { editing } = useEditMode();
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
      <DetailLayout aside={<DetailImage itemId={guide.id} image={guide.image} alt={guide.title} icon="book" />}>
        <h1 className={s.name}>{guide.title}</h1>
        <ExplanationBlock item={guide} field="body" titleField="title" title="Explicació" />
        <UpdatedNote item={guide} />
      </DetailLayout>
    </Sheet>
  );
}
