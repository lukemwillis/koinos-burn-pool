# koinos-burn-pool
The first burn pool contracts created for [Koinos](https://koinos.io). A burn pool will be operated using these contracts by Kui He and Luke Willis.

## Token
This is a standard ERC-20 style token. **PVHP** is Pooled VHP. Your PVHP balance represents your share of the pooled resources held by the pool contract.

## Pool
This is a contract which allows you to deposit KOIN or VHP in exchange for PVHP (1:1). You can withdraw VHP or KOIN in exchange for PVHP (1:1).

### Withdrawing VHP
VHP can be withdrawn immediately up to 100% of your PVHP holdings. PVHP will be burnt upon withdrawal. If there is not enough VHP held in the contract to satisfy your withdrawal request, the transaction will fail.

### Withdrawing KOIN
The contract will carry as small amount of KOIN as possible to maximize profits for pool participants. As such, there will usually not be enough KOIN to satisfy withdrawal requests. 

!NOTE: If participants need quick liquidity, we recommend withdrawing VHP and swapping VHP for KOIN on KoinDX or another DEX.

KOIN withdrawal requests will be queued and fulfilled on a first come, first served basis. Periodically, before re-burning KOIN into VHP, queued withdrawal requests will be satisfied as much as possible based on the contract's KOIN balance. In many cases, you may receive your requested KOIN over multiple transfers at different times.


# Proof of Burn Mining Details
Mining will run using the contract address as the producer. The block producing node(s) will be operated by Kui and Luke. VHP held by the contract will be slowly converted to KOIN (with profit) as the miner produces blocks. As such, the total supply of PVHP will typically be less than the contract's balance of VHP. 

Periodically, KOIN held by the contract will be re-burned as VHP. When this occurs, new PVHP will be minted and distributed to PVHP holders proportionately based on their share of the PVHP total supply.