A blockchain is a distributed, append only ledger shared accross many nodes with  no central authority where:
1. Ledger, not database: The ledger is a sequence of blocks. Each block contains a set of transactions and a reference (cryptographic hash) to the previous block. This creates a chain where you can only append new blocks; you cannot edit or delete the existing blocks without breaking the all later hashes 
2. Distributed and replicated. Every node keeps a copy of the the ledger and independently verifies every transaction and block against the same rules. There is no master copy
3. No trusted coordinator. Nodes dont trust each other. They agree on the current state via a consensus protocol. The rule is follow  the chain the consesus rules declared
4. Trust-minimization. You trust the cryptography,software and concensus. Theres no central bank
5. Finality is probabilistic or exoplicit. In PoW like bitcoin, a transaction gets h arder to to reverse as more blocks pile on top(usually 6 confirmations = proactically final). In BTF/PoS chains, finality casn be explicit after a vote/.
6