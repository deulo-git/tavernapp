import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { useData } from './data/store';
import { InstallHint, UpdatePrompt } from './app/PwaPrompts';
import { Button } from './ui/Button';
import { EmptyState, Spinner } from './ui/EmptyState';
import { AllergyFilterProvider } from './features/catalog/AllergyFilter';
import { EditModeProvider } from './features/edit-mode/EditModeProvider';
import { HomeScreen } from './features/home/HomeScreen';
import { MenjarScreen } from './features/menjar/MenjarScreen';
import { BegudesScreen } from './features/begudes/BegudesScreen';
import { InformacioScreen } from './features/informacio/InformacioScreen';
import { PairingScreen } from './features/pairing/PairingScreen';
import { SetupWizard } from './features/pairing/SetupWizard';
import s from './app/app.module.css';

function Gate() {
  const { status, error, reinit } = useData();

  switch (status) {
    case 'loading':
      return (
        <div className={s.centered}>
          <Spinner />
        </div>
      );
    case 'error':
      return (
        <div className={s.centered}>
          <EmptyState icon="cloudOff" title="No s'ha pogut iniciar">
            <p>{error}</p>
            <Button variant="primary" size="lg" icon="refresh" onClick={reinit}>
              Torna-ho a provar
            </Button>
          </EmptyState>
        </div>
      );
    case 'needsSetup':
      return <SetupWizard />;
    case 'needsPairing':
      return <PairingScreen />;
    case 'ready':
      return (
        <EditModeProvider>
          <AllergyFilterProvider>
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/menjar/:cat?" element={<MenjarScreen />} />
              <Route path="/begudes/:tipus?" element={<BegudesScreen />} />
              <Route path="/informacio/:tab?" element={<InformacioScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AllergyFilterProvider>
        </EditModeProvider>
      );
  }
}

export function App() {
  return (
    <BrowserRouter>
      <div className={s.app}>
        <UpdatePrompt />
        <InstallHint />
        <div className={s.main}>
          <Gate />
        </div>
      </div>
    </BrowserRouter>
  );
}
