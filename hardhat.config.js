require('@nomicfoundation/hardhat-ethers')
require('hardhat/config').HardhatUserConfig

module.exports = {
	solidity: '0.8.28',
	paths: {
		sources: './contracts',
		artifacts: './artifacts',
	},
}
