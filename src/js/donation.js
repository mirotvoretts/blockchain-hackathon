const hre = require('hardhat')

async function donate(donor, campaignAddress, amount) {
	const campaign = await hre.ethers.getContractAt(
		'CharityCampaign',
		campaignAddress,
		donor
	)

	const txDonate = await campaign.donate({
		value: amount,
	})

	await txDonate.wait()
}
