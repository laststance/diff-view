import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import { MainView } from '../components/MainView';

// Router setup for future extensibility
// Currently only has one route, but can be expanded for settings, help, etc.
export const AppRouter: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Main diff view route */}
        <Route path="/" element={<MainView />} />

        {/* Future routes can be added here */}
        {/* <Route path="/settings" element={<SettingsView />} /> */}
        {/* <Route path="/help" element={<HelpView />} /> */}
        {/* <Route path="/about" element={<AboutView />} /> */}

        {/* Catch-all redirect to main view */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

// Route constants for type safety and easy maintenance
export const ROUTES = {
  HOME: '/',
  SETTINGS: '/settings',
  HELP: '/help',
  ABOUT: '/about',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
