import React from 'react';
import FormPage from './components/FormPage';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <div>
      <h1>Bioremediation Dashboard</h1>
      <FormPage />
      <hr />
      <Dashboard />
    </div>
  );
}

export default App;
