
import React, { useState, useMemo, useCallback } from 'react';
import { TreeNode as TreeNodeType, SelectedView, ProcessedData } from '../types';
import { SAPRA_LOGO_URL, IconCollection, IconFolder, IconPuzzle, IconSearch } from '../constants';
import TreeViewNode from './TreeViewNode';

interface SidebarProps {
  isOpen: boolean;
  processedData: ProcessedData | null;
  selectedView: SelectedView;
  onViewChange: (view: SelectedView) => void;
  onToggle: () => void; // For mobile toggle
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, processedData, selectedView, onViewChange, onToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});

  const handleNodeClick = useCallback((node: TreeNodeType) => {
    onViewChange({ type: node.type, id: node.id === 'all' ? null : node.id, name: node.name, parentId: node.parentId });
    if (window.innerWidth < 1024) { // lg breakpoint
        onToggle(); // Close sidebar on mobile after selection
    }
  }, [onViewChange, onToggle]);

  const handleChevronClick = useCallback((node: TreeNodeType) => {
    setOpenNodes(prev => ({ ...prev, [node.id]: !prev[node.id] }));
  }, []);

  const treeData = useMemo((): TreeNodeType[] => {
    if (!processedData) return [];

    const { systemMap } = processedData;

    const rootNode: TreeNodeType = {
      id: 'all',
      name: 'All Systems',
      displayName: 'All Systems',
      type: 'all',
      icon: <IconCollection className="w-5 h-5" />,
      isOpen: openNodes['all'] !== undefined ? openNodes['all'] : true, // Default open
    };
    
    const systemNodes: TreeNodeType[] = Object.values(systemMap).map(system => ({
      id: system.id,
      name: system.id, // For matching selectedView.id
      displayName: system.id,
      subtitle: system.name,
      type: 'system',
      icon: <IconFolder className="w-5 h-5" />,
      isOpen: openNodes[system.id] !== undefined ? openNodes[system.id] : (selectedView.type === 'system' && selectedView.id === system.id) || selectedView.parentId === system.id,
      parentId: null,
      children: system.subs.map(sub => ({
        id: sub.id,
        name: sub.id, // For matching selectedView.id
        displayName: sub.id,
        subtitle: sub.name,
        type: 'subsystem',
        icon: <IconPuzzle className="w-5 h-5" />,
        isOpen: openNodes[sub.id] !== undefined ? openNodes[sub.id] : selectedView.type === 'subsystem' && selectedView.id === sub.id,
        parentId: system.id,
      }))
    }));
    
    rootNode.children = systemNodes; 

    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!lowerSearchTerm) return [rootNode];

    const filterNodes = (nodes: TreeNodeType[]): TreeNodeType[] => {
      return nodes.reduce((acc, node) => {
        const matchesSearch = (node.displayName?.toLowerCase().includes(lowerSearchTerm) || node.subtitle?.toLowerCase().includes(lowerSearchTerm));
        let filteredChildren: TreeNodeType[] | undefined = undefined;

        if (node.children) {
          filteredChildren = filterNodes(node.children);
        }

        if (matchesSearch || (filteredChildren && filteredChildren.length > 0)) {
          acc.push({
            ...node,
            children: filteredChildren,
            isOpen: (matchesSearch || (filteredChildren && filteredChildren.length > 0)) ? true : node.isOpen,
          });
        }
        return acc;
      }, [] as TreeNodeType[]);
    };
    
    const filteredRootChildren = filterNodes(systemNodes);
    const rootMatches = rootNode.displayName?.toLowerCase().includes(lowerSearchTerm);
    if(rootMatches || filteredRootChildren.length > 0) {
        return [{...rootNode, children: filteredRootChildren, isOpen: true}];
    }
    return [];

  }, [processedData, searchTerm, openNodes, selectedView]);


  return (
    <aside 
        className={`fixed top-0 left-0 h-full w-80 bg-slate-800 text-slate-200 flex flex-col shadow-xl
                    transition-transform duration-300 ease-in-out z-40 lg:translate-x-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="p-5 border-b border-slate-700">
        <div className="flex flex-col items-center mb-3">
            <a href="#" target="_blank" rel="noopener noreferrer" className="block mx-auto mb-2">
                 <img src={SAPRA_LOGO_URL} alt="SAPRA Logo" className="h-20 w-20 rounded-full object-cover shadow-md" />
            </a>
            <h1 className="text-xl font-semibold text-white">SAPRA Dashboard</h1>
        </div>
        <p className="text-xs text-center text-sky-400">Smart Access to Project Activities</p>
      </div>

      <div className="p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconSearch className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-3 py-2 text-sm bg-slate-700 text-slate-200 placeholder-slate-400 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none"
            placeholder="Search system..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search system or subsystem"
          />
        </div>
      </div>

      <nav className="flex-grow overflow-y-auto px-2 pb-4 space-y-0.5" aria-label="Systems Navigation">
        {treeData.length > 0 ? treeData.map(node => (
          <TreeViewNode
            key={node.id}
            node={node}
            level={0}
            selectedViewGlobal={selectedView} // Pass the global selectedView state
            onNodeClick={handleNodeClick}
            onChevronClick={handleChevronClick}
          />
        )) : (
            <p className="text-slate-400 text-center text-sm py-4">No matching items found.</p>
        )}
      </nav>

      <footer className="p-4 mt-auto border-t border-slate-700 text-center">
        <p className="text-xs text-slate-400 mb-0.5">Developed by Amin Naseri</p>
        <p className="text-xs text-slate-500 hover:text-sky-400 cursor-pointer">akarimvand@gmail.com</p>
        <p className="text-xs text-slate-500 hover:text-sky-400 cursor-pointer">+989366302800</p>
      </footer>
    </aside>
  );
};

export default Sidebar;
