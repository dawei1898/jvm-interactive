import React, { useState, useEffect, useCallback } from 'react';
import { JVMPart, LogEntry } from './types';
import { JVM_COMPONENTS } from './constants';
import { MemoryBlock } from './components/MemoryBlock';
import { ControlPanel } from './components/ControlPanel';
import { ChatAssistant } from './components/ChatAssistant';
import { Tooltip } from './components/Tooltip';

interface VisualObject {
  id: number;
  name: string;
  gen: 'eden' | 's0' | 's1' | 'old';
}

interface StackFrame {
  id: number;
  methodName: string;
}

export default function App() {
  const [activePart, setActivePart] = useState<JVMPart | null>(null);
  const [flashingPart, setFlashingPart] = useState<JVMPart | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Simulation States
  const [objects, setObjects] = useState<VisualObject[]>([]);
  const [stackFrames, setStackFrames] = useState<StackFrame[]>([]);
  const [objCounter, setObjCounter] = useState(0);
  const [collectedCount, setCollectedCount] = useState(0);

  // Configuration
  const [maxHeapSize, setMaxHeapSize] = useState(60);
  
  // Modals
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [batchSize, setBatchSize] = useState(20);

  // Derived State
  const youngGenerationLimit = Math.floor(maxHeapSize / 3);
  const oldGenerationLimit = maxHeapSize - youngGenerationLimit;
  
  const youngObjects = objects.filter(o => ['eden', 's0', 's1'].includes(o.gen));
  const oldObjects = objects.filter(o => o.gen === 'old');
  const youngCount = youngObjects.length;
  const oldCount = oldObjects.length;
  const totalCount = objects.length;

  const addLog = useCallback((msg: string, type: 'info' | 'action' | 'error' = 'info') => {
    setLogs(prev => [{
      id: Date.now().toString() + Math.random(),
      timestamp: new Date(),
      message: msg,
      type
    }, ...prev.slice(0, 49)]); // Keep last 50 logs
  }, []);

  const triggerFlash = (part: JVMPart) => {
    setFlashingPart(part);
    setTimeout(() => setFlashingPart(null), 500);
  };

  // --- Simulation Actions ---

  const handleAllocation = useCallback(() => {
    if (isAnimating) return;
    
    if (totalCount >= maxHeapSize) {
        addLog(`Error: Java Heap Space OOM! (已达上限 ${maxHeapSize})`, 'error');
        triggerFlash(JVMPart.HEAP);
        return;
    }

    setIsAnimating(true);
    
    // 1. Class Loading Check
    addLog("收到 'new Object()' 指令", 'action');
    triggerFlash(JVMPart.CLASS_LOADER);
    setActivePart(JVMPart.CLASS_LOADER);
    
    setTimeout(() => {
      addLog("类加载器验证并加载类信息到方法区");
      triggerFlash(JVMPart.METHOD_AREA);
      setActivePart(JVMPart.METHOD_AREA);

      setTimeout(() => {
        // 2. Allocation in Eden
        const newId = objCounter + 1;
        setObjCounter(newId);
        const newObj: VisualObject = { id: newId, name: `Obj_${newId}`, gen: 'eden' };
        
        setObjects(prev => [...prev, newObj]);
        addLog(`在堆内存 (Eden) 分配对象: ${newObj.name}`, 'action');
        triggerFlash(JVMPart.HEAP_YOUNG);
        setActivePart(JVMPart.HEAP_YOUNG);
        
        setIsAnimating(false);
      }, 800);
    }, 800);
  }, [isAnimating, objCounter, addLog, totalCount, maxHeapSize]);

  const handleOpenBatchModal = useCallback(() => {
    if (isAnimating) return;
    setShowBatchModal(true);
  }, [isAnimating]);

  const handleOpenSettingsModal = useCallback(() => {
    if (isAnimating) return;
    setShowSettingsModal(true);
  }, [isAnimating]);

  const handleBatchAllocation = useCallback(() => {
    setShowBatchModal(false);
    if (isAnimating) return;
    setIsAnimating(true);

    addLog(`收到 '批量创建对象' 指令: ${batchSize} 个`, 'action');
    // Batch allocation skips the slow class loading animation to simulate high throughput
    triggerFlash(JVMPart.HEAP_YOUNG);
    setActivePart(JVMPart.HEAP_YOUNG);

    setTimeout(() => {
      const newObjects: VisualObject[] = [];
      let currentCounter = objCounter;
      let addedCount = 0;

      for (let i = 0; i < batchSize; i++) {
        // Check logical overflow for logs, but let visualizer proceed to trigger GC or OOM visuals
        currentCounter++;
        newObjects.push({ 
            id: currentCounter, 
            name: `Obj_${currentCounter}`, 
            gen: 'eden' 
        });
        addedCount++;
      }
      
      setObjCounter(currentCounter);
      setObjects(prev => [...prev, ...newObjects]);
      
      const newTotal = totalCount + addedCount;
      if (newTotal > maxHeapSize) {
          addLog(`警告: 批量分配导致堆内存溢出 (${newTotal}/${maxHeapSize})`, 'error');
      } else {
          addLog(`高并发模拟: 瞬间在 Eden 区分配了 ${addedCount} 个对象`, 'action');
      }
      
      setIsAnimating(false);
    }, 600);
  }, [isAnimating, objCounter, addLog, batchSize, totalCount, maxHeapSize]);

  const handleMethodCall = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    addLog("方法调用: pushStackFrame()", 'action');
    triggerFlash(JVMPart.STACK);
    setActivePart(JVMPart.STACK);

    setTimeout(() => {
      setStackFrames(prev => [...prev, { id: Date.now(), methodName: `method_${prev.length + 1}()` }]);
      addLog("新栈帧压入虚拟机栈", 'info');
      
      // Typically also interacts with PC Register
      triggerFlash(JVMPart.PC_REGISTER);
      addLog("PC 计数器更新指向下一条指令");
      
      setIsAnimating(false);
    }, 600);
  }, [isAnimating, addLog]);

  const handleMethodReturn = useCallback(() => {
    if (isAnimating || stackFrames.length === 0) {
        if (stackFrames.length === 0) addLog("栈已空，无法弹出", 'error');
        return;
    }
    setIsAnimating(true);

    addLog("方法返回: popStackFrame()", 'action');
    triggerFlash(JVMPart.STACK);
    setActivePart(JVMPart.STACK);

    setTimeout(() => {
      setStackFrames(prev => prev.slice(0, -1));
      addLog("栈帧弹出，恢复上层方法上下文", 'info');
      setIsAnimating(false);
    }, 600);
  }, [isAnimating, stackFrames.length, addLog]);

  const handleGC = useCallback((isFullGC: boolean = false) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const gcType = isFullGC ? 'Full GC (Major)' : 'Minor GC';
    addLog(`开始执行 ${gcType} (Mark-Sweep/Copying)...`, 'action');
    triggerFlash(JVMPart.GC);
    setActivePart(JVMPart.GC);

    setTimeout(() => {
      triggerFlash(JVMPart.HEAP_YOUNG);
      if (isFullGC) {
        triggerFlash(JVMPart.HEAP_OLD);
      }
      setActivePart(isFullGC ? JVMPart.HEAP : JVMPart.HEAP_YOUNG);

      // Use objects from state closure
      const currentObjects = objects;
      const living: VisualObject[] = [];
      let removedCount = 0;
      let promotedCount = 0;
      let oom = false;
      
      // Filter and process
      currentObjects.forEach(obj => {
        if (obj.gen === 'old') {
             if (isFullGC) {
                 // Full GC: Simulate collecting dead objects in Old Gen (30% chance to die for demo)
                 if (Math.random() > 0.3) {
                     living.push(obj);
                 } else {
                     removedCount++;
                 }
             } else {
                 // Minor GC: Old Gen objects are untouched
                 living.push(obj);
             }
             return;
        }

        // Young Gen Logic: Survive or Die
        // 50% survival rate for demo
        if (Math.random() > 0.5) {
             // Check if Old Gen has space
             // Calculate current old gen count including those we just decided to keep
             const currentOldCount = living.filter(o => o.gen === 'old').length;
             
             if (currentOldCount < oldGenerationLimit) {
                 living.push({ ...obj, gen: 'old' as const });
                 promotedCount++;
             } else {
                 // Promotion Failure (Old Gen Full)
                 // For visualizer, we keep it in Young or drop it. 
                 // Real JVM would trigger Full GC or OOM.
                 // Here we mark OOM flag but keep object to show overflow or just keep it in Young
                 oom = true;
                 living.push(obj); 
             }
        } else {
             removedCount++;
        }
      });
      
      if (oom && !isFullGC) {
           addLog("Major GC 警告: 老年代空间不足，对象无法晋升!", 'error');
           triggerFlash(JVMPart.HEAP_OLD);
      }

      setObjects(living);
      setCollectedCount(prev => prev + removedCount);

      if (removedCount > 0) {
           addLog(`${gcType} 清理完毕: 回收了 ${removedCount} 个对象`, 'info');
      } else {
           addLog(`${gcType} 完成: 无对象需回收`, 'info');
      }
      
      setTimeout(() => {
            if (promotedCount > 0) {
                addLog(`${promotedCount} 个幸存对象晋升到老年代 (Old Gen)`, 'action');
                triggerFlash(JVMPart.HEAP_OLD);
            }
            setIsAnimating(false);
      }, 800);

    }, 1000);
  }, [isAnimating, addLog, objects, oldGenerationLimit]);

  // --- Auto GC Effect ---
  useEffect(() => {
    if (isAnimating) return;

    // Trigger if Young Gen is full
    if (youngCount >= youngGenerationLimit) {
      addLog(`⚠️ Young Gen 空间不足 (${youngCount}/${youngGenerationLimit})`, 'action');
      
      const timer = setTimeout(() => {
          addLog("⚡ 达到阈值，自动触发 Minor GC", 'action');
          handleGC(false); // Explicitly Minor GC
      }, 1500);

      return () => clearTimeout(timer);
    }
    
    // Check Global OOM
    if (totalCount > maxHeapSize) {
        addLog(`⚠️ 堆内存溢出! 当前: ${totalCount}, 最大: ${maxHeapSize}`, 'error');
    }

  }, [youngCount, totalCount, maxHeapSize, youngGenerationLimit, isAnimating, handleGC, addLog]);


  // --- Render Helpers ---

  const renderObjects = (gen: string) => {
    return objects.filter(o => o.gen === gen).map(o => (
        <div key={o.id} className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white shadow-sm inline-block m-0.5 animate-[bounce_0.5s_ease-in-out]" title={o.name}></div>
    ));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row overflow-hidden">
      
      {/* Left: Visualizer Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto md:overflow-hidden">
        {/* Header */}
        <header className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
              JVM 结构原理可视化
            </h1>
            <p className="text-slate-500 text-xs">Java Virtual Machine Interactive Learning</p>
          </div>
          <div className="flex gap-3 text-xs font-mono">
             <div className="bg-slate-50 px-3 py-1.5 rounded border border-slate-200 flex flex-col items-center min-w-[80px]">
                <span className="text-slate-500 text-[10px] uppercase">Total Heap</span>
                <span className={`${totalCount >= maxHeapSize ? 'text-red-500 animate-pulse' : 'text-slate-800'} font-bold text-lg`}>
                  {totalCount}<span className="text-xs text-slate-400">/{maxHeapSize}</span>
                </span>
             </div>
             <div className="bg-slate-50 px-3 py-1.5 rounded border border-slate-200 flex flex-col items-center min-w-[80px]">
                <span className="text-slate-500 text-[10px] uppercase">Eden/Survivor</span>
                <span className={`${youngCount >= youngGenerationLimit ? 'text-orange-500' : 'text-emerald-600'} font-bold text-lg`}>
                  {youngCount}<span className="text-xs text-slate-400">/{youngGenerationLimit}</span>
                </span>
             </div>
             <div className="bg-slate-50 px-3 py-1.5 rounded border border-slate-200 flex flex-col items-center min-w-[80px]">
                <span className="text-slate-500 text-[10px] uppercase">Old Gen</span>
                <span className={`${oldCount >= oldGenerationLimit ? 'text-red-500' : 'text-emerald-700'} font-bold text-lg`}>
                  {oldCount}<span className="text-xs text-slate-400">/{oldGenerationLimit}</span>
                </span>
             </div>
             <div className="hidden lg:flex bg-slate-50 px-3 py-1.5 rounded border border-slate-200 flex-col items-center min-w-[80px]">
                <span className="text-slate-500 text-[10px] uppercase">累计创建</span>
                <span className="text-blue-600 font-bold text-lg">{objCounter}</span>
             </div>
             <div className="hidden lg:flex bg-slate-50 px-3 py-1.5 rounded border border-slate-200 flex-col items-center min-w-[80px]">
                <span className="text-slate-500 text-[10px] uppercase">累计回收</span>
                <span className="text-orange-600 font-bold text-lg">{collectedCount}</span>
             </div>
          </div>
        </header>

        {/* Main Diagram Grid */}
        <main className="flex-1 p-4 overflow-y-auto bg-slate-50">
          
          <ControlPanel 
             onAllocate={handleAllocation} 
             onBatchAllocate={handleOpenBatchModal}
             onGC={() => handleGC(true)}
             onMethodCall={handleMethodCall}
             onMethodReturn={handleMethodReturn}
             onOpenSettings={handleOpenSettingsModal}
             isAnimating={isAnimating}
          />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 max-w-6xl mx-auto">
            
            {/* Top Row: Class Loader & Method Area */}
            <div className="md:col-span-4">
                <MemoryBlock 
                    data={JVM_COMPONENTS[JVMPart.CLASS_LOADER]} 
                    isActive={activePart === JVMPart.CLASS_LOADER}
                    isFlashing={flashingPart === JVMPart.CLASS_LOADER}
                    onClick={() => setActivePart(JVMPart.CLASS_LOADER)}
                >
                    <div className="flex flex-col items-center justify-center h-full opacity-60 text-xs text-center text-white font-medium">
                       <div>Bootstrap</div>
                       <div>Extension</div>
                       <div>App ClassLoader</div>
                    </div>
                </MemoryBlock>
            </div>
            <div className="md:col-span-8">
                <MemoryBlock 
                    data={JVM_COMPONENTS[JVMPart.METHOD_AREA]} 
                    isActive={activePart === JVMPart.METHOD_AREA}
                    isFlashing={flashingPart === JVMPart.METHOD_AREA}
                    onClick={() => setActivePart(JVMPart.METHOD_AREA)}
                >
                     <div className="p-2 text-xs font-mono text-white grid grid-cols-2 gap-2">
                        <div className="bg-purple-900/50 p-1 rounded">Runtime Const Pool</div>
                        <div className="bg-purple-900/50 p-1 rounded">Static Vars</div>
                        <div className="bg-purple-900/50 p-1 rounded">Class Metadata</div>
                        <div className="bg-purple-900/50 p-1 rounded">JIT Code Cache</div>
                     </div>
                </MemoryBlock>
            </div>

            {/* Middle Section: Stack & Heap */}
            
            {/* Left Column: Thread Specific */}
            <div className="md:col-span-4 flex flex-col gap-4">
                {/* Stack */}
                <MemoryBlock 
                    data={JVM_COMPONENTS[JVMPart.STACK]} 
                    isActive={activePart === JVMPart.STACK}
                    isFlashing={flashingPart === JVMPart.STACK}
                    onClick={() => setActivePart(JVMPart.STACK)}
                    heightClass="h-64"
                >
                    <div className="flex flex-col-reverse gap-1 p-1 h-full overflow-hidden">
                        {stackFrames.map((frame, idx) => (
                            <div key={frame.id} className="bg-blue-500 text-white text-xs p-2 rounded shadow flex justify-between animate-[slideInLeft_0.3s_ease-out]">
                                <span>{frame.methodName}</span>
                                <span className="opacity-50">#{idx}</span>
                            </div>
                        ))}
                        {stackFrames.length === 0 && <div className="text-center text-white/40 mt-10">栈空 (Empty Stack)</div>}
                    </div>
                </MemoryBlock>

                {/* PC Register & Native */}
                <div className="grid grid-cols-2 gap-4">
                    <MemoryBlock 
                        data={JVM_COMPONENTS[JVMPart.PC_REGISTER]} 
                        isActive={activePart === JVMPart.PC_REGISTER}
                        isFlashing={flashingPart === JVMPart.PC_REGISTER}
                        onClick={() => setActivePart(JVMPart.PC_REGISTER)}
                        heightClass="h-24"
                    >
                        <div className="text-center mt-4 font-mono text-emerald-300 font-bold">
                            0x{Math.floor(Math.random()*10000).toString(16).toUpperCase()}
                        </div>
                    </MemoryBlock>
                    <MemoryBlock 
                        data={JVM_COMPONENTS[JVMPart.NATIVE_STACK]} 
                        isActive={activePart === JVMPart.NATIVE_STACK}
                        isFlashing={flashingPart === JVMPart.NATIVE_STACK}
                        onClick={() => setActivePart(JVMPart.NATIVE_STACK)}
                        heightClass="h-24"
                    >
                       <div className="text-center mt-4 text-xs text-white/70">Native Libs</div>
                    </MemoryBlock>
                </div>
            </div>

            {/* Right Column: The Heap */}
            <div className="md:col-span-8 flex flex-col gap-2">
                 <MemoryBlock 
                    data={JVM_COMPONENTS[JVMPart.HEAP]} 
                    isActive={activePart === JVMPart.HEAP || activePart === JVMPart.HEAP_YOUNG || activePart === JVMPart.HEAP_OLD}
                    isFlashing={flashingPart === JVMPart.HEAP || totalCount > maxHeapSize}
                    onClick={() => setActivePart(JVMPart.HEAP)}
                    heightClass="h-[23rem]"
                >
                    <div className="flex flex-col h-full gap-2 p-2">
                        {/* Young Gen */}
                        <div 
                           className={`flex-1 border-2 border-dashed border-emerald-300/30 rounded p-2 transition-colors ${activePart === JVMPart.HEAP_YOUNG || flashingPart === JVMPart.HEAP_YOUNG ? 'bg-emerald-500/20' : ''}`}
                           onClick={(e) => { e.stopPropagation(); setActivePart(JVMPart.HEAP_YOUNG); }}
                        >
                            <div className="text-xs text-emerald-100 mb-1 font-bold uppercase flex justify-between">
                                <span>Young Generation (1/3)</span>
                                <span className="text-[10px] opacity-70">Capacity: {youngGenerationLimit}</span>
                            </div>
                            <div className="flex h-[80%] gap-2">
                                <div className="flex-[8] bg-emerald-900/40 rounded border border-emerald-500/30 p-1 relative flex flex-col">
                                    <span className="absolute top-0 right-1 text-[10px] text-emerald-200 bg-black/20 px-1 rounded z-10">Eden</span>
                                    <div className="flex flex-wrap content-start gap-0.5 mt-4 overflow-y-auto h-full scrollbar-thin">
                                        {renderObjects('eden')}
                                    </div>
                                </div>
                                <div className="flex-1 bg-emerald-900/40 rounded border border-emerald-500/30 p-1 relative flex flex-col">
                                    <span className="absolute top-0 right-1 text-[10px] text-emerald-200 bg-black/20 px-1 rounded z-10">S0</span>
                                     <div className="flex flex-wrap content-start gap-0.5 mt-4 overflow-y-auto h-full scrollbar-thin">
                                        {renderObjects('s0')}
                                    </div>
                                </div>
                                <div className="flex-1 bg-emerald-900/40 rounded border border-emerald-500/30 p-1 relative flex flex-col">
                                    <span className="absolute top-0 right-1 text-[10px] text-emerald-200 bg-black/20 px-1 rounded z-10">S1</span>
                                    <div className="flex flex-wrap content-start gap-0.5 mt-4 overflow-y-auto h-full scrollbar-thin">
                                        {renderObjects('s1')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Old Gen */}
                        <div 
                           className={`flex-[2] border-2 border-dashed border-emerald-600/50 rounded p-2 transition-colors ${activePart === JVMPart.HEAP_OLD || flashingPart === JVMPart.HEAP_OLD ? 'bg-emerald-800/20' : ''}`}
                           onClick={(e) => { e.stopPropagation(); setActivePart(JVMPart.HEAP_OLD); }}
                        >
                            <div className="text-xs text-emerald-200 mb-1 font-bold uppercase flex justify-between">
                                <span>Old Generation (2/3)</span>
                                <span className="text-[10px] opacity-70">Capacity: {oldGenerationLimit}</span>
                            </div>
                            <div className="bg-emerald-950/40 rounded border border-emerald-700/30 h-[85%] p-2 flex flex-wrap content-start gap-0.5 overflow-y-auto relative scrollbar-thin">
                                 <span className="absolute top-1 right-2 text-[10px] text-emerald-300 bg-black/20 px-1 rounded z-10">Tenured</span>
                                 {renderObjects('old')}
                            </div>
                        </div>
                    </div>
                </MemoryBlock>
            </div>

            {/* Bottom: Execution Engine */}
            <div className="md:col-span-12">
                 <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-9">
                        <MemoryBlock 
                            data={JVM_COMPONENTS[JVMPart.EXECUTION_ENGINE]} 
                            isActive={activePart === JVMPart.EXECUTION_ENGINE}
                            isFlashing={flashingPart === JVMPart.EXECUTION_ENGINE}
                            onClick={() => setActivePart(JVMPart.EXECUTION_ENGINE)}
                            heightClass="h-24"
                        >
                            <div className="flex justify-around items-center h-full text-white opacity-90">
                                <span className="border border-white/20 px-3 py-1 rounded bg-black/20">Interpreter</span>
                                <span className="border border-white/20 px-3 py-1 rounded bg-black/20">JIT Compiler</span>
                                <span className={`border border-white/20 px-3 py-1 rounded transition-colors ${flashingPart === JVMPart.GC ? 'bg-yellow-500 text-black font-bold' : 'bg-black/20'}`}>GC</span>
                            </div>
                        </MemoryBlock>
                    </div>
                    <div className="col-span-3">
                         <div className="h-24 border-2 border-slate-300 border-dashed rounded-lg flex items-center justify-center text-slate-400 bg-white">
                            Native Interface (JNI)
                         </div>
                    </div>
                 </div>
            </div>

          </div>
        </main>
      </div>

      {/* Right Sidebar: Info & Chat */}
      <div className="w-full md:w-96 bg-white border-l border-slate-200 flex flex-col h-[50vh] md:h-screen shadow-lg z-20">
        
        {/* Logs Section */}
        <div className="h-1/3 border-b border-slate-200 flex flex-col">
            <div className="p-2 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">运行日志 (System Logs)</div>
            <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1 bg-white">
                {logs.map((log) => (
                    <div key={log.id} className={`
                        ${log.type === 'action' ? 'text-blue-600' : log.type === 'error' ? 'text-red-600' : 'text-slate-600'}
                    `}>
                        <span className="opacity-50 text-slate-400">[{log.timestamp.toLocaleTimeString().split(' ')[0]}]</span> {log.message}
                    </div>
                ))}
                {logs.length === 0 && <div className="text-slate-400 italic p-2">等待操作...</div>}
            </div>
        </div>

        {/* Active Component Detail */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 min-h-[150px]">
             <h2 className="text-sm font-bold text-slate-400 uppercase mb-2">当前选中区域</h2>
             {activePart && JVM_COMPONENTS[activePart] ? (
                 <div>
                     <h3 className="text-xl font-bold text-slate-800 mb-1">{JVM_COMPONENTS[activePart].name}</h3>
                     <p className="text-sm text-emerald-600 font-semibold mb-2">{JVM_COMPONENTS[activePart].description}</p>
                     <p className="text-sm text-slate-600 leading-relaxed">
                         {JVM_COMPONENTS[activePart].details}
                     </p>
                 </div>
             ) : (
                 <div className="text-slate-400 text-sm italic">点击左侧图表区域查看详情...</div>
             )}
        </div>

        {/* AI Chat */}
        <div className="flex-1 p-4 bg-white overflow-hidden flex flex-col">
             <ChatAssistant context={activePart ? `用户当前选中的是: ${JVM_COMPONENTS[activePart].name}. 描述: ${JVM_COMPONENTS[activePart].details}` : '用户正在查看 JVM 全局概览'} />
        </div>
      </div>

      {/* Batch Allocation Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowBatchModal(false)}>
            <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full shadow-2xl transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-slate-800 mb-4">批量创建对象配置</h3>
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-slate-500 mb-2">
                        <span>生成数量</span>
                        <span className="text-blue-600 font-mono text-lg">{batchSize}</span>
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={batchSize} 
                        onChange={(e) => setBatchSize(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                        <span>1</span>
                        <span>50</span>
                        <span>100</span>
                    </div>
                </div>
                <div className="flex gap-3 justify-end">
                    <button 
                        onClick={() => setShowBatchModal(false)}
                        className="px-4 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleBatchAllocation}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded shadow transition-colors font-semibold"
                    >
                        开始生成
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowSettingsModal(false)}>
            <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full shadow-2xl transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-slate-800 mb-4">JVM 参数设置</h3>
                
                <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                         <label className="text-sm text-slate-600 font-semibold">堆内存最大对象数 (Heap Size)</label>
                         <span className="text-emerald-600 font-mono text-xl">{maxHeapSize}</span>
                    </div>
                    <input 
                        type="range" 
                        min="60" 
                        max="500" 
                        step="10"
                        value={maxHeapSize} 
                        onChange={(e) => setMaxHeapSize(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                        <span>60 (Min)</span>
                        <span>500 (Max)</span>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg mb-6 text-sm space-y-2 border border-slate-100">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Young Gen Limit (1/3):</span>
                        <span className="text-emerald-600 font-mono">{youngGenerationLimit}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Old Gen Limit (2/3):</span>
                        <span className="text-emerald-600 font-mono">{oldGenerationLimit}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-200">
                        * 当 Young Gen 达到上限时将自动触发 GC。
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <button 
                        onClick={() => setShowSettingsModal(false)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded shadow transition-colors font-semibold w-full"
                    >
                        确定 (Apply)
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}