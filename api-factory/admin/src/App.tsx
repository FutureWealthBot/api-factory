import React from 'react';
import { TierFeaturesCard } from './components';

const App: React.FC = () => {
    return (
        <div>
            <h1>Welcome to the API Factory Admin</h1>
            <p>This is the admin interface for managing the API Factory.</p>
            <h2>Feature Tiers</h2>
            <TierFeaturesCard />
        </div>
    );
};

export default App;