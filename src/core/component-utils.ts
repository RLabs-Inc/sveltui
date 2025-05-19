/**
 * Component Utilities for SveltUI
 * 
 * This file contains shared utility functions for component implementations.
 */

import type { Option } from './types';

/**
 * Normalize options array to Option objects
 */
export function normalizeOptions(options: (string | Option)[]): Option[] {
  return options.map(opt => 
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );
}

/**
 * Filter out special props that shouldn't be directly applied to blessed element
 */
export function filterSpecialProps(props: Record<string, any>, componentType: string): string[] {
  // Common props to exclude
  const common = ['parent', 'children', 'handleKeyNavigation', 'handleFocus', 'handleBlur'];
  
  // Component-specific props to exclude
  switch (componentType.toLowerCase()) {
    case 'select':
      return [
        ...common,
        'options',
        'value',
        'open',
        'placeholder',
        'onChange',
        'onOpen',
        'onClose'
      ];
    case 'checkbox':
      return [
        ...common,
        'checked',
        'indeterminate',
        'label',
        'disabled',
        'onChange'
      ];
    case 'input':
      return [
        ...common,
        'value',
        'placeholder',
        'onChange',
        'onSubmit'
      ];
    case 'list':
      return [
        ...common,
        'items',
        'selectedIndex',
        'onSelect'
      ];
    default:
      return common;
  }
}