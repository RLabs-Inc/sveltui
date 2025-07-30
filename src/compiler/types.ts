/**
 * Extended AST Node Types for SvelTUI Compiler
 * 
 * This module extends the standard estree types with additional
 * properties added by acorn parser and estree-walker.
 */

import type { 
  Node,
  Identifier,
  MemberExpression,
  CallExpression,
  AssignmentExpression,
  Expression,
  Super,
  SpreadElement,
  Pattern,
  SimpleCallExpression
} from 'estree';

/**
 * Base node with position and parent information
 */
export interface BaseExtendedNode {
  start?: number;
  end?: number;
  parent?: ExtendedNode;
}

/**
 * Union type for all extended nodes
 */
export type ExtendedNode = Node & BaseExtendedNode;

/**
 * Extended types for specific node types
 */
export type ExtendedIdentifier = Identifier & BaseExtendedNode;
export type ExtendedMemberExpression = MemberExpression & BaseExtendedNode & {
  object: ExtendedNode;
  property: ExtendedNode;
};
export type ExtendedCallExpression = (CallExpression | SimpleCallExpression) & BaseExtendedNode & {
  callee: ExtendedNode;
  arguments: ExtendedNode[];
};
export type ExtendedAssignmentExpression = AssignmentExpression & BaseExtendedNode & {
  left: ExtendedNode;
  right: ExtendedNode;
};
export type ExtendedExpression = Expression & BaseExtendedNode;
export type ExtendedSuper = Super & BaseExtendedNode;
export type ExtendedSpreadElement = SpreadElement & BaseExtendedNode & {
  argument: ExtendedNode;
};
export type ExtendedPattern = Pattern & BaseExtendedNode;

/**
 * Type guard to check if a node is a CallExpression
 */
export function isCallExpression(node: ExtendedNode): node is ExtendedCallExpression {
  return node.type === 'CallExpression';
}

/**
 * Type guard to check if a node is a MemberExpression
 */
export function isMemberExpression(node: ExtendedNode): node is ExtendedMemberExpression {
  return node.type === 'MemberExpression';
}

/**
 * Type guard to check if a node is an Identifier
 */
export function isIdentifier(node: ExtendedNode): node is ExtendedIdentifier {
  return node.type === 'Identifier';
}

/**
 * Type guard to check if a node is an AssignmentExpression
 */
export function isAssignmentExpression(node: ExtendedNode): node is ExtendedAssignmentExpression {
  return node.type === 'AssignmentExpression';
}