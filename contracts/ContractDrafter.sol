// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ContractDrafter {
    struct Agreement {
        address partyA;
        address partyB;
        bytes32 contentHash;
        bool signedByA;
        bool signedByB;
        bool finalized;
        uint256 createdAt;
    }

    uint256 public nextId;
    mapping(uint256 => Agreement) public agreements;
    mapping(bytes32 => bool) public contentHashExists;

    event AgreementCreated(uint256 indexed id, address indexed partyA, address indexed partyB, bytes32 contentHash);
    event AgreementSigned(uint256 indexed id, address signer);
    event AgreementFinalized(uint256 indexed id);

    modifier onlyParty(uint256 id, address party) {
        require(msg.sender == party, "Not authorized");
        _;
    }

    function createAgreement(address _partyB, bytes32 _contentHash) external returns (uint256) {
        require(_partyB != address(0), "Invalid partyB");
        require(!contentHashExists[_contentHash], "Content hash already used");
        uint256 id = nextId++;
        agreements[id] = Agreement({
            partyA: msg.sender,
            partyB: _partyB,
            contentHash: _contentHash,
            signedByA: false,
            signedByB: false,
            finalized: false,
            createdAt: block.timestamp
        });
        contentHashExists[_contentHash] = true;
        emit AgreementCreated(id, msg.sender, _partyB, _contentHash);
        return id;
    }

    function signAgreement(uint256 id) external {
        Agreement storage agreement = agreements[id];
        require(agreement.partyA != address(0), "Agreement does not exist");
        require(!agreement.finalized, "Already finalized");
        if (msg.sender == agreement.partyA) {
            require(!agreement.signedByA, "Already signed by partyA");
            agreement.signedByA = true;
        } else if (msg.sender == agreement.partyB) {
            require(!agreement.signedByB, "Already signed by partyB");
            agreement.signedByB = true;
        } else {
            revert("Not a party to this agreement");
        }
        emit AgreementSigned(id, msg.sender);
    }

    function finalizeAgreement(uint256 id) external {
        Agreement storage agreement = agreements[id];
        require(agreement.partyA != address(0), "Agreement does not exist");
        require(agreement.signedByA && agreement.signedByB, "Both parties must sign first");
        require(!agreement.finalized, "Already finalized");
        require(msg.sender == agreement.partyA || msg.sender == agreement.partyB, "Not a party");
        agreement.finalized = true;
        emit AgreementFinalized(id);
    }

    function getAgreement(uint256 id) external view returns (Agreement memory) {
        require(agreements[id].partyA != address(0), "Agreement does not exist");
        return agreements[id];
    }
}
