import { render, screen, fireEvent } from '@testing-library/react';
import { UploadRecordTabs } from './UploadRecordTabs';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

describe('UploadRecordTabs', () => {
  const uploadPanel = <div data-testid="upload-panel">Upload Panel</div>;
  const recordPanel = <div data-testid="record-panel">Record Panel</div>;

  it('renders both panels on desktop', () => {
    render(<UploadRecordTabs uploadPanel={uploadPanel} recordPanel={recordPanel} />);

    // desktop view is side-by-side so both panels should be in the document
    const desktopContainer = document.querySelector('.lg\\:grid');
    expect(desktopContainer).toBeInTheDocument();

    const upload = screen.getAllByTestId('upload-panel');
    const record = screen.getAllByTestId('record-panel');

    // One from mobile container, one from desktop container for upload
    // For record, it is only active on desktop initially
    expect(upload).toHaveLength(2);
    expect(record).toHaveLength(1);
  });

  it('switches between upload and record tabs on mobile', () => {
    // We can interact with buttons which should be 2 tabs
    render(<UploadRecordTabs uploadPanel={uploadPanel} recordPanel={recordPanel} />);

    // By default 'upload' is active
    const uploadTabButton = screen.getByRole('button', { name: /Upload File/i });
    const recordTabButton = screen.getByRole('button', { name: /Record Audio/i });

    expect(uploadTabButton).toHaveClass('bg-white');
    expect(recordTabButton).not.toHaveClass('bg-white');

    // Default mobile view shows the upload panel in the tab container
    // To check this robustly, we can check which element matches our mobile view container
    const mobileContainer = document.querySelector('.lg\\:hidden');
    expect(mobileContainer).toContainElement(screen.getAllByTestId('upload-panel')[0]);
    // The mobile container should NOT contain the record-panel initially
    // Wait, the mobile container only renders activeTab content.
    expect(mobileContainer).not.toContainElement(screen.getAllByTestId('record-panel')[0]);

    // Click Record Tab
    fireEvent.click(recordTabButton);
    expect(recordTabButton).toHaveClass('bg-white');
    expect(uploadTabButton).not.toHaveClass('bg-white');

    // Mobile container should now show the record panel
    expect(mobileContainer).toContainElement(screen.getAllByTestId('record-panel')[0]);
    expect(mobileContainer).not.toContainElement(screen.getAllByTestId('upload-panel')[0]);
  });
});
