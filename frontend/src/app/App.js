/**
 * Main App Component
 *
 * Application entry point.
 * Sets up providers and routing.
 */

import React from 'react';
import AppProviders from './AppProviders';
import AppRouter from './AppRouter';
import './App.css';

function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

export default App;

