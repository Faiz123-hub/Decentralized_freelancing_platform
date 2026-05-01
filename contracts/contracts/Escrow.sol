// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Escrow {
    enum Status {
        Created,
        Funded,
        Completed,
        Released
    }

    struct JobEscrow {
        address client;
        address freelancer;
        uint256 amount;
        Status status;
    }

    uint256 public jobCount;
    mapping(uint256 => JobEscrow) private jobs;

    event JobCreated(uint256 indexed jobId, address indexed client, address indexed freelancer);
    event FundsDeposited(uint256 indexed jobId, uint256 amount);
    event JobCompleted(uint256 indexed jobId);
    event PaymentReleased(uint256 indexed jobId, uint256 amount);

    modifier onlyClient(uint256 jobId) {
        require(jobs[jobId].client == msg.sender, "Only client can call");
        _;
    }

    modifier onlyFreelancer(uint256 jobId) {
        require(jobs[jobId].freelancer == msg.sender, "Only freelancer can call");
        _;
    }

    modifier inStatus(uint256 jobId, Status expectedStatus) {
        require(jobs[jobId].status == expectedStatus, "Invalid escrow status");
        _;
    }

    function createJob(address freelancer) external returns (uint256) {
        require(freelancer != address(0), "Invalid freelancer");
        require(freelancer != msg.sender, "Freelancer must differ from client");

        jobCount += 1;
        jobs[jobCount] = JobEscrow({
            client: msg.sender,
            freelancer: freelancer,
            amount: 0,
            status: Status.Created
        });

        emit JobCreated(jobCount, msg.sender, freelancer);
        return jobCount;
    }

    function depositFunds(uint256 jobId)
        external
        payable
        onlyClient(jobId)
        inStatus(jobId, Status.Created)
    {
        require(msg.value > 0, "Amount must be greater than zero");

        JobEscrow storage job = jobs[jobId];
        job.amount = msg.value;
        job.status = Status.Funded;

        emit FundsDeposited(jobId, msg.value);
    }

    function markCompleted(uint256 jobId)
        external
        onlyFreelancer(jobId)
        inStatus(jobId, Status.Funded)
    {
        jobs[jobId].status = Status.Completed;
        emit JobCompleted(jobId);
    }

    function releasePayment(uint256 jobId)
        external
        onlyClient(jobId)
        inStatus(jobId, Status.Completed)
    {
        JobEscrow storage job = jobs[jobId];
        uint256 amount = job.amount;

        job.amount = 0;
        job.status = Status.Released;

        payable(job.freelancer).transfer(amount);
        emit PaymentReleased(jobId, amount);
    }

    function getJob(uint256 jobId)
        external
        view
        returns (address client, address freelancer, uint256 amount, Status status)
    {
        JobEscrow memory job = jobs[jobId];
        return (job.client, job.freelancer, job.amount, job.status);
    }
}
