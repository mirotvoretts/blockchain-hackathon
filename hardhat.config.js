require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()

module.exports = {
  solidity: '0.8.28',

  networks: {
    hardhat: {

      chainId: 31337,
    },
  },

  paths: {
    sources: './contracts',
    artifacts: './artifacts',
  },
}
