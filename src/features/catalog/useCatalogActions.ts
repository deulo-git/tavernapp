import { useCallback } from 'react';
import { deleteCatalogItem, moveInList } from '../../data/actions';
import { useRepo } from '../../data/store';
import type { CatalogItem, CollectionName } from '../../domain/types';
import { itemTitle } from '../../domain/types';
import { useFeedback } from '../../ui/feedback';

export function useCatalogActions() {
  const repo = useRepo();
  const { confirm, toast, reportError } = useFeedback();

  /** Asks for confirmation, deletes, and offers "Desfés". Resolves true if deleted. */
  const deleteItem = useCallback(
    async (item: CatalogItem) => {
      const title = itemTitle(item);
      const ok = await confirm({
        title: `Vols eliminar «${title}»?`,
        message: 'Desapareixerà de totes les tablets. Ho podràs desfer durant uns segons.',
        confirmLabel: 'Elimina',
        danger: true,
      });
      if (!ok) return false;
      const undo = await deleteCatalogItem(repo, item, reportError);
      toast(`S'ha eliminat «${title}».`, { action: { label: 'Desfés', onClick: undo } });
      return true;
    },
    [repo, confirm, toast, reportError],
  );

  /** Up/down handlers for item `index` of an ordered group (undefined at the ends). */
  const moveHandlers = useCallback(
    <T extends { id: string; order: number }>(col: CollectionName, group: T[], index: number) => ({
      up: index > 0 ? () => moveInList(repo, col, group, index, -1, reportError) : undefined,
      down: index < group.length - 1 ? () => moveInList(repo, col, group, index, 1, reportError) : undefined,
    }),
    [repo, reportError],
  );

  return { deleteItem, moveHandlers };
}
