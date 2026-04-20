import { render, screen } from '@testing-library/react';
import App from './App';

test('renders DinoQuest login screen', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /welcome back to dinoquest/i })).toBeInTheDocument();
  expect(screen.getByText(/new to dinoquest\? click sign up to get started\./i)).toBeInTheDocument();
});
