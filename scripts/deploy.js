const hre = require("hardhat")

async function main() {
    const PlatformRegistry = await hre.ethers.getContractFactory(
			'PlatformRegistry'
		)
    const contract = await PlatformRegistry.deploy(
			'0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 5)

    await contract.waitForDeployment();
    console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
    console.log(error);
    process.exitCode = 1;
})