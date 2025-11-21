import React from 'react';

interface ControlPanelProps {
  onAllocate: () => void;
  onBatchAllocate: () => void;
  onGC: () => void;
  onMethodCall: () => void;
  onMethodReturn: () => void;
  onOpenSettings: () => void;
  isAnimating: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onAllocate, 
  onBatchAllocate,
  onGC, 
  onMethodCall, 
  onMethodReturn,
  onOpenSettings,
  isAnimating 
}) => {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700 mb-4 shadow-lg">
      <div className="text-slate-400 text-sm w-full font-semibold uppercase tracking-wider mb-1 flex justify-between items-center">
        <span>控制台 (Simulation Controls)</span>
        <button 
          onClick={onOpenSettings}
          disabled={isAnimating}
          className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-slate-300 flex items-center gap-1 transition-colors"
        >
          ⚙️ 设置 (Settings)
        </button>
      </div>
      
      <button
        onClick={onAllocate}
        disabled={isAnimating}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded shadow transition-colors flex items-center gap-2"
      >
        <span className="text-lg">✚</span> 创建对象 (new Object)
      </button>

      <button
        onClick={onBatchAllocate}
        disabled={isAnimating}
        className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded shadow transition-colors flex items-center gap-2"
      >
        <span className="text-lg">🚀</span> 批量创建 (Batch)
      </button>

      <button
        onClick={onMethodCall}
        disabled={isAnimating}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded shadow transition-colors flex items-center gap-2"
      >
        <span className="text-lg">⤵</span> 方法调用 (Call Stack)
      </button>
      
      <button
        onClick={onMethodReturn}
        disabled={isAnimating}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded shadow transition-colors flex items-center gap-2"
      >
        <span className="text-lg">⤴</span> 方法返回 (Return)
      </button>

      <button
        onClick={onGC}
        disabled={isAnimating}
        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded shadow transition-colors flex items-center gap-2"
      >
        <span className="text-lg">♻</span> 垃圾回收 (GC)
      </button>
    </div>
  );
};