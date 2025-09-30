import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">💖 Diff View</h1>
      <p className="text-gray-700">
        Welcome to your Electron + React + TypeScript application with Tailwind
        CSS!
      </p>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
