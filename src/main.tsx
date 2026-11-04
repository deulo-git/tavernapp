import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import './styles/tokens.css';
import './styles/global.css';
import { App } from './App';
import { applyTheme, watchSystemTheme } from './app/theme';
import { DataProvider } from './data/DataProvider';
import { isFirebaseConfigured } from './data/firebaseConfig';
import type { Repository } from './data/repository';
import { FeedbackProvider } from './ui/FeedbackProvider';

async function createRepository(): Promise<Repository> {
  // Firebase is only loaded when configured, so demo mode stays light.
  if (isFirebaseConfigured) {
    const { FirestoreRepository } = await import('./data/firestoreRepo');
    return new FirestoreRepository();
  }
  const { LocalRepository } = await import('./data/localRepo');
  return new LocalRepository();
}

applyTheme();
watchSystemTheme();

createRepository().then((repo) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <DataProvider repo={repo}>
        <FeedbackProvider>
          <App />
        </FeedbackProvider>
      </DataProvider>
    </StrictMode>,
  );
});
