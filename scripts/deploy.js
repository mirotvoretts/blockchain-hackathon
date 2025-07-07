const hre = require("hardhat")

async function main() {
    const DonationPool = await hre.ethers.getContractFactory("DontationPool");
    const contract = await DonationPool.deploy();

    await contract.waitForDeployment();
    console.log("Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
    console.log(error);
    process.exitCode = 1;
})