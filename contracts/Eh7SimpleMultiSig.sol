pragma solidity ^0.4.22;

contract Eh7SimpleMultiSig {

  uint public nonce;                 // (only) mutable state
  uint public threshold;             // immutable state
  mapping (address => bool) isOwner; // immutable state
  address[] public ownersArr;        // immutable state

  // Note that owners_ must be strictly increasing, in order to prevent duplicates
  constructor(uint threshold_, address[] owners_) public {
    require(owners_.length <= 10 && threshold_ <= owners_.length && threshold_ >= 0);

/*
    address lastAdd = address(0); 
    for (uint i = 0; i < owners_.length; i++) {
      require(owners_[i] > lastAdd);
      isOwner[owners_[i]] = true;
      lastAdd = owners_[i];
    }
    ownersArr = owners_;
    threshold = threshold_;
*/
  }

  // Note that address recovered from signatures must be strictly increasing, in order to prevent duplicates
  function execute(uint8[] sigV, bytes32[] sigR, bytes32[] sigS, address destination, uint value, bytes data) public {
    require(sigR.length == threshold);
    require(sigR.length == sigS.length && sigR.length == sigV.length);

    // Follows ERC191 signature scheme: https://github.com/ethereum/EIPs/issues/191
    bytes32 txHash = keccak256(byte(0x19), byte(0), this, destination, value, data, nonce);

    address lastAdd = address(0); // cannot have address(0) as an owner
    for (uint i = 0; i < threshold; i++) {
      address recovered = ecrecover(txHash, sigV[i], sigR[i], sigS[i]);
      require(recovered > lastAdd && isOwner[recovered]);
      lastAdd = recovered;
    }

    // If we make it here all signatures are accounted for.
    // The address.call() syntax is no longer recommended, see:
    // https://github.com/ethereum/solidity/issues/2884
    nonce = nonce + 1;
    bool success = false;
    assembly { success := call(gas, destination, value, add(data, 0x20), mload(data), 0, 0) }
    require(success);
  }

//  function verify(address p, bytes32 hash, uint8 v, bytes32 r, bytes32 s) public constant returns(bool) {
//  function checkDataSig(address p, bytes32 hash) public pure returns(bool) {
//  function checkDataSig(address p, bytes32 hash, uint8 v, bytes32 r, bytes32 s) public pure returns(bool) {
  function checkDataSig(address _address, bytes32 _message, uint8 _v, bytes32 _r, bytes32 _s) public pure returns(address) {

     bytes32 txHash = keccak256('hello!');

//     return ecrecover(_message, _v, _r, _s) == ecrecover(txHash, _v, _r, _s);
     return ecrecover(_message, _v, _r, _s);

//     return true;

    // Note: this only verifies that signer is correct.
    // You'll also need to verify that the hash of the data
    // is also correct.
//    return ecrecover(_message, _v, _r, _s) == _address;
//    return true;
//    return ecrecover(hash, v, r, s);
//    return _address;
//    return _message;
//    return _v;
//    return _r;
//    return _s;
  }

  function testRecovery(bytes32 h, uint8 v, bytes32 r, bytes32 s) returns (address) {
    /* prefix might be needed for geth only
    * https://github.com/ethereum/go-ethereum/issues/3731
    */
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    h = sha3(prefix, h);
    address addr = ecrecover(h, v, r, s);

    return addr;
  }

//  function testRecoveryWithPrefix(bytes32 h, uint8 v, bytes32 r, bytes32 s) returns (address) {
  function testRecoveryWithPrefix(bytes32 h, uint8 v, bytes32 r, bytes32 s) returns (address) {

//    return h;
//    return keccak256("\x19Ethereum Signed Message:\n32");

    /* prefix might be needed for geth only
    * https://github.com/ethereum/go-ethereum/issues/3731
    */
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    h = sha3(prefix, h);
return ecrecover(h, v, r, s);
/*
    address addr = ecrecover(h, v, r, s);

    return addr;
*/
  }

  function () payable public {}
}
