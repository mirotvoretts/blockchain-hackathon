require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()

module.exports = {
	solidity: '0.8.28',
	networks: {
		localhost: {
			url: 'http://hardhat:8545',
		},
	},

	paths: {
		sources: './contracts',
		artifacts: './artifacts',
	},
}
