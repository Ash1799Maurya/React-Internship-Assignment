import React from 'react';
import ItemsTable from './components/ItemsTable';


const App: React.FC = () => {
    return (
        <div className="p-4">
            <h1>Items Table</h1>
            <ItemsTable/>
        </div>
    );
};

export default App;
