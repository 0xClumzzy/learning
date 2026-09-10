Yes, Architecture. How the Windows NT kernel is structured internally
- managers
- libraries
- HAL
A layered micro kernel-based architecture.  It seperates the system into user mode and kernel mode components

KERNEL MODE COMPONENTS
= 
Managers
- Object manager- Manages all objects(files,devices,process......)
- Memory manager- Manages virtual memory, physical ram allocation 
- Process and thread manager - Creation and termination 
- i/o manager - Communication between devices and applications
- Plug and play manager  - Handles device detection and configuration 
Libraries
- Kernel library- The foundation, everything depends on this
- Executive support library- Object management, memory management , other managements
- Hardware Abstraction Library(HAL library)- Isolates the kernel from hardware specific details 
- CLFS library- Common Log File System for transaction logging
- WMI library- Windows Management Instrumentation infrustructure.
```mermaid
 a[User mode<br/>CSRSS, Win32 apps, services]
    --> b[Win32 subsystem<br/>csrss.exe, Console, GDI, USER]
```
