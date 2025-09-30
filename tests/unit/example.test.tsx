import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Simple test component for verification
const TestComponent = () => {
  return <div>Hello, Test!</div>;
};

describe('Test Setup Verification', () => {
  it('should render a simple component', () => {
    render(<TestComponent />);
    expect(screen.getByText('Hello, Test!')).toBeInTheDocument();
  });

  it('should have access to mocked Electron API', () => {
    expect(window.electronAPI).toBeDefined();
    expect(window.electronAPI.minimizeWindow).toBeDefined();
    expect(window.electronAPI.getTheme).toBeDefined();
  });
});
