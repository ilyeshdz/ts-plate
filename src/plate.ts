import type { Node, RootNode } from './types'

export function plate(...children: Node[]): RootNode {
    return {
        type: 'root',
        children
    }
}