import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { ChatSidePanel } from './ChatSidePanel';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback,
  }),
}));

// Mock ChatInterface to avoid testing child components in isolation
vi.mock('@/lib', () => ({
  ChatInterface: ({
    onSendMessage,
    isLoading,
  }: {
    onSendMessage: (msg: string) => void;
    isLoading: boolean;
  }) => (
    <div data-testid="mock-chat-interface">
      <button onClick={() => onSendMessage('test message')}>Send</button>
      {isLoading && <span>Loading...</span>}
    </div>
  ),
}));

describe('ChatSidePanel', () => {
  it('does not render anything when isOpen is false', () => {
    const { container } = render(
      <ChatSidePanel
        isOpen={false}
        onClose={vi.fn()}
        isLoading={false}
        chatHistory={[]}
        onSendMessage={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders correctly when isOpen is true', () => {
    render(
      <ChatSidePanel
        isOpen={true}
        onClose={vi.fn()}
        isLoading={false}
        chatHistory={[]}
        onSendMessage={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog', { name: 'Refine with AI' })).toBeInTheDocument();
    expect(screen.getByTestId('mock-chat-interface')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <ChatSidePanel
        isOpen={true}
        onClose={onClose}
        isLoading={false}
        chatHistory={[]}
        onSendMessage={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('passes down props to ChatInterface', () => {
    const onSendMessage = vi.fn();
    render(
      <ChatSidePanel
        isOpen={true}
        onClose={vi.fn()}
        isLoading={true} // Set loading to true
        chatHistory={[]}
        onSendMessage={onSendMessage}
      />
    );

    // If isLoading is passed correctly to mock, 'Loading...' text will appear
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Trigger onSendMessage
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSendMessage).toHaveBeenCalledWith('test message');
  });
});
