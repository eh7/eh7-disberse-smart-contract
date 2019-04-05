pragma solidity ^0.5.0;

contract Owned {

    address public owner;

     constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        if (msg.sender != owner) revert();
        _;
    }

    function transferOwnership(address newOwner) onlyOwner public {
        owner = newOwner;
    }

    function kill() onlyOwner public {
        selfdestruct(msg.sender);
    }
}

contract Disberse is Owned {

//  event Int(uint _number);
//  event Bytes32(bytes32 _h);
//  event Addr(address _address, bool status);
  event Status(uint _code, bytes32 _orgHash);

  event Deposit(address _to, uint _value, bytes8 project_ref, uint8 status, uint token_type);
  event Transfered(address indexed _from, address indexed _to, uint _value, bytes8 project_ref, uint8 status, uint token_type);
  event Redeemed(address indexed _from, uint _value, bytes8 project_ref, uint8 status, uint token_type);

  uint8 public decimals = 2;

  mapping (bytes32 => address) public orgAddress;
  mapping (bytes32 => address) public orgOwner;
  mapping (bytes32 => address[]) orgSigners; 
  mapping (bytes32 => uint) orgSignerThreshold;
  mapping (bytes32 => mapping(address => bool)) public orgSignerCheck;


  struct balance {
    mapping (uint => uint256) token_type;
  }

  mapping (address => balance) balances;

/*
  mapping (uint => string) public token_type;
  uint public token_type_count = 0;


  mapping (uint => bytes8) public ref;
  mapping (uint => string) public note;
  mapping (uint => address) public address_from;
  mapping (uint => uint) public tx_token_type;

  uint public note_count = 0;
*/


  // Note that owners_ array must be strictly increasing, 
  // in order to prevent duplicates
  constructor() public {
  }


  function initOrgSigner(bytes32 _orgHash, address[] memory _owners) internal { 
    address lastAdd = address(0);
    for (uint i=0; i<_owners.length; i++) {
      require(_owners[i] > lastAdd);
      orgSignerCheck[_orgHash][_owners[i]] = true;
      lastAdd =  _owners[i];
    }
    orgSigners[_orgHash] = _owners;
  }

  function editOrg(bytes32 _orgHash, address _orgAddress, uint _threshold, address[] memory _owners) public returns (bool) { //returns (bytes32, address, uint, address[] memory) {
    require( 
      _owners.length <= 10 && 
      _threshold <= _owners.length && 
      _threshold > 0
    );
    if(orgOwner[_orgHash] == address(0)){
      initOrgSigner(_orgHash, _owners);    
      orgOwner[_orgHash] = msg.sender;
      orgAddress[_orgHash] = _orgAddress;
      orgSignerThreshold[_orgHash] = uint(_threshold);
      emit Status(2, _orgHash);
      return true;
    } else {
      if(msg.sender == orgOwner[_orgHash]) {
        initOrgSigner(_orgHash, _owners);    
        orgSignerThreshold[_orgHash] = uint(_threshold);
        emit Status(3, _orgHash);
        return true;
      } else { return false; }
    }
  }

  function getSingersAndThreshold(bytes32 _orgHash) public view returns (address[] memory signers, uint threshold) {
    return (orgSigners[_orgHash], orgSignerThreshold[_orgHash]);
  }

  function verifyAndSend(bytes32 _orgHash, uint8[] memory sigV, bytes32[] memory sigR, bytes32[] memory sigS, bytes32[] memory _h, address[] memory signers, uint _value, uint _type, bytes8 projectName, address _to, uint _txType) public  {

    emit Status(88, _orgHash);

    require(sigR.length == orgSignerThreshold[_orgHash], "threshold not correct");
    require(sigR.length == sigS.length && sigR.length == sigV.length, "sig data not complete");
    
    address lastAdd = address(0);

    for(uint8 i=0; i<_h.length; i++) {
      address addr = ecrecover(_h[i], sigV[i], sigR[i], sigS[i]);
      require(addr > lastAdd && orgSignerCheck[_orgHash][addr], "verifyAndSend - failed checks ");
      lastAdd = addr;
    }

    if(_txType == 1)
      deposit(_value, projectName, _type);
    else if(_txType == 2)
      redeem(_value, projectName, _type);
    else 
      transfer(_to, _value, projectName, _type);

//    emit Status(5, _orgHash);
  }

  function verifyWithPrefixAndSend(bytes32 _orgHash, uint8[] memory sigV, bytes32[] memory sigR, bytes32[] memory sigS, bytes32[] memory _h, address[] memory signers, uint _value, uint _type, bytes8 projectName) public {

    require(sigR.length == orgSignerThreshold[_orgHash], "threshold not correct");
    require(sigR.length == sigS.length && sigR.length == sigV.length, "sig data not complete");

    address lastAdd = address(0);

    bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    for(uint i=0; i<_h.length; i++) {
      bytes32 h = keccak256(abi.encodePacked(prefix, _h[i]));
      address addr = ecrecover(h, sigV[i], sigR[i], sigS[i]);
      require(addr > lastAdd && orgSignerCheck[_orgHash][addr], "verifyWithPrefixAndSend - failed checks ");
      lastAdd = addr;
    }
    deposit(_value, projectName, _type);
//    emit Status(4, _orgHash);
  }

  function transfer(address _to, uint _value, bytes8 project, uint token_type_in) public returns (bool success) {
    if(balances[msg.sender].token_type[token_type_in] >= _value 
    && _value > 0
    && balances[_to].token_type[token_type_in] + _value > balances[_to].token_type[token_type_in] ) {
      balances[msg.sender].token_type[token_type_in] -= _value;
      balances[_to].token_type[token_type_in] += _value; 
//      ref[note_count] = project;
//      note[note_count] = "transfer";
//      address_from[note_count] = msg.sender;
//      note_count++;
      emit Transfered(msg.sender, _to, _value, project, 0, token_type_in);
      return true;
    } else {
      emit Transfered(msg.sender, _to, _value, project, 1, token_type_in);
      return false;
    }
  }

  function depositToAddress(uint _amount, bytes8 _ref, uint token_type_in, address accountAddress) internal {
    balances[accountAddress].token_type[token_type_in] += _amount;
//    ref[note_count] = _ref;
//    note[note_count] = "deposit";
//    address_from[note_count] = accountAddress;
//    tx_token_type[note_count] = token_type_in;
//    note_count++;
    emit Deposit(accountAddress, _amount, _ref, 1, token_type_in);
  }

  function deposit(uint _amount, bytes8 _ref, uint token_type_in) public {
    balances[msg.sender].token_type[token_type_in] += _amount;
//    ref[note_count] = _ref;
//    note[note_count] = "deposit";
//    address_from[note_count] = msg.sender;
//    tx_token_type[note_count] = token_type_in;
//    note_count++;
    emit Deposit(msg.sender, _amount, _ref, 0, token_type_in);
  }

  function redeem(uint _amount, bytes8 _ref, uint token_type_in) public returns (bool success) {
    if(balances[msg.sender].token_type[token_type_in] >= _amount 
    && _amount > 0
    && balances[msg.sender].token_type[token_type_in] + _amount > balances[msg.sender].token_type[token_type_in] ) {
      balances[msg.sender].token_type[token_type_in] -= _amount;
//      ref[note_count] = _ref;
//      note[note_count] = "redeem";
//      address_from[note_count] = msg.sender;
//      tx_token_type[note_count] = token_type_in;
//      note_count++;
      emit Redeemed(msg.sender, _amount, _ref, 0, token_type_in);
      return true;
    }
    else
      emit Redeemed(msg.sender, _amount, _ref, 1, token_type_in);
      return false;
  }

  function getBalances(address account_address) public view returns (uint256 GBP, uint256 USD, uint256 EUR, uint256 AUD) {
    if(msg.sender == owner || msg.sender == account_address) {
      return (balances[account_address].token_type[0],
        balances[account_address].token_type[1],
        balances[account_address].token_type[2],
        balances[account_address].token_type[3]
      );
    } else
      return (0,0,0,0);
  }

  function getBalance(address account_address, uint token_type_in) public view returns (uint256 return_balance) {
    if(msg.sender == owner || msg.sender == account_address) return balances[account_address].token_type[token_type_in];
    return 0;
  }

  function () payable external {}
}
