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

Light nodes sacrifice independence for convenience. They can verify whether a transaction exists on a block through a *merkle proof* but they trust the full node to tell them the full honest chain state 

TRUST ASSUMPTIONS 

When you use a blockchain you are trusting depending on how you interact

| HOW YOU INTERACT             | WHAT YOU TRUST                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| Running a full node          | Only the code you're running, you verify everything yourself                                  |
| Using a light wallet         | Full nodes you are connected to, if they collude they can lie to you                          |
| Using a centralized exchange | The exchange, they hold keys, control your funds                                              |
| Using a DeFi app             | The smart contract code, the oracle, the underlying consensus                                 |
| Running a validator/miner    | The consensus protocol, if u follow the rules, you get rewarded, if you cheat you get slashed |
ASSUMPTIONS

| assumption | what youre trusting |     |
| ---------- | ------------------- | --- |
|            |                     |     |
|            |                     |     |

THE DECENTRALIZED SPECTRUM
Not all block chains are equally decentralized

| Level               | Description                                           | example              |
| ------------------- | ----------------------------------------------------- | -------------------- |
| fully decentralized | Thousands of nodes, no singular controller            | bitcoin              |
| moderate            | Hundreds of nodes, a few large players have influence | ethereum(post-merge) |
| semi                | dozens of nodes, a few orgs                           | polygon              |
| centralized         | a single entity or a small consortium                 | private              |

TRUST MODELS
1. Trust the operator. Private/consortium chains
2. Trust the mjority. Public PoW/PoS chains
3. Trust the code. Smart contract platforms
















