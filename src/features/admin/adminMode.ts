import { createContext, useContext } from 'react';

export interface AdminApi {
  /** Asks for the admin password and opens the sizes panel if it is correct. */
  requestAdmin(): void;
  panelOpen: boolean;
}

export const AdminContext = createContext<AdminApi>({ requestAdmin: () => {}, panelOpen: false });

export function useAdmin(): AdminApi {
  return useContext(AdminContext);
}
