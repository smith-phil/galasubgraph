export { handleApproval } from '@openzeppelin/subgraphs/src/datasources/erc20'
import {
	Transfer as TransferEvent,
} from '../../generated/erc20/IERC20'

import { 
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
	transfer.transaction = transactions.log(event).id
	transfer.timestamp = event.block.timestamp
	transfer.value = decimals.toDecimals(event.params.value, contract.decimals)
	transfer.valueExact = event.params.value

    if(event.params.from.toHex() === constants.ADDRESS_ZERO ) {
        // Minty fresh tokens! Handle the mint
		let mint = new ERC20Mint(events.id(event))
		mint.emitter = contract.id
		mint.transaction = transfer.transaction
		mint.timestamp = transfer.timestamp
		mint.contract = contract.id
		mint.value = transfer.value
		mint.valueExact = transfer.valueExact
		let to = fetchAccount(event.params.to)
		mint.to = to.id
		mint.toBalance = fetchERC20Balance(contract, to).id
		mint.save()

		// update the transfer with the to details
		transfer.to = to.id         
		
		// update the balance
		let balance = fetchERC20Balance(contract, to)
		balance.valueExact = balance.valueExact.plus(event.params.value)
		balance.value = decimals.toDecimals(balance.valueExact, contract.decimals)
		balance.save()

		// handle total supply
		let totalSupply = fetchERC20Balance(contract, null)
		totalSupply.valueExact = totalSupply.valueExact.plus(transfer.valueExact)
		totalSupply.value = decimals.toDecimals(totalSupply.valueExact, contract.decimals)
		totalSupply.save()
    }	

	if(event.params.to.toHex() === constants.ADDRESS_ZERO) {
		// Burn burn burn, that ring of fire ...
		// TODO: ERC20Burn???
		// handle total supply
		let totalSupply = fetchERC20Balance(contract, null)
		totalSupply.valueExact = totalSupply.valueExact.minus(transfer.valueExact)
		totalSupply.value = decimals.toDecimals(totalSupply.valueExact, contract.decimals)
		totalSupply.save()

		let from = fetchAccount(event.params.from)
		let balance = fetchERC20Balance(contract, from)
		balance.valueExact = balance.valueExact.minus(event.params.value)
		balance.value = decimals.toDecimals(balance.valueExact, contract.decimals)
		balance.save()

		transfer.from = from.id
		transfer.fromBalance = balance.id
	}
	transfer.save()
}
