import React, { useEffect } from 'react';
import Layout from './components/Layout/Layout';

interface AppProps {
  onReady?: () => void;
}

const App: React.FC<AppProps> = ({ onReady }) => {
  useEffect(() => {
    if (onReady) {
      onReady();
    }
  }, [onReady]);

  return <Layout />;
};

export default App;
