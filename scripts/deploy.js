const hre = require('hardhat')

async function main() {
	const [deployer] = await hre.ethers.getSigners()
	console.log('Deploying contracts with account:', deployer.address)

	const Token = await hre.ethers.getContractFactory('PlatformToken')
	const token = await Token.deploy(deployer.address)
	await token.waitForDeployment()
	console.log(`Token deployed to: ${token.target}`)

	const Registry = await hre.ethers.getContractFactory('PlatformRegistry')
	const registry = await Registry.deploy(
		deployer.address,
		5,
		token.target
	)
	await registry.waitForDeployment()
	console.log(`Registry deployed to: ${registry.target}`)

	const MINTER_ROLE = await token.MINTER_ROLE()
	const tx = await token.grantRole(MINTER_ROLE, registry.target)
	await tx.wait()
	console.log(`Granted MINTER_ROLE to Registry (tx: ${tx.hash})`)

	const hasRole = await token.hasRole(MINTER_ROLE, registry.target)
	console.log('Role verification:', hasRole ? 'SUCCESS' : 'FAILED')
}

main().catch(error => {
	console.error(error)
	process.exitCode = 1
})
