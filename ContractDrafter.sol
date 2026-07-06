// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ContractDrafter
 * @notice A simple smart contract for drafting and signing agreements on-chain.
 * @dev This contract allows parties to create, sign, and manage simple contracts.
 *      It emits events for each action and stores contract data securely.
 */
contract ContractDrafter {

    // Struct representing a contract
    struct Agreement {
        string title;
        string description;
        address[] parties;
        mapping(address => bool) signed;
        bool finalized;
        uint256 createdAt;
    }

    // Array of all contracts
    Agreement[] public agreements;

    // Events
    event ContractCreated(uint256 indexed id, string title, address indexed creator);
    event ContractSigned(uint256 indexed id, address indexed signer);
    event ContractFinalized(uint256 indexed id);

    /**
     * @notice Create a new contract.
     * @param _title Title of the contract
     * @param _description Description or terms
     * @param _parties List of addresses that are parties to the contract
     * @return id The ID of the newly created contract
     */
    function createContract(
        string memory _title,
        string memory _description,
        address[] memory _parties
    ) public returns (uint256 id) {
        require(_parties.length > 0, "At least one party required");
        require(bytes(_title).length > 0, "Title required");

        id = agreements.length;
        agreements.push();
        Agreement storage newAgreement = agreements[id];
        newAgreement.title = _title;
        newAgreement.description = _description;
        newAgreement.parties = _parties;
        newAgreement.createdAt = block.timestamp;

        emit ContractCreated(id, _title, msg.sender);
    }

    /**
     * @notice Sign a contract as a party.
     * @param _id ID of the contract
     */
    function signContract(uint256 _id) public {
        require(_id < agreements.length, "Contract does not exist");
        Agreement storage agreement = agreements[_id];
        require(!agreement.finalized, "Contract already finalized");

        bool isParty = false;
        for (uint256 i = 0; i < agreement.parties.length; i++) {
            if (agreement.parties[i] == msg.sender) {
                isParty = true;
                break;
            }
        }
        require(isParty, "Not a party to this contract");
        require(!agreement.signed[msg.sender], "Already signed");

        agreement.signed[msg.sender] = true;
        emit ContractSigned(_id, msg.sender);

        // Auto-finalize if all parties have signed
        bool allSigned = true;
        for (uint256 i = 0; i < agreement.parties.length; i++) {
            if (!agreement.signed[agreement.parties[i]]) {
                allSigned = false;
                break;
            }
        }
        if (allSigned) {
            agreement.finalized = true;
            emit ContractFinalized(_id);
        }
    }

    /**
     * @notice Get details of a contract.
     * @param _id ID of the contract
     * @return title Title
     * @return description Description
     * @return parties Array of party addresses
     * @return finalized Whether contract is finalized
     * @return createdAt Timestamp of creation
     */
    function getContract(uint256 _id) public view returns (
        string memory title,
        string memory description,
        address[] memory parties,
        bool finalized,
        uint256 createdAt
    ) {
        require(_id < agreements.length, "Contract does not exist");
        Agreement storage agreement = agreements[_id];
        return (
            agreement.title,
            agreement.description,
            agreement.parties,
            agreement.finalized,
            agreement.createdAt
        );
    }

    /**
     * @notice Check if an address has signed a specific contract.
     * @param _id ID of the contract
     * @param _addr Address to check
     * @return True if signed, false otherwise
     */
    function hasSigned(uint256 _id, address _addr) public view returns (bool) {
        require(_id < agreements.length, "Contract does not exist");
        return agreements[_id].signed[_addr];
    }

    /**
     * @notice Get total number of contracts created.
     * @return count Number of contracts
     */
    function getContractCount() public view returns (uint256) {
        return agreements.length;
    }
}
