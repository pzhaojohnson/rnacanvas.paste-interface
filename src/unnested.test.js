/**
 * @jest-environment jsdom
 */

import { unnested } from './unnested';

test('`function unnested()`', () => {
  // empty array
  expect(unnested([])).toStrictEqual([]);

  let root = document.createElement('div');
  let a = document.createElement('div');
  let b = document.createElement('div');
  let a1 = document.createElement('span');
  let a1x = document.createElement('span');
  let b1 = document.createElement('span');
  let loner = document.createElement('div');

  root.append(a, b);
  a.append(a1);
  a1.append(a1x);
  b.append(b1);

  // single node
  expect(unnested([a1])).toStrictEqual([a1]);

  // no nesting
  expect(unnested([a, b, loner])).toStrictEqual([a, b, loner]);

  // simple nesting
  expect(unnested([a, a1])).toStrictEqual([a]);
  expect(unnested([a1, a])).toStrictEqual([a]);

  // deep (non-direct) nesting
  expect(unnested([a1x, root])).toStrictEqual([root]);
  expect(unnested([a, a1x, b1])).toStrictEqual([a, b1]);

  // multiple levels with unrelated nodes (order is preserved)
  expect(unnested([a1x, b1, a, loner, a1, b])).toStrictEqual([a, loner, b]);

  // nodes that are siblings of nested nodes are kept
  expect(unnested([a1, b1, a1x])).toStrictEqual([a1, b1]);

  // does not modify the input array
  let input = [a1, a, b];
  let output = unnested(input);

  expect(output).not.toBe(input);
  expect(input).toStrictEqual([a1, a, b]);
});
