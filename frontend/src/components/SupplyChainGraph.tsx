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
        label: company.name,
        title: `${company.name}\n${company.industry}`,
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
          size: 14,
          face: 'monospace',
          bold: '600'
        },
        size: company.id === selectedCompanyId ? 35 : 25,
        shape: 'box',
        margin: { top: 10, right: 10, bottom: 10, left: 10 }
      }))
    );

    // Create edges
    const edges = new DataSet(
      relationships.map(rel => {
        return {
          id: rel.id,
          from: rel.from,
          to: rel.to,
          arrows: 'to',
          color: {
            color: 'hsl(15, 85%, 55%)', // Orange/coral color - distinct from all node colors
            highlight: 'hsl(45, 100%, 50%)'
          },
          width: 3,
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
        },
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 1.5
          }
        },
        chosen: {
          edge: true,
          label: true
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
          iterations: 200,
          updateInterval: 25,
          onlyDynamicEdges: false,
          fit: true
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

    // Stop physics after stabilization to prevent continuous movement
    networkRef.current.on('stabilizationIterationsDone', () => {
      if (networkRef.current) {
        networkRef.current.setOptions({ physics: { enabled: false } });
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