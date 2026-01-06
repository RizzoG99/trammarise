import type { ReactNode, CSSProperties } from 'react';

export type TextVariant = 'body' | 'caption' | 'small';
export type TextColor = 'primary' | 'secondary' | 'tertiary';

export interface TextProps {
  variant?: TextVariant;
  color?: TextColor;
  children: ReactNode;
  className?: string;
  as?: 'p' | 'span' | 'div';
  style?: CSSProperties;
  title?: string;
}

export function Text({
  variant = 'body',
  color = 'primary',
  children,
  className = '',
  as: Component = 'p',
  style,
  title,
}: TextProps) {
  const variantClasses = {
    body: 'text-[var(--font-size-body)] leading-relaxed',
    caption: 'text-[var(--font-size-caption)] leading-normal',
    small: 'text-[var(--font-size-small)] leading-normal',
  };

  const colorClasses = {
    primary: 'text-text-primary',
    secondary: 'text-text-secondary',
    tertiary: 'text-text-tertiary',
  };

  return (
    <Component 
      className={`${variantClasses[variant]} ${colorClasses[color]} ${className}`}
      style={style}
      title={title}
    >
      {children}
    </Component>
  );
}
