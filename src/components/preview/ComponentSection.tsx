import React from 'react';

/**
 * Props documentation entry
 */
export interface PropDoc {
  /** Prop name */
  name: string;
  /** TypeScript type */
  type: string;
  /** Prop description */
  description: string;
  /** Whether the prop is required */
  required?: boolean;
  /** Default value if any */
  defaultValue?: string;
}

/**
 * ComponentSection properties
 */
export interface ComponentSectionProps {
  /** Component name */
  title: string;
  /** Component description */
  description: string;
  /** Array of prop documentation */
  props: PropDoc[];
  /** Interactive examples */
  children: React.ReactNode;
}

/**
 * A reusable section wrapper for displaying components in the preview page.
 *
 * Features:
 * - Component title and description
 * - Props documentation table
 * - Interactive examples area
 * - Consistent styling and layout
 */
export const ComponentSection: React.FC<ComponentSectionProps> = ({
  title,
  description,
  props,
  children,
}) => {
  return (
    <section className="mb-16 border-b border-slate-200 dark:border-slate-700 pb-12 last:border-b-0">
      {/* Header */}
      <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">
        {title}
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">{description}</p>

      {/* Props Documentation Table */}
      <div className="mb-8 overflow-x-auto bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left p-3 font-semibold text-slate-700 dark:text-slate-300">
                Prop
              </th>
              <th className="text-left p-3 font-semibold text-slate-700 dark:text-slate-300">
                Type
              </th>
              <th className="text-left p-3 font-semibold text-slate-700 dark:text-slate-300">
                Description
              </th>
              <th className="text-left p-3 font-semibold text-slate-700 dark:text-slate-300">
                Default
              </th>
            </tr>
          </thead>
          <tbody>
            {props.map((prop) => (
              <tr
                key={prop.name}
                className="border-b border-slate-100 dark:border-slate-700 last:border-b-0"
              >
                <td className="p-3">
                  <code className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                    {prop.name}
                    {prop.required && <span className="text-red-500">*</span>}
                  </code>
                </td>
                <td className="p-3">
                  <code className="text-emerald-600 dark:text-emerald-400 font-mono text-xs bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded">
                    {prop.type}
                  </code>
                </td>
                <td className="p-3 text-slate-600 dark:text-slate-400">
                  {prop.description}
                </td>
                <td className="p-3">
                  <code className="text-slate-500 dark:text-slate-500 font-mono text-xs">
                    {prop.defaultValue || '-'}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Interactive Examples */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
          Interactive Examples
        </h3>
        {children}
      </div>
    </section>
  );
};
