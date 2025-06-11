
import React from 'react';
import { TreeNode as TreeNodeType, SelectedView } from '../types';
import { IconChevronRight } from '../constants';

interface TreeViewNodeProps {
  node: TreeNodeType;
  level: number;
  selectedViewGlobal: SelectedView; // Changed from isSelected to selectedViewGlobal
  onNodeClick: (node: TreeNodeType) => void;
  onChevronClick: (node: TreeNodeType) => void;
}

const TreeViewNode: React.FC<TreeViewNodeProps> = ({ node, level, selectedViewGlobal, onNodeClick, onChevronClick }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isActuallySelected = selectedViewGlobal.id === node.id && selectedViewGlobal.type === node.type;

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeClick(node);
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onChevronClick(node);
    }
  };

  return (
    <>
      <div
        className={`flex items-center p-2.5 rounded-md cursor-pointer text-sm transition-all duration-150 ease-in-out
                    ${isActuallySelected ? 'bg-sky-600/20 text-sky-500 font-medium' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}
                    group`}
        style={{ paddingLeft: `${level * 1 + 0.625}rem` }}
        onClick={handleNodeClick}
        role="treeitem"
        aria-selected={isActuallySelected}
        aria-expanded={hasChildren ? node.isOpen : undefined}
      >
        {node.icon && <span className="mr-2.5 opacity-80 group-hover:opacity-100">{node.icon}</span>}
        <div className="flex-grow truncate">
          <span className="block truncate">{node.displayName || node.name}</span>
          {node.subtitle && <span className="block text-xs text-slate-400 truncate group-hover:text-slate-300">{node.subtitle}</span>}
        </div>
        {hasChildren && (
          <button
            onClick={handleChevronClick}
            className={`ml-auto p-1 rounded-full hover:bg-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-transform duration-200 ${node.isOpen ? 'rotate-90' : ''}`}
            aria-label={node.isOpen ? `Collapse ${node.name}` : `Expand ${node.name}`}
          >
            <IconChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
      {hasChildren && node.isOpen && (
        <div role="group">
          {node.children?.map(child => (
            <TreeViewNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedViewGlobal={selectedViewGlobal} // Pass down the global selectedView
              onNodeClick={onNodeClick}
              onChevronClick={onChevronClick}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default TreeViewNode;
