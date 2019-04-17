const Disberse = artifacts.require('./Disberse.sol')

const bip39    = require('bip39')
const ethUtils = require('ethereumjs-util')
const hdkey    = require('ethereumjs-wallet/hdkey')
const wallet   = require('ethereumjs-wallet')


contract('Disberse', async (accounts) => {

  let instanceDisberse

  const hexSortAsc = (a, b) => {
    const aHexInt = parseInt(a, 16)
    const bHexInt = parseInt(b, 16)
    return aHexInt - bHexInt
  } 

  const hexSortDesc = (a, b) => {
    const aHexInt = parseInt(a, 16)
    const bHexInt = parseInt(b, 16)
    return bHexInt - aHexInt
  } 

  const getVerifyArgs = (accountIndex) => {
    var msg = 'The text in your message here'
    var h = web3.utils.keccak256(msg)

    const mnemonic = "quote banner busy inspire junior recall minor toward sausage daring day found"
    const seed = bip39.mnemonicToSeed(mnemonic)
    const hdk = hdkey.fromMasterSeed(seed)
    const addr_node = hdk.derivePath("m/44'/60'/0'/0/" + accountIndex)
    let addr = addr_node.getWallet().getAddressString()
    addr = web3.utils.toChecksumAddress(addr)
    const privKey = addr_node.getWallet().getPrivateKey()

    h = ethUtils.toBuffer(h)
    const sig = ethUtils.ecsign(h, privKey)
    var r = '0x'+sig.r.toString('hex')
    var s = '0x'+sig.s.toString('hex')
    var v = sig.v

    return {addr:addr, h:h, r:r, s:s, v:v}
  }

//  beforeEach('setup contract for each test', async function () {
//    instanceDeployed = await Deployed.new()
//  })


  it("test DisberseTokensContract works", async() => {

    const currencies = ["GBP","USD","EUR","AUD"]

    const sortedAccounts = accounts.sort(hexSortAsc)

    instanceDisberse = await Disberse.new()

    var owner = await instanceDisberse.owner.call()
    assert.equal(owner, accounts[0], " owner is correct ")
//    console.log(owner)
//    console.log(accounts[0])

    var balances = await instanceDisberse.getBalances(accounts[0])
//console.log(balances)
//console.log(balances.length)
    for(var i=0; i<4; i++) {
      console.log(currencies[i] + ": " + balances[i].toNumber())
    } 

    var projectRef = web3.utils.fromAscii('test project name')
    var results = await instanceDisberse.deposit(999, projectRef, 1,{from:accounts[0]})
console.log(results.logs[0].event)
    var results = await instanceDisberse.deposit(2018, projectRef, 0,{from:accounts[0]})
console.log(results.logs[0].event)

    var balance = await instanceDisberse.getBalance(accounts[0], 0)
    console.log("GBP: " + balance.toNumber())

    var balance = await instanceDisberse.getBalance(accounts[0], 1)
    console.log("USD: " + balance.toNumber())

    var results = await instanceDisberse.transfer(accounts[1], 50, projectRef, 0)
console.log(results.logs[0].event)
    var balance = await instanceDisberse.getBalance(accounts[0], 0)
    console.log("after transfer 50 0 to 1")
    console.log("0 GBP: " + balance.toNumber())
    var balance = await instanceDisberse.getBalance(accounts[1], 0)
    console.log("1 GBP: " + balance.toNumber())

    var results = await instanceDisberse.redeem(10, projectRef, 0, {from:accounts[1]})
console.log("redeem 10 user 1: " + results.logs[0].event)
    var balance = await instanceDisberse.getBalance(accounts[1], 0)
    console.log("1 GBP: " + balance.toNumber())

    var balances = await instanceDisberse.getBalances(accounts[1])
    for(var i=0; i<4; i++) {
      console.log("user[1] -> " + currencies[i] + ": " + balances[i].toNumber())
    } 

//    for(i=0;i<sortedAccounts.length;i++) {
//      console.log(sortedAccounts[i] + ": " + parseInt(sortedAccounts[i], 16))
//    }
//    var result = await instanceDisberse.test.call(sortedAccounts)
//    console.log(result)

//editOrg(bytes32 _orgHash, uint _threshold, address[] memory _owners
    var org = "Org Namme Ltd"
    var orgHash = web3.utils.keccak256(org)
    var orgWallet = wallet.generate()
//console.log(orgWallet)
    var orgAddress = orgWallet.getAddressString()
    var result = await instanceDisberse.editOrg(orgHash, orgAddress, 2, sortedAccounts)
//    console.log(result.logs)
//    var result = await instanceDisberse.editOrg(orgHash, 3, accounts)
//    console.log(result)

    var msg = 'The text in your message here'
    var hMsg = web3.utils.keccak256(msg)

    var h = []
    var r = []
    var s = []
    var v = []
    var addresses = []

    var address = accounts[0]
    addresses.push(address)
    var sig = await web3.eth.sign(hMsg, address)
    sig = sig.slice(2,132)
    r.push(`0x${sig.slice(0, 64)}`)
    s.push(`0x${sig.slice(64, 128)}`)
    v.push(Number(web3.utils.toDecimal(sig.slice(128, 130)) + 27))
    h.push(hMsg)

    var address = accounts[1]
    var sig1 = await web3.eth.sign(hMsg, address)
    sig1 = sig1.slice(2,132)
    r.push(`0x${sig1.slice(0, 64)}`)
    s.push(`0x${sig1.slice(64, 128)}`)
    v.push(Number(web3.utils.toDecimal(sig1.slice(128, 130)) + 27))
    h.push(hMsg)

//    console.log(sig)
//    console.log(r)
//    console.log(s)
//    console.log(v)


//console.log(instanceDisberseMultiSigContract.address)
    var result = await instanceDisberse.editOrg(orgHash, orgAddress, 2, sortedAccounts, {from:accounts[0]})

    // address destination, uint value, bytes memory data
    var value = 1000
    var type  = 0
//    var data = web3.utils.fromAscii('testData')
    var result = await instanceDisberse.
    verifyWithPrefixAndSend(orgHash, v, r, s, h, addresses, value, type, projectRef)
//    console.log(result.logs[0].args)

    var balance = await instanceDisberse.getBalance(accounts[0], 0)
    console.log("after deposit 10 GBP user 0 ")
    console.log("0 GBP: " + balance.toNumber())

    var balance = await instanceDisberse.getBalance(accounts[0], 1)
    console.log("balance USD user 0 ")
    console.log("0 USD: " + balance.toNumber())

    var value = 50
    var type  = 1
//    var data = web3.utils.fromAscii('testData')
    var result = await instanceDisberse.
      verifyWithPrefixAndSend(orgHash, v, r, s, h, addresses, value, type, projectRef)
//    console.log(result.logs)
//    console.log(result.logs[1].args)
//    console.log(result.logs[1].args)
//    console.log(result.logs[2].args)
//    console.log(result.logs[3].args)

    var balance = await instanceDisberse.getBalance(accounts[0], 1)
    console.log("balance USD user 0 ")
    console.log("0 USD: " + balance.toNumber())

    // check ethutils addresses with no prefix 
//    console.log(sortedAccounts)

    var sig0 = getVerifyArgs(0)
    var sig1 = getVerifyArgs(1)

    var value = 333
    var curType  = 3
    var v = [sig0.v, sig1.v]
    var r = [sig0.r, sig1.r]
    var s = [sig0.s, sig1.s]
    var h = [sig0.h, sig1.h]
    var addresses = [sig0.addr, sig1.addr]
    var addressTo = accounts[2]
    
    // test deposit txType = 1
    var txType = 1
    var result = await instanceDisberse.
      verifyAndSend(orgHash, v, r, s, h, addresses, value, curType, projectRef, addressTo, txType)
    var balance = await instanceDisberse.getBalance(accounts[0], 3)
    console.log("balance ASD user 0 ")
    console.log("0 ASD: " + balance.toNumber())

    // test transfer txType = 0
    var value = 33
    var txType = 0
    var result = await instanceDisberse.
      verifyAndSend(orgHash, v, r, s, h, addresses, value, curType, projectRef, addressTo, txType)
    var balance = await instanceDisberse.getBalance(accounts[0], 3)
    console.log("balance ASD user 0 ")
    console.log("0 ASD: " + balance.toNumber())

    // test redeem txType = 2
    var value = 10
    var txType = 2
    var result = await instanceDisberse.
      verifyAndSend(orgHash, v, r, s, h, addresses, value, curType, projectRef, addressTo, txType)
    var balance = await instanceDisberse.getBalance(accounts[0], 3)
    console.log("balance ASD user 0 ")
    console.log("0 ASD: " + balance.toNumber())

  })

  it("test sorting of input", async() => {

    instanceDisberse = await Disberse.new()

    const sortedAccounts = accounts.sort(hexSortAsc)

    var org = "Org Name Ltd 2"
    var orgHash = web3.utils.keccak256(org)
    var orgWallet = wallet.generate()
    var orgAddress = orgWallet.getAddressString()
    var result = await instanceDisberse.editOrg(orgHash, orgAddress, 2, sortedAccounts)

    // make random order check address list gets sort correctly
    var myList = [
      accounts[3],
      accounts[7],
      accounts[9],
      accounts[4],
      accounts[1]
    ]
    console.log(myList)
    for(i=0;i<myList.length;i++) {
      console.log(myList[i], parseInt(myList[i], 16))
    }


    const sortedList = myList.sort(hexSortAsc)
    console.log(sortedList)
    for(i=0;i<sortedList.length;i++) {
      console.log(sortedList[i], parseInt(sortedList[i], 16))
    }

    var orgOwner = await instanceDisberse.orgOwner.call(orgHash)
    console.log(orgOwner)

    var orgAddress = await instanceDisberse.orgAddress.call(orgHash)
    console.log(orgAddress)
  })

  it("test function getSingersAndThreshold", async() => {
    // function getSingersAndThreshold(bytes32 _orgHash) public view returns (address[] memory signers, uint threshold)

    instanceDisberse = await Disberse.new()

    const sortedAccounts = accounts.sort(hexSortAsc)

    var org = "Org Name Ltd 3"
    var orgHash = web3.utils.keccak256(org)
    var orgWallet = wallet.generate()
    var orgAddress = orgWallet.getAddressString()
    var result = await instanceDisberse.editOrg(orgHash, orgAddress, 2, sortedAccounts)
    console.log(result.receipt.gasUsed)
    var result = await instanceDisberse.editOrg(orgHash, orgAddress, 2, sortedAccounts)
    console.log(result.receipt.gasUsed)
    console.log(orgHash, orgAddress, 2, sortedAccounts)

    var result = await instanceDisberse.getSingersAndThreshold(orgHash)
//    console.log(result)

/*
    var result = await instanceDisberse.newOrg(orgHash, orgAddress, 2, sortedAccounts)
    console.log(result.logs[0].event)
    console.log(result.logs[0].args)
    console.log(result)
//    console.log(orgHash, orgAddress, 2, sortedAccounts)
*/
  })

})
