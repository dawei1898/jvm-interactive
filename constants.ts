import { JVMComponentData, JVMPart } from './types';

export const JVM_COMPONENTS: Record<JVMPart, JVMComponentData> = {
  [JVMPart.CLASS_LOADER]: {
    id: JVMPart.CLASS_LOADER,
    name: '类加载器 (Class Loader)',
    description: '负责加载 .class 文件到内存中',
    details: 'Class Loader 子系统负责从文件系统或网络加载 Class 文件，验证其正确性，并为类变量分配内存。它包含 Bootstrap, Extension, 和 Application ClassLoader。',
    color: 'bg-yellow-600 border-yellow-400'
  },
  [JVMPart.METHOD_AREA]: {
    id: JVMPart.METHOD_AREA,
    name: '方法区 (Method Area)',
    description: '存储类信息、常量、静态变量',
    details: '方法区（在 Java 8+ 中实现为 Metaspace）存储已被虚拟机加载的类信息、常量、静态变量、即时编译器编译后的代码等数据。',
    color: 'bg-purple-600 border-purple-400'
  },
  [JVMPart.HEAP]: {
    id: JVMPart.HEAP,
    name: '堆 (Heap)',
    description: 'Java 对象的主要存储区域',
    details: 'JVM 管理的最大一块内存。所有线程共享。几乎所有的对象实例都在这里分配内存。堆被划分为新生代 (Young Gen) 和老年代 (Old Gen)。',
    color: 'bg-emerald-600 border-emerald-400'
  },
  [JVMPart.HEAP_YOUNG]: {
    id: JVMPart.HEAP_YOUNG,
    name: '新生代 (Young Gen)',
    description: '新对象出生的地方 (Eden + Survivors)',
    details: '包含 Eden 区和两个 Survivor 区 (S0, S1)。大多数对象在 Eden 区生成。当 Eden 满时，触发 Minor GC。',
    color: 'bg-emerald-500 border-emerald-300'
  },
  [JVMPart.HEAP_OLD]: {
    id: JVMPart.HEAP_OLD,
    name: '老年代 (Old Gen)',
    description: '存放生命周期长的对象',
    details: '经历了多次 GC 依然存活的对象会进入老年代。当老年代满时，会触发 Major GC 或 Full GC。',
    color: 'bg-emerald-800 border-emerald-600'
  },
  [JVMPart.STACK]: {
    id: JVMPart.STACK,
    name: '虚拟机栈 (VM Stack)',
    description: '线程私有，存储栈帧',
    details: '每个方法执行时都会创建一个栈帧 (Stack Frame) 用于存储局部变量表、操作数栈、动态链接、方法出口等信息。',
    color: 'bg-blue-600 border-blue-400'
  },
  [JVMPart.PC_REGISTER]: {
    id: JVMPart.PC_REGISTER,
    name: '程序计数器 (PC Register)',
    description: '当前线程所执行的字节码行号',
    details: '一块较小的内存空间，记录当前线程执行的字节码指令地址。如果执行的是 Native 方法，则计数器值为空 (Undefined)。',
    color: 'bg-gray-600 border-gray-400'
  },
  [JVMPart.NATIVE_STACK]: {
    id: JVMPart.NATIVE_STACK,
    name: '本地方法栈 (Native Stack)',
    description: '为 Native 方法服务',
    details: '与虚拟机栈作用类似，不过虚拟机栈为 Java 方法服务，而本地方法栈为 Native 方法服务。',
    color: 'bg-orange-700 border-orange-500'
  },
  [JVMPart.EXECUTION_ENGINE]: {
    id: JVMPart.EXECUTION_ENGINE,
    name: '执行引擎 (Execution Engine)',
    description: '解释或编译字节码为机器码',
    details: '包含解释器 (Interpreter) 和即时编译器 (JIT Compiler)。它还包含垃圾回收器 (Garbage Collector)。',
    color: 'bg-red-700 border-red-500'
  },
  [JVMPart.GC]: {
    id: JVMPart.GC,
    name: '垃圾回收 (Garbage Collector)',
    description: '自动回收不再使用的对象',
    details: '执行引擎的一部分，负责回收堆内存中不可达的对象。常见算法包括标记-清除、复制、标记-整理。',
    color: 'bg-teal-700 border-teal-500'
  }
};