export { handleApproval } from '@openzeppelin/subgraphs/src/datasources/erc20'
import {
	Transfer as TransferEvent,
} from '../../generated/erc20/IERC20'

import { 
	ERC20Burn,
	ERC20Mint, 
	ERC20Transfer 
} from '../../generated/schema'

import {
	constants,
	decimals,
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '@openzeppelin/subgraphs/src/fetch/account'

import {
	fetchERC20,
	fetchERC20Balance,
} from '@openzeppelin/subgraphs/src/fetch/erc20'

/**
 * Handles transfers, mints, and burns of Gala erc 20 tokens.
 *  * If the from address is 0x0 then it is a mint
 *  * if the to address is 0x0 then it is a burn
 * @param event the transfer event
 */
export function handleMintAndTransfer(event: TransferEvent): void { 
	// handle create new mint
	let contract = fetchERC20(event.address)
	let transfer = new ERC20Transfer(events.id(event))
	transfer.emitter = contract.id
	transfer.contract = contract.id
	transfer.transaction = transactions.log(event).id
	transfer.timestamp = event.block.timestamp
	transfer.value = decimals.toDecimals(event.params.value, contract.decimals)
	transfer.valueExact = event.params.value
	let from = fetchAccount(event.params.from)
	transfer.from = from.id 
	let to = fetchAccount(event.params.to)
	transfer.to = to.id 

    if(event.params.from.toHexString() == constants.ADDRESS_ZERO.toHexString() ) {
        // Minty fresh tokens! Handle the mint
		let mintId = contract.id.concat("-").concat(events.id(event))
		let mint = new ERC20Mint(mintId)
		mint.emitter = contract.id
		mint.transaction = transfer.transaction
		mint.timestamp = transfer.timestamp
		mint.contract = contract.id
		mint.value = transfer.value
		mint.valueExact = transfer.valueExact
		mint.to = to.id
		mint.toBalance = fetchERC20Balance(contract, to).id
		mint.save()

		// handle total supply
		let totalSupply = fetchERC20Balance(contract, null)
		totalSupply.valueExact = totalSupply.valueExact.plus(transfer.valueExact)
		totalSupply.value = decimals.toDecimals(totalSupply.valueExact, contract.decimals)
		totalSupply.save()
    } else {
		// update the balance
		let balance = fetchERC20Balance(contract, from)
		balance.valueExact = balance.valueExact.minus(event.params.value)
		balance.value = decimals.toDecimals(balance.valueExact, contract.decimals)
		balance.save()

		transfer.fromBalance = balance.id
	}

	if(event.params.to.toHexString() == constants.ADDRESS_ZERO.toHexString()) {
		// Burn burn burn, that ring of fire ...
		let burnId = contract.id.concat("-").concat(events.id(event))
		let burn = new ERC20Burn(burnId)
		burn.emitter = contract.id
		burn.contract = contract.id
		burn.transaction = transfer.transaction
		burn.timestamp = transfer.timestamp
		burn.value = transfer.value
		burn.valueExact = transfer.valueExact
		burn.from = from.id
		burn.fromBalance = fetchERC20Balance(contract, from).id
		burn.save()
		
		// handle total supply
		let totalSupply = fetchERC20Balance(contract, null)
		totalSupply.valueExact = totalSupply.valueExact.minus(transfer.valueExact)
		totalSupply.value = decimals.toDecimals(totalSupply.valueExact, contract.decimals)
		totalSupply.save()
	} else {
		
		let balance = fetchERC20Balance(contract, to)
		balance.valueExact = balance.valueExact.plus(event.params.value)
		balance.value = decimals.toDecimals(balance.valueExact, contract.decimals)
		balance.save()

		transfer.toBalance = balance.id
	}
	transfer.save()
}
