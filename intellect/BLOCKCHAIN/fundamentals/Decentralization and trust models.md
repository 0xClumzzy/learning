- HOW BLOCKCHAIN NETWORKS ARE STRUCTURED
- THE DIFFERENT ROLES NODES PLAY
- TRUST
NODE TYPES 

| NODE TYPE       | WHAT IT STORES                                             | WHAT IT DOES                                                                             | WHO RUNS IT                                                           |
| --------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Full node       | The entire blockchain history(all blocks and transactions) | Validates every transaction and block independently. Enforces all rules                  | Volunteers,miners,validators,businesses                               |
| Light Node(SPV) | Only block headers(not full transaction data)              | Verifies transactions using proofs from full nodes. Trusts full nodes to handle the rest | Mobile wallets, browser extensions, resource constrained environments |
|                 |                                                            |                                                                                          |                                                                       |

Full nodes enforce concensus rules and store everything, if u run a full node you verify everything no need to trust anyone

Light nodes sacrifice independence for convenience.  