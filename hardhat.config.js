require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()

module.exports = {
	solidity: '0.8.28',
	networks: {
		sepolia: {
			url: process.env.SEPOLIA_RPC_URL,
			accounts: [process.env.PRIVATE_KEY],
			chainId: 11155111,
		},
	},
	etherscan: {
		apiKey: {
			sepolia: process.env.ETHERSCAN_API_KEY,
		},
	},
	paths: {
		sources: './contracts',
		artifacts: './artifacts',
	},
}
