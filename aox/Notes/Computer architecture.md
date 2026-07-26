![[Pasted image 20260726174508.png]]

**MEMORY**

This is where temporary data/instructions of running programs are located
`Primary memory` - This what computer memory is known as
- The CPU uses it to retrieve and process data. 
The types of memory include:
- [ ] `Cache` 
Located in the CPU itself, running at the same clock speed and the cpu and being very limited in size. The cache is extremely fast 

There are usually three levels of cache memory, depending on their closeness to the CPU core:
```mermaid 
flowchart TD
a1{CACHE}--||3 LEVELS||-->a2[Level X Cache]
a2-->A(1)-->p1{=>fastest<br>=>in kilobytes<br>=>located in every cpu}
a2-->B(2)-->p2{=>fast<br>=>in megabytes<br>=>dedicated to each cpu core<br>=>Serves as a middle tier between L1 and L3}
a2-->C(3)-->p3{=>slow<br>=>in megabytes<br>faster than RAM<br>=>not all cpus use it}
```
- [ ] Random Access Memory
`RAM` is much larger than cache memory, coming in sizes ranging from gigabytes up to terabytes. `RAM` is also located far away from the `CPU` cores and is much slower than cache memory. Accessing data from RAM addresses takes many more instructions.




