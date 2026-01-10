import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FileSizeWarningModal } from './FileSizeWarningModal';
import type { FileSizeStatus } from '../../../../utils/fileSize';
import { Button } from '../Button';

const meta: Meta<typeof FileSizeWarningModal> = {
  title: 'Core UI/FileSizeWarningModal',
  component: FileSizeWarningModal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Modal dialog for warning users about large file sizes with compression recommendations.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FileSizeWarningModal>;

const warningStatus: FileSizeStatus = {
  size: 28.5 * 1024 * 1024,
  formattedSize: '28.5 MB',
  isOptimal: false,
  needsWarning: true,
  isTooLarge: false,
  estimatedTime: '~2 minutes',
  recommendation: 'We recommend compressing this file for faster processing and reduced memory usage.',
};

const errorStatus: FileSizeStatus = {
  size: 65.2 * 1024 * 1024,
  formattedSize: '65.2 MB',
  isOptimal: false,
  needsWarning: true,
  isTooLarge: true,
  estimatedTime: '~5 minutes',
  recommendation: 'This file exceeds the 50MB limit and must be compressed before processing.',
};

/**
 * Warning state for files larger than recommended but under the maximum limit.
 * Shows three action buttons: Compress, Continue Anyway, Cancel.
 */
export const WarningState: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Warning Modal</Button>
        <FileSizeWarningModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          fileSizeStatus={warningStatus}
          onProceed={() => {
            console.log('Proceeding without compression');
            setIsOpen(false);
          }}
          onCompress={() => {
            console.log('Compressing file');
            setIsOpen(false);
          }}
        />
      </>
    );
  },
};

/**
 * Error state for files that exceed the maximum size limit.
 * Shows only Compress and Cancel buttons (no Continue Anyway option).
 */
export const ErrorState: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Error Modal</Button>
        <FileSizeWarningModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          fileSizeStatus={errorStatus}
          onProceed={() => {
            console.log('This should not be called in error state');
            setIsOpen(false);
          }}
          onCompress={() => {
            console.log('Compressing file');
            setIsOpen(false);
          }}
        />
      </>
    );
  },
};

/**
 * Medium file (20MB) - Warning state.
 */
export const MediumFile: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>20MB File</Button>
        <FileSizeWarningModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          fileSizeStatus={{
            size: 20.3 * 1024 * 1024,
            formattedSize: '20.3 MB',
            isOptimal: false,
            needsWarning: false,
            isTooLarge: false,
            estimatedTime: '~1.5 minutes',
            recommendation: 'Compression recommended for optimal performance.',
          }}
          onProceed={() => setIsOpen(false)}
          onCompress={() => setIsOpen(false)}
        />
      </>
    );
  },
};

/**
 * Large file (35MB) - Warning state.
 */
export const LargeFile: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>35MB File</Button>
        <FileSizeWarningModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          fileSizeStatus={{
            size: 35.7 * 1024 * 1024,
            formattedSize: '35.7 MB',
            isOptimal: false,
            needsWarning: true,
            isTooLarge: false,
            estimatedTime: '~3 minutes',
            recommendation: 'This file is quite large. Compression will significantly improve processing speed.',
          }}
          onProceed={() => setIsOpen(false)}
          onCompress={() => setIsOpen(false)}
        />
      </>
    );
  },
};

/**
 * Very large file (80MB) - Error state.
 */
export const VeryLargeFile: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>80MB File</Button>
        <FileSizeWarningModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          fileSizeStatus={{
            size: 80.1 * 1024 * 1024,
            formattedSize: '80.1 MB',
            isOptimal: false,
            needsWarning: true,
            isTooLarge: true,
            estimatedTime: '~8 minutes',
            recommendation: 'File exceeds 50MB limit. Compression required for processing.',
          }}
          onProceed={() => setIsOpen(false)}
          onCompress={() => setIsOpen(false)}
        />
      </>
    );
  },
};

/**
 * Extreme file (500MB) - Error state with long processing time.
 */
export const ExtremeFile: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>500MB File</Button>
        <FileSizeWarningModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          fileSizeStatus={{
            size: 500.8 * 1024 * 1024,
            formattedSize: '500.8 MB',
            isOptimal: false,
            needsWarning: true,
            isTooLarge: true,
            estimatedTime: '~45 minutes',
            recommendation: 'This file is extremely large. Compression is mandatory and will take several minutes.',
          }}
          onProceed={() => setIsOpen(false)}
          onCompress={() => setIsOpen(false)}
        />
      </>
    );
  },
};

/**
 * All file sizes comparison.
 */
export const AllSizes: Story = {
  render: () => {
    const [openModal, setOpenModal] = useState<string | null>(null);

    const files = [
      {
        id: 'medium',
        label: '20MB',
        status: {
          size: 20.3 * 1024 * 1024,
          formattedSize: '20.3 MB',
          isOptimal: false,
          needsWarning: false,
          isTooLarge: false,
          estimatedTime: '~1.5 minutes',
          recommendation: 'Compression recommended for optimal performance.',
        },
      },
      {
        id: 'large',
        label: '35MB',
        status: {
          size: 35.7 * 1024 * 1024,
          formattedSize: '35.7 MB',
          isOptimal: false,
          needsWarning: true,
          isTooLarge: false,
          estimatedTime: '~3 minutes',
          recommendation: 'Large file detected. Compression highly recommended.',
        },
      },
      {
        id: 'verylarge',
        label: '80MB',
        status: {
          size: 80.1 * 1024 * 1024,
          formattedSize: '80.1 MB',
          isOptimal: false,
          needsWarning: true,
          isTooLarge: true,
          estimatedTime: '~8 minutes',
          recommendation: 'File exceeds 50MB limit. Compression required.',
        },
      },
    ];

    return (
      <>
        <div className="flex gap-4">
          {files.map((file) => (
            <Button key={file.id} onClick={() => setOpenModal(file.id)}>
              {file.label}
            </Button>
          ))}
        </div>

        {files.map((file) => (
          <FileSizeWarningModal
            key={file.id}
            isOpen={openModal === file.id}
            onClose={() => setOpenModal(null)}
            fileSizeStatus={file.status}
            onProceed={() => setOpenModal(null)}
            onCompress={() => setOpenModal(null)}
          />
        ))}
      </>
    );
  },
};

/**
 * Real-world upload workflow example.
 */
export const UploadWorkflow: Story = {
  render: () => {
    const [showModal, setShowModal] = useState(false);
    const fileSize = '28.5 MB';

    const handleFileSelect = () => {
      setShowModal(true);
    };

    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-2 border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Upload Audio File
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Select an audio file to transcribe
          </p>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-12 text-center mb-6">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Drag and drop or click to browse
            </p>
            <Button onClick={handleFileSelect}>Select File ({fileSize})</Button>
          </div>

          <FileSizeWarningModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            fileSizeStatus={{
              size: 28.5 * 1024 * 1024,
              formattedSize: fileSize,
              isOptimal: false,
              needsWarning: true,
              isTooLarge: false,
              estimatedTime: '~2 minutes',
              recommendation: 'This file is larger than recommended. Compression will improve performance.',
            }}
            onProceed={() => {
              console.log('Proceeding without compression');
              setShowModal(false);
            }}
            onCompress={() => {
              console.log('Compressing file...');
              setShowModal(false);
            }}
          />
        </div>
      </div>
    );
  },
};

/**
 * Dark mode comparison.
 */
export const DarkModeComparison: Story = {
  render: () => {
    const [lightOpen, setLightOpen] = useState(false);
    const [darkOpen, setDarkOpen] = useState(false);

    return (
      <div className="grid grid-cols-2 gap-8 p-8">
        {/* Light Mode */}
        <div className="bg-white p-8 rounded-lg">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Light Mode</h4>
          <Button onClick={() => setLightOpen(true)}>Open Modal</Button>
          <FileSizeWarningModal
            isOpen={lightOpen}
            onClose={() => setLightOpen(false)}
            fileSizeStatus={warningStatus}
            onProceed={() => setLightOpen(false)}
            onCompress={() => setLightOpen(false)}
          />
        </div>

        {/* Dark Mode */}
        <div className="dark bg-slate-900 p-8 rounded-lg">
          <h4 className="text-lg font-semibold text-white mb-4">Dark Mode</h4>
          <div className="dark">
            <Button onClick={() => setDarkOpen(true)}>Open Modal</Button>
            <FileSizeWarningModal
              isOpen={darkOpen}
              onClose={() => setDarkOpen(false)}
              fileSizeStatus={warningStatus}
              onProceed={() => setDarkOpen(false)}
              onCompress={() => setDarkOpen(false)}
            />
          </div>
        </div>
      </div>
    );
  },
};
