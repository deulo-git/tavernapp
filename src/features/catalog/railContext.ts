import { createContext, useContext } from 'react';

/** Open/closed state of the category index on the right of a catalog screen. */
export const RailContext = createContext<{ open: boolean; toggle: () => void }>({ open: true, toggle: () => {} });

export function useRail() {
  return useContext(RailContext);
}
