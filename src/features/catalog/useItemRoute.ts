import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

/**
 * Detail and edit panels are encoded in the URL (?item=<id> / ?edit=<id|new>) so a reload
 * keeps the same view. History entries are replaced, not pushed: an installed iPad web app
 * has no back button, and the panels have their own close buttons.
 */
export function useItemRoute() {
  const [params, setParams] = useSearchParams();
  const itemId = params.get('item');
  const editId = params.get('edit');

  const update = useCallback(
    (key: 'item' | 'edit', value: string | null) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('item');
          next.delete('edit');
          if (value) next.set(key, value);
          return next;
        },
        { replace: true },
      ),
    [setParams],
  );

  return {
    itemId,
    editId,
    openItem: useCallback((id: string) => update('item', id), [update]),
    openEdit: useCallback((id: string) => update('edit', id), [update]),
    close: useCallback(() => update('item', null), [update]),
  };
}
