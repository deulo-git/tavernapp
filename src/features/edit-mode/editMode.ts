import { createContext, useContext } from 'react';

export interface EditModeApi {
  editing: boolean;
  /** Asks for the PIN and enters edit mode if it is correct. */
  requestEdit(): void;
  exitEdit(): void;
}

export const EditModeContext = createContext<EditModeApi>({
  editing: false,
  requestEdit: () => {},
  exitEdit: () => {},
});

export function useEditMode(): EditModeApi {
  return useContext(EditModeContext);
}
