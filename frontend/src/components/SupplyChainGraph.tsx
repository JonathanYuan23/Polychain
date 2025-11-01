import { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';
import { DataSet } from 'vis-data';
import { Company, SupplyChainRelationship } from '@/types/supply-chain';
import { formatCurrency } from '@/data/sample-data';

interface SupplyChainGraphProps {
  companies: Company[];
  relationships: SupplyChainRelationship[];
  selectedCompanyId?: string;
  onNodeClick: (companyId: string) => void;
}

export const SupplyChainGraph = ({ 
  companies, 
  relationships, 
  selectedCompanyId,
  onNodeClick 
}: SupplyChainGraphProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create nodes
    const nodes = new DataSet(
      companies.map(company => ({
        id: company.id,
        label: `${company.name}\n(${company.ticker})`,
        title: `${company.name} (${company.ticker})\n${company.industry}`,
        color: {
          background: company.id === selectedCompanyId 
            ? 'hsl(45, 100%, 50%)' 
            : company.type === 'supplier' 
              ? 'hsl(120, 50%, 45%)'
              : company.type === 'customer'
                ? 'hsl(210, 80%, 60%)'
                : 'hsl(220, 15%, 18%)',
          border: 'hsl(220, 15%, 30%)',
          highlight: {
            background: 'hsl(45, 100%, 50%)',
            border: 'hsl(45, 100%, 60%)'
          }
        },
        font: {
          color: company.id === selectedCompanyId ? '#000' : '#fff',
          size: 12,
          face: 'monospace'
        },
        size: company.id === selectedCompanyId ? 40 : 30,
        shape: 'box',
        margin: { top: 10, right: 10, bottom: 10, left: 10 }
      }))
    );

    // Create edges
    const edges = new DataSet(
      relationships.map(rel => {
        const edgeColor = rel.value > 15000000000 
          ? 'hsl(0, 70%, 55%)'
          : rel.value > 8000000000
            ? 'hsl(30, 100%, 55%)'
            : 'hsl(120, 50%, 45%)';

        return {
          id: rel.id,
          from: rel.from,
          to: rel.to,
          label: formatCurrency(rel.value),
          arrows: { to: { enabled: true, scaleFactor: 1.2 } },
          color: {
            color: edgeColor,
            highlight: 'hsl(45, 100%, 50%)'
          },
          font: {
            color: '#fff',
            size: 10,
            face: 'monospace',
            strokeWidth: 3,
            strokeColor: '#000'
          },
          width: Math.max(2, Math.min(8, rel.value / 3000000000)),
          smooth: {
            enabled: true,
            type: 'curvedCW',
            roundness: 0.2
          }
        };
      })
    );

    const data = { nodes, edges };

    const options = {
      nodes: {
        borderWidth: 2,
        shadow: true,
        borderWidthSelected: 3
      },
      edges: {
        shadow: true,
        smooth: {
          enabled: true,
          type: 'curvedCW',
          roundness: 0.2
        }
      },
      physics: {
        enabled: true,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -50,
          centralGravity: 0.005,
          springLength: 200,
          springConstant: 0.18,
          damping: 0.15,
          avoidOverlap: 1
        },
        stabilization: {
          enabled: true,
          iterations: 100,
          updateInterval: 25
        }
      },
      interaction: {
        hover: true,
        selectConnectedEdges: false,
        hoverConnectedEdges: true
      },
      layout: {
        improvedLayout: true,
        hierarchical: false
      }
    };

    // Destroy existing network
    if (networkRef.current) {
      networkRef.current.destroy();
    }

    // Create new network
    networkRef.current = new Network(containerRef.current, data, options);

    // Add click event listener
    networkRef.current.on('click', (event) => {
      if (event.nodes.length > 0) {
        const nodeId = event.nodes[0];
        onNodeClick(nodeId);
      }
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [companies, relationships, selectedCompanyId, onNodeClick]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-background border border-terminal-grid rounded"
      style={{ minHeight: '500px' }}
    />
  );
};