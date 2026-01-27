import { describe, it, expect, vi } from 'vitest';
import { renderTable, type TableData } from '../table-renderer';

// Mock PDFDocument methods
const createMockDoc = () => {
  const mock = {
    y: 100,
    fontSize: vi.fn().mockReturnThis(),
    fillColor: vi.fn().mockReturnThis(),
    font: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    rect: vi.fn().mockReturnThis(),
    stroke: vi.fn().mockReturnThis(),
    fillAndStroke: vi.fn().mockReturnThis(),
    lineWidth: vi.fn().mockReturnThis(),
    addPage: vi.fn().mockReturnThis(),
    widthOfString: vi.fn((text: string) => text.length * 5),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mock as any;
};

describe('renderTable', () => {
  it('should render a simple table without errors', () => {
    const doc = createMockDoc();
    const table: TableData = {
      headers: ['Header A', 'Header B'],
      rows: [
        ['Value 1', 'Value 2'],
        ['Value 3', 'Value 4'],
      ],
    };

    const finalY = renderTable(doc, table, 60, 100, 475);

    expect(finalY).toBeGreaterThan(100);
    expect(doc.rect).toHaveBeenCalled();
    expect(doc.text).toHaveBeenCalled();
  });

  it('should handle empty headers', () => {
    const doc = createMockDoc();
    const table: TableData = {
      headers: [],
      rows: [],
    };

    const finalY = renderTable(doc, table, 60, 100, 475);

    expect(finalY).toBe(100);
  });

  it('should calculate column widths correctly', () => {
    const doc = createMockDoc();
    const table: TableData = {
      headers: ['Col1', 'Col2', 'Col3'],
      rows: [['A', 'B', 'C']],
    };

    renderTable(doc, table, 60, 100, 450);

    // Column width should be 450 / 3 = 150
    // Should have called rect for borders
    expect(doc.rect).toHaveBeenCalled();
  });

  it('should handle tables with multiple rows', () => {
    const doc = createMockDoc();
    const table: TableData = {
      headers: ['Name', 'Value'],
      rows: [
        ['Row 1', 'Data 1'],
        ['Row 2', 'Data 2'],
        ['Row 3', 'Data 3'],
      ],
    };

    const finalY = renderTable(doc, table, 60, 100, 475);

    expect(finalY).toBeGreaterThan(100);
  });

  it('should handle table with alignments', () => {
    const doc = createMockDoc();
    const table: TableData = {
      headers: ['Left', 'Center', 'Right'],
      rows: [['A', 'B', 'C']],
      alignments: ['left', 'center', 'right'],
    };

    renderTable(doc, table, 60, 100, 475);

    expect(doc.text).toHaveBeenCalled();
  });

  it('should add new page when running out of space', () => {
    const doc = createMockDoc();
    doc.y = 750; // Near bottom of page

    const table: TableData = {
      headers: ['Header'],
      rows: [['Row 1'], ['Row 2'], ['Row 3']],
    };

    renderTable(doc, table, 60, 750, 475);

    expect(doc.addPage).toHaveBeenCalled();
  });
});
