import React from 'react';
import { AppContainer } from './components/App/AppContainer';

interface AppProps {
  onReady?: () => void;
}

const App: React.FC<AppProps> = () => {
  return <AppContainer />;
};

export default App;
