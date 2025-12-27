
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Gallery } from './components/Gallery';
import { DesignStudio } from './components/DesignStudio';
import { LiveCarver } from './components/LiveCarver';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('Home');

  const renderContent = () => {
    switch (currentView) {
      case 'Home':
        return <Home onNavigate={setCurrentView} />;
      case 'Gallery':
        return <Gallery />;
      case 'Studio':
        return <DesignStudio />;
      case 'LiveConsult':
        return <LiveCarver />;
      default:
        return <Home onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

export default App;
