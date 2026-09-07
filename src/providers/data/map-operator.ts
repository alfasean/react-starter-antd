import type { CrudOperators } from '@refinedev/core';

/**
 * Translates Refine's CRUD operators into the tokens the backend filter
 * grammar expects (`name-=-acme, active=true`).
 *
 * These tokens are a wire contract — changing one silently changes what the
 * server returns. Do not "tidy" them.
 */
export function mapOperator(operator: CrudOperators): string {
  switch (operator) {
    case 'or':
      return '|';
    case 'eq':
      return '=';
    case 'ne':
      return '!=';
    case 'lt':
      return '<';
    case 'gt':
      return '>';
    case 'lte':
      return '<=';
    case 'gte':
      return '>=';
    case 'in':
      return '#In';
    case 'nin':
      return '#NotIn';
    case 'contains':
    case 'ncontains':
      return '-=-';
    case 'containss':
    case 'ncontainss':
      return '-=-*';
    case 'null':
      return '==';
    case 'startswith':
      return '^';
    case 'nstartswith':
      return '!^';
    case 'startswiths':
    case 'nstartswiths':
      return '=-*';
    case 'endswith':
      return '$';
    case 'nendswith':
      return '!$';
    case 'endswiths':
    case 'nendswiths':
      return '-=*';
    default:
      return '';
  }
}
