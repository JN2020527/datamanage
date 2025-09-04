import { useEffect, useRef } from 'react'
import { Graph } from '@antv/g6'

export interface LineageNode { id: string; name?: string; type?: string; level?: number; position?: { x: number; y: number } }
export interface LineageEdge { id?: string; source: string; target: string; type?: string; label?: string }

interface Props {
  data: { nodes: LineageNode[]; edges: LineageEdge[] }
  height?: number
}

export default function LineageGraph({ data, height = 420 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const graph = new Graph({
      container: ref.current,
      height,
      autoFit: 'view',
      data: (data as unknown) as any,
      node: {
        style: {
          size: 20,
          labelText: (d: any) => d.name ?? d.id,
        },
      },
      edge: {
        style: {
          stroke: '#99ADD1',
        },
      },
      layout: { type: 'd3-force' },
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
    })
    graph.render()
    return () => graph.destroy()
  }, [JSON.stringify(data), height])

  return <div ref={ref} style={{ width: '100%', height }} />
}


