/**
 * Returns the subset of the nodes that are not contained by any other node in the array.
 *
 * This function returns a new array (and doesn't modify the input array).
 *
 * The relative ordering of nodes is maintained in the returned array.
 */
export function unnested<T extends Node>(nodes: T[]): T[] {
  return nodes.filter(node => !nodes.some(other => other !== node && other.contains(node)));
}
