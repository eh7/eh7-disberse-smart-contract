pragma solidity >=0.4.18;

contract Deployed {

//    event SetS(uint a);

    uint public a = 0;
/*
    constructor() public {
      a = 99;
    }
*/
    function setA(uint _a) public returns (uint) {
      a = _a;
      return a;
//      emit SetS(a);
    }
    
}

