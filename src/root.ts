import type { Node, RootNode } from './types'

export function root(...children: Node[]): RootNode {
    return {
        type: 'root',
        children
    }
}