import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type { Root, Content, PhrasingContent, TableRow, TableCell } from 'mdast';

// Styles for PDF markdown elements
const styles = StyleSheet.create({
  h1: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    borderBottom: '1px solid #ddd',
    paddingBottom: 5,
  },
  h2: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  h3: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 4,
    marginLeft: 15,
    flexDirection: 'row',
  },
  listBullet: {
    width: 20,
  },
  listContent: {
    flex: 1,
  },
  table: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#bfbfbf',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
  },
  tableHeaderRow: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
  },
  tableCellLast: {
    borderRightWidth: 0,
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  code: {
    fontFamily: 'Courier',
    fontSize: 10,
    backgroundColor: '#f5f5f5',
  },
  codeBlock: {
    fontFamily: 'Courier',
    fontSize: 9,
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginVertical: 8,
  },
});

/**
 * Renders markdown content to PDF components using remark AST parsing.
 */
export function MarkdownToPdf({ content }: { content: string }) {
  // Parse markdown to AST
  const ast = unified().use(remarkParse).use(remarkGfm).parse(content);

  return <>{renderNode(ast)}</>;
}

let nodeKey = 0;

/**
 * Recursively renders AST nodes to PDF components
 */
function renderNode(node: Root | Content): React.ReactElement | React.ReactElement[] | null {
  const key = nodeKey++;

  switch (node.type) {
    case 'root':
      return <>{node.children.map((child) => renderNode(child))}</>;

    case 'heading': {
      const headingStyle = node.depth === 1 ? styles.h1 : node.depth === 2 ? styles.h2 : styles.h3;
      return (
        <Text key={key} style={headingStyle}>
          {renderInlineContent(node.children)}
        </Text>
      );
    }

    case 'paragraph':
      return (
        <Text key={key} style={styles.paragraph}>
          {renderInlineContent(node.children)}
        </Text>
      );

    case 'list':
      return (
        <View key={key}>
          {node.children.map((item, idx) => {
            const bullet = node.ordered ? `${idx + 1}.` : '•';
            return (
              <View key={`${key}-${idx}`} style={styles.listItem}>
                <Text style={styles.listBullet}>{bullet}</Text>
                <View style={styles.listContent}>
                  {item.children.map((child) => renderNode(child))}
                </View>
              </View>
            );
          })}
        </View>
      );

    case 'table':
      return (
        <View key={key} style={styles.table}>
          {node.children.map((row, rowIdx) => renderTableRow(row, rowIdx, key))}
        </View>
      );

    case 'blockquote':
      return (
        <View
          key={key}
          style={{
            marginLeft: 15,
            borderLeftWidth: 3,
            borderLeftColor: '#666',
            paddingLeft: 10,
            marginVertical: 8,
          }}
        >
          {node.children.map((child) => renderNode(child))}
        </View>
      );

    case 'code':
      return (
        <View key={key} style={styles.codeBlock}>
          <Text style={styles.code}>{node.value}</Text>
        </View>
      );

    case 'thematicBreak':
      return (
        <View
          key={key}
          style={{ borderBottomWidth: 1, borderBottomColor: '#ddd', marginVertical: 10 }}
        />
      );

    default:
      return null;
  }
}

/**
 * Renders a table row
 */
function renderTableRow(row: TableRow, rowIdx: number, parentKey: number): React.ReactElement {
  const isHeader = rowIdx === 0;
  const rowStyle = isHeader ? [styles.tableRow, styles.tableHeaderRow] : styles.tableRow;

  return (
    <View key={`${parentKey}-row-${rowIdx}`} style={rowStyle}>
      {row.children.map((cell, cellIdx) =>
        renderTableCell(cell, cellIdx, rowIdx, parentKey, cellIdx === row.children.length - 1)
      )}
    </View>
  );
}

/**
 * Renders a table cell
 */
function renderTableCell(
  cell: TableCell,
  cellIdx: number,
  rowIdx: number,
  parentKey: number,
  isLast: boolean
): React.ReactElement {
  const cellStyle = isLast ? [styles.tableCell, styles.tableCellLast] : styles.tableCell;
  const textStyle = rowIdx === 0 ? [styles.paragraph, styles.bold] : styles.paragraph;

  return (
    <View key={`${parentKey}-cell-${rowIdx}-${cellIdx}`} style={cellStyle}>
      <Text style={textStyle}>{renderInlineContent(cell.children)}</Text>
    </View>
  );
}

/**
 * Renders inline/phrasing content (text, bold, italic, code, links)
 */
function renderInlineContent(nodes: PhrasingContent[]): React.ReactNode {
  return nodes.map((node, idx) => {
    const key = `inline-${nodeKey++}-${idx}`;

    switch (node.type) {
      case 'text':
        return node.value;

      case 'strong':
        return (
          <Text key={key} style={styles.bold}>
            {renderInlineContent(node.children)}
          </Text>
        );

      case 'emphasis':
        return (
          <Text key={key} style={styles.italic}>
            {renderInlineContent(node.children)}
          </Text>
        );

      case 'inlineCode':
        return (
          <Text key={key} style={styles.code}>
            {node.value}
          </Text>
        );

      case 'link':
        return (
          <Text key={key} style={{ color: '#0066cc', textDecoration: 'underline' }}>
            {renderInlineContent(node.children)}
          </Text>
        );

      case 'break':
        return '\n';

      default:
        return null;
    }
  });
}
