// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Treasury {
    address public owner;
    event PaymentReceived(address from, uint amount, string paymentType);

    constructor() {
        owner = msg.sender;
    }

    function receivePayment(string calldata paymentType) external payable {
        require(msg.value > 0, "No payment sent");
        emit PaymentReceived(msg.sender, msg.value, paymentType);
    }

    function withdraw() external {
        require(msg.sender == owner, "Not owner");
        payable(owner).transfer(address(this).balance);
    }
}
