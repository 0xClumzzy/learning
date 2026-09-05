A blockchain is a distributed, append only ledger shared accross many nodes with  no central authority where:
1. Ledger, not database: The ledger is a sequence of blocks. Each block contains a set of t[[blockchain types]]ransactions and a reference (cryptographic hash) to the previous block. This creates a chain where you can only append new blocks; you cannot edit or delete the existing blocks without breaking the all later hashes 
2. Distributed and replicated. Every node keeps a copy of the the ledger and independently verifies every transaction and block against the same rules. There is no master copy
3. No trusted coordinator. Nodes dont trust each other. They agree on the current state via a consensus protocol. The rule is follow  the chain the consesus rules declared
4. Trust-minimization. You trust the cryptography,software and concensus. Theres no central bank
5. Finality is probabilistic or exoplicit. In PoW like bitcoin, a transaction gets h arder to to reverse as more blocks pile on top(usually 6 confirmations = proactically final). In BTF/PoS chains, finality casn be explicit after a vote/.
CODE EXAMPLE(mini blockchain)
```python 
import hashlib 

def hash_block(data: str, prev_hash: str) -> str:
	return haslib.sha256((prev_hash + data).encode()).hexdigest()

#Genesis  block has no predecessor
chain=[]
prev = "0"*64

for txs in ["alice->bob $10", "bob->carol $20", "carol->dave $5"]:
	h = hash_block(txs, prev)
	chain.append({"txs":tsx, "prev":prev, "hash":h}) 
``` 
CODE BREAKDOWN: 
```python
hashlib.sha256((prev_hash + data).encode()).hexdigest()
```
This is a the heart of the mini blockchain
1. `hashlib.sha256()` - it calculates the sha256 hash and returns a hash object(256 bit fingerprint)
2. `prev_hash + data` - concatenates the previous hash to the new transaction data. It links them 
3. `.encode()` the concatenation(string) to bytes 
4. `.hexdigest()` converts the 256 bit fingerprint into a 64 bit character hex  string so its readable 
Why this matters 
- Deterministic - Same `prev_hash` + `data`  always give the same data
- Avalanche effect - Change one letter the whole thing changes
- irreversible
- Linking- Block 2 dependents on block one
```python
chain=[]
prev = "0"*64

for txs in ["alice->bob $10", "bob->carol $20", "carol->dave $5"]:
	h = hash_block(txs, prev)
	chain.append({"txs":tsx, "prev":prev, "hash":h}) 
```
1. `chain = []` initialize the chain 
2. multiply the previous block by 64, `prev = "0"*64`
3. for every transaction:
4. make a hash, `hash = hash_block(txs,prec`












