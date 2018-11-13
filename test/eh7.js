var Eh7SimpleMultiSig = artifacts.require("./Eh7SimpleMultiSig.sol")
const solsha3 = require('solidity-sha3').default
const Promise = require('bluebird')
const BigNumber = require('bignumber.js')
var ethUtils = require('ethereumjs-util')


const web3SendTransaction = Promise.promisify(web3.eth.sendTransaction)
const web3GetBalance = Promise.promisify(web3.eth.getBalance)

contract('Eh7SimpleMultiSig', function(accounts) {

  let testFunction = async function(done) {

    let multisig = await Eh7SimpleMultiSig.new(1, accounts, {from: accounts[0]})
  
    let randomAddr = solsha3(Math.random()).slice(0,42)

    let myBalance = await web3GetBalance(accounts[0])
//    console.log(web3.fromWei(myBalance.toNumber(),'ether'))

    let nonce = await multisig.nonce.call()
//    console.log(nonce.toNumber())

    web3SendTransaction({from: accounts[9], to: accounts[0], value: web3.toWei(new BigNumber(10), 'ether')})

    myBalance = await web3GetBalance(accounts[0])
//    console.log(web3.fromWei(myBalance.toNumber(),'ether'))

    nonce = await multisig.nonce.call()
//    console.log(nonce.toNumber())

    done()
  }

  let testRecovery = async function(done) {
    //testRecovery(bytes32 h, uint8 v, bytes32 r, bytes32 s) returns (address)
    let multisig = await Eh7SimpleMultiSig.new(1, accounts, {from: accounts[0]})
//    var instance = await Eh7SimpleMultiSig.deployed(1, accounts, {from: accounts[0]})

    var address = accounts[0]
    var msg = 'hello'
    var h = web3.sha3(msg)
    var sig = web3.eth.sign(address, h).slice(2)
    var r = `0x${sig.slice(0, 64)}`
    var s = `0x${sig.slice(64, 128)}`
    var v = web3.toDecimal(sig.slice(128, 130)) + 27

    var result = await multisig.testRecovery.call(h, v, r, s)
    console.log(result)
    console.log(address)


    // test ethUtils to do the same //

    var msg = new Buffer('hello')
    var h = web3.sha3(msg.toString('utf8'))
    var prefix = new Buffer("0x19Ethereum Signed Message:\n32")
console.log("0x"+ethUtils.sha3("\x19Ethereum Signed Message:\n32").toString('hex'))
//console.log(prefix, new Buffer(String(h.length)), new Buffer(h))
    var prefixedMsg = ethUtils.sha3(
//      Buffer.concat([prefix, new Buffer(String(h.length)), new Buffer(h)])
      Buffer.concat([prefix, new Buffer(h)])
    )
    prefixedMsg = "0x"+prefixedMsg.toString('hex');

    var sig = web3.eth.sign(address, prefixedMsg).slice(2)
console.log(sig.slice(2))
//console.log(r,s,v)

    var r = `0x${sig.slice(0, 64)}`
    var s = `0x${sig.slice(64, 128)}`
    var v = web3.toDecimal(sig.slice(128, 130)) + 27

//    result = await multisig.testRecoveryWithPrefix.call(prefixedMsg)//, web3.toDecimal(uint8[0]), r, s)
    result = await multisig.testRecoveryWithPrefix.call(prefixedMsg, v, r, s)
    console.log(result)
    console.log(address)
/*
*/

/*
//console.log(prefixedMsg.toString('hex'))
    var sig = web3.eth.sign(address, '0x' + prefixedMsg.toString('hex'))
console.log(sig)
    var r = `0x${sig.slice(0, 64)}`
    var s = `0x${sig.slice(64, 128)}`
//console.log(web3.toDecimal(sig.slice(128, 130)))
    var v = web3.toDecimal(sig.slice(128, 130)) + 27
    var res = ethUtils.fromRpcSig(sig);
    var result = await multisig.testRecovery.call(prefixedMsg, v, r, s)
    console.log(result)
    console.log(address)
//    console.log(prefixedMsg.toString('hex'))
*/
/*
    var pubKey  = ethUtils.ecrecover(prefixedMsg, v, r, s);
    var addrBuf = ethUtils.pubToAddress(pubKey);
    var addr    = ethUtils.bufferToHex(addrBuf);

//    console.log(address,  addr);
//    result = await multisig.testRecoveryWithPrefix.call(prefixedMsg, v, r, s)
//    console.log(result)
*/

/*
    var h = web3.sha3(msg)
    var h1 = web3.sha3("\x19Ethereum Signed Message:\n32", h)
    var sig = web3.eth.sign(address, h).slice(2)
    var r = `0x${sig.slice(0, 64)}`
    var s = `0x${sig.slice(64, 128)}`
    var v = web3.toDecimal(sig.slice(128, 130)) + 27
    result = await multisig.testRecoveryWithPrefix.call(h1, v, r, s)
    console.log(result)
    console.log(address)
*/

    done()
  }

  let checkVerify = async function(done) {

    let multisig = await Eh7SimpleMultiSig.new(1, accounts, {from: accounts[0]})

    const msg = new Buffer('hello')
    const sig = web3.eth.sign(web3.eth.accounts[0], '0x' + msg.toString('hex'))
    const res = ethUtils.fromRpcSig(sig);
    console.log(msg,sig,res)

    const prefix = new Buffer("\x19Ethereum Signed Message:\n")
    const prefixedMsg = ethUtils.sha3(
      Buffer.concat([prefix, new Buffer(String(msg.length)), msg])
    )
    console.log(prefixedMsg)

    const pubKey  = ethUtils.ecrecover(prefixedMsg, res.v, res.r, res.s);
    const addrBuf = ethUtils.pubToAddress(pubKey);
    const addr    = ethUtils.bufferToHex(addrBuf);

    console.log(web3.eth.accounts[0],  addr);

    let sigCheck = await multisig.checkDataSig(
      web3.eth.accounts[0],
      msg,
      v,
      "0x" + r.toString('hex'),
      "0x" + s.toString('hex')
    )

/*
    const msg = web3.sha3('hello!');
    const sig = web3.eth.sign(web3.eth.accounts[0], msg);
    const {v, r, s} = ethUtils.fromRpcSig(sig);

    const pubKey  = ethUtils.ecrecover(ethUtils.toBuffer(msg), v, r, s);
    const addrBuf = ethUtils.pubToAddress(pubKey);
    const addr    = ethUtils.bufferToHex(addrBuf);

//    console.log(web3.eth.accounts[0], addr);

    let sigCheck = await multisig.checkDataSig(
      web3.eth.accounts[0],
      msg,
      v,
      "0x" + r.toString('hex'),
      "0x" + s.toString('hex')
    )
*/

//    console.log(web3.eth.accounts[0])
//    console.log(msg)
//    console.log(sigCheck)
/*
*/
/*
    var privkey = new Buffer('3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1', 'hex')
    var thisAaddress = "0x" + ethUtils.privateToAddress(privkey).toString('hex')
    var thisPublicKey = "0x" + ethUtils.privateToPublic(privkey).toString('hex')
    var data = ethUtils.sha3('hello my name is gav')
    var signature = ethUtils.ecsign(data, privkey)
//    console.log(signature)
//console.log(data)
    console.log(thisAaddress)
    console.log(thisAaddress.toString('hex'))
    console.log(thisPublicKey.toString('hex').slice(0,42))
    console.log(ethUtils.ecrecover(data, signature.v, signature.r, signature.s).toString('hex'))

    let sigCheck = await multisig.checkDataSig(
//      "0x"+thisPublicKey.toString('hex').slice(0,42), 
      accounts[0],
      data.toString('hex'), 
      signature.v, 
      signature.r.toString('hex'), 
      signature.s.toString('hex')
    )

    console.log(accounts[0])
    console.log(sigCheck)
*/
/*
    await multisig.execute(sigs.sigV, sigs.sigR, sigs.sigS, randomAddr, value, '0x', {from: accounts[0], gasLimit: 1000000})
*/
    
    done()
  }


//  it("example test function call", (done) => {
//    testFunction(done)
//  })

  it("test checkDataSig function call", (done) => {
//    checkVerify(done)
    testRecovery(done)
  })

})




/*
//var sigUtil = require('eth-sig-util')
////console.log(sigUtil)

//var params = [msg, from]
//var method = 'personal_sign'

var ethUtils = require('ethereumjs-util')

var chainId = 1515
var privkey = new Buffer('3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1', 'hex')
var data = ethUtils.sha3('hello my name is gav')

console.log(ethUtils.isValidPrivate(privkey))
var address = ethUtils.privateToAddress(privkey)
console.log(address.toString('hex'))

var signature = ethUtils.ecsign(data, privkey, chainId)
console.log(signature)

var pubkey = ethUtils.ecrecover(data, signature.v, signature.r, signature.s);
console.log(pubkey)

var address = ethUtils.pubToAddress(pubkey)
console.log(address.toString('hex'))

//var vrs = ethUtils.ecsign(data, privkey);
//var pubkey = ethUtils.ecrecover(data, vrs.v, vrs.r, vrs.s);
//console.log(pubkey.toString('hex'))

//console.log(vrs)
//console.log(data.toString('hex'))
//pub     = ethUtils.ecrecover(data, vrs.v, vrs.r, vrs.s)
////console.log(pub.toString('hex'))
////console.log(web3)

*/
