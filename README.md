# koinos-burn-pool
The first burn pool contracts created for [Koinos](https://koinos.io). A burn pool will be operated using these contracts by Kui He and Luke Willis.

## Token
This is a standard ERC-20 style token. **PVHP** is Pooled VHP. Your PVHP balance represents your share of the pooled resources held by the pool contract.

## Pool
This is a contract which allows you to deposit KOIN or VHP in exchange for PVHP. You can withdraw VHP or KOIN in exchange for PVHP.

### Withdrawing VHP
When you withdraw a portion of the VHP held by the contract, your PVHP will be redeemed proportionately to the total supply of PVHP. Example: There is 100 VHP and 0 KOIN held by the contract. There are 10 PVHP total supply, and you hold 1 PVHP. Your 1 PVHP is worth 10 VHP when you withdraw.

### Withdrawing KOIN
The contract will carry as small amount of KOIN as possible to maximize profits for pool participants. As such, there will usually not be enough KOIN to satisfy withdrawal requests. 

!NOTE: If participants need quick liquidity, we recommend withdrawing VHP and swapping VHP for KOIN on KoinDX or another DEX.

As a future enhancement, we intend to integrate withdrawals with KoinDX, so that requests to exchange PVHP for KOIN can be satisfied in one transaction with the pool.

# Proof of Burn Mining Details
There will be a block producing node (or nodes) using the pool contract's address as the producer. The block producing node(s) will be operated by Kui and Luke. VHP held by the contract will be slowly converted to KOIN (with profit) as the miner produces blocks. As such, the total supply of PVHP will typically be less than the contract's balance of VHP/KOIN. 

## Operator Fee
To cover the cost of operating the node with maximum uptime, Kui and Luke will take 5% of profits generated by the pool. Participants will always receive 100% of their deposits back plus extra. The operator fee only comes out of profits returned above and beyond deposits. Example: You deposit 1,000 KOIN and stay in the pool for one year. Under initial Koinos mainnet configuration, you would earn roughly 40 KOIN (4%), making your balance 1,040 at the end of the year. The operator takes 5% of 40 which is 2 KOIN.

We expect this rate to be competitive at launch, but we will adjust as needed based on market conditions. Large individual KOIN holders may want to operate their own nodes. At some point, managing your own node becomes worth the hassle. For smaller holders, participating in a pool will almost always be the best choice.

## Voting Rights
On Koinos, block producers are responsible for voting on governance proposals. If you are running your own node, you are responsible for voting. By default, all of your votes are *no* unless you specifically decide to vote *yes* and configure your node to include your vote in each block produced. Kui and Luke will review each governance proposal and publish our intended vote during the proposal review period. If you decide you don't like our decision, we encourage you to discuss with us, but you are always welcome to withdraw your VHP and run your own node or move to a competing pool for the duration of the vote or as long as you like.
