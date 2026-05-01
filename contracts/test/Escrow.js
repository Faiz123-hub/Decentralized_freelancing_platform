const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow", function () {
  async function deployEscrowFixture() {
    const [client, freelancer, stranger] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    return { escrow, client, freelancer, stranger };
  }

  it("creates a job with the expected participants", async function () {
    const { escrow, client, freelancer } = await deployEscrowFixture();

    await escrow.connect(client).createJob(freelancer.address);

    const job = await escrow.getJob(1);
    expect(job.client).to.equal(client.address);
    expect(job.freelancer).to.equal(freelancer.address);
    expect(job.amount).to.equal(0n);
    expect(job.status).to.equal(0n);
  });

  it("lets the client fund and release after freelancer completion", async function () {
    const { escrow, client, freelancer } = await deployEscrowFixture();

    await escrow.connect(client).createJob(freelancer.address);
    await escrow.connect(client).depositFunds(1, { value: ethers.parseEther("1") });
    await escrow.connect(freelancer).markCompleted(1);

    await expect(escrow.connect(client).releasePayment(1)).to.changeEtherBalance(
      freelancer,
      ethers.parseEther("1")
    );

    const job = await escrow.getJob(1);
    expect(job.amount).to.equal(0n);
    expect(job.status).to.equal(3n);
  });

  it("blocks unauthorized actions", async function () {
    const { escrow, client, freelancer, stranger } = await deployEscrowFixture();

    await escrow.connect(client).createJob(freelancer.address);

    await expect(
      escrow.connect(stranger).depositFunds(1, { value: ethers.parseEther("0.5") })
    ).to.be.revertedWith("Only client can call");

    await escrow.connect(client).depositFunds(1, { value: ethers.parseEther("0.5") });

    await expect(escrow.connect(stranger).markCompleted(1)).to.be.revertedWith(
      "Only freelancer can call"
    );
  });
});
