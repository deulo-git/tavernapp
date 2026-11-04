import { useState } from 'react';
import { moveInList, newId, nextOrder, saveCategory } from '../../data/actions';
import { useData } from '../../data/store';
import type { Category } from '../../domain/types';
import { Button, IconButton } from '../../ui/Button';
import { Sheet } from '../../ui/Sheet';
import { useFeedback } from '../../ui/feedback';
import ui from '../../ui/ui.module.css';
import { FormSection } from '../forms/FormSheet';
import s from '../forms/form.module.css';

function CategoryRow({
  category,
  dishCount,
  onUp,
  onDown,
}: {
  category: Category;
  dishCount: number;
  onUp?: () => void;
  onDown?: () => void;
}) {
  const { repo } = useData();
  const { confirm, toast, reportError } = useFeedback();
  const [name, setName] = useState(category.name);

  const commit = () => {
    const trimmed = name.trim();
    if (!trimmed) setName(category.name);
    else if (trimmed !== category.name) saveCategory(repo, { ...category, name: trimmed }).catch(reportError);
  };

  const remove = async () => {
    if (dishCount > 0) {
      toast(`Aquesta categoria té ${dishCount} plats. Mou-los o elimina’ls primer.`, { tone: 'error' });
      return;
    }
    if (await confirm({ title: `Vols eliminar «${category.name}»?`, confirmLabel: 'Elimina', danger: true })) {
      repo.remove('categories', category.id).catch(reportError);
    }
  };

  return (
    <div className={s.listRow}>
      <input
        className={`${ui.input} ${s.grow}`}
        value={name}
        aria-label="Nom de la categoria"
        onChange={(e) => setName(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      />
      <span className={ui.hint} style={{ minWidth: 80 }}>
        {dishCount} plats
      </span>
      <IconButton icon="up" label="Mou amunt" onClick={onUp} disabled={!onUp} />
      <IconButton icon="down" label="Mou avall" onClick={onDown} disabled={!onDown} />
      <IconButton icon="trash" label="Elimina" danger onClick={remove} />
    </div>
  );
}

export function CategoryManager({ onClose }: { onClose: () => void }) {
  const { repo, categories, dishes } = useData();
  const { reportError } = useFeedback();
  const [newName, setNewName] = useState('');

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    const now = Date.now();
    saveCategory(repo, { id: newId(), name, order: nextOrder(categories), createdAt: now, updatedAt: now }).catch(
      reportError,
    );
    setNewName('');
  };

  return (
    <Sheet title="Categories de la carta" editing onClose={onClose}>
      <div className={s.form}>
        <FormSection title="Categories" note="Els canvis es desen automàticament.">
          {categories.map((c, i) => (
            <CategoryRow
              key={c.id}
              category={c}
              dishCount={dishes.filter((d) => d.categoryId === c.id).length}
              onUp={i > 0 ? () => moveInList(repo, 'categories', categories, i, -1, reportError) : undefined}
              onDown={
                i < categories.length - 1
                  ? () => moveInList(repo, 'categories', categories, i, 1, reportError)
                  : undefined
              }
            />
          ))}
          {categories.length === 0 && <p className={ui.hint}>Encara no hi ha cap categoria.</p>}
        </FormSection>
        <FormSection title="Nova categoria">
          <div className={s.row}>
            <input
              className={`${ui.input} ${s.grow}`}
              value={newName}
              placeholder="Per exemple: Arrossos"
              aria-label="Nom de la nova categoria"
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
            />
            <Button variant="primary" icon="plus" onClick={add} disabled={!newName.trim()}>
              Afegeix
            </Button>
          </div>
        </FormSection>
      </div>
    </Sheet>
  );
}
