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


  it("test sorting of input", async() => {

    instanceDisberse = await Disberse.new()

    const sortedAccounts = accounts.sort(hexSortAsc)

    var org = "Org Name Ltd 2"
    var orgHash = web3.utils.keccak256(org)
    var orgWallet = wallet.generate()
    var orgAddress = orgWallet.getAddressString()
    var result = await instanceDisberse.newOrg(orgHash, orgAddress, 2, sortedAccounts)
/*

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
*/
  })

  it("test function getSingersAndThreshold", async() => {
    // function getSingersAndThreshold(bytes32 _orgHash) public view returns (address[] memory signers, uint threshold)

    instanceDisberse = await Disberse.new()

    const sortedAccounts = accounts.sort(hexSortAsc)

    var org = "Org Name Ltd 3"
    var orgHash = web3.utils.keccak256(org)
    var orgWallet = wallet.generate()
    var orgAddress = orgWallet.getAddressString()
    var result = await instanceDisberse.newOrg(orgHash, orgAddress, 2, [sortedAccounts[0],sortedAccounts[1]])
    console.log(result.receipt.gasUsed)
    var result = await instanceDisberse.getSingersAndThreshold(orgHash)
//    console.log(result[0])
//    console.log(result[1].toNumber())
//    console.log(result)

    var result = await instanceDisberse.updateOrg(orgHash, orgAddress, 2, sortedAccounts)
//    console.log(result.receipt.gasUsed)
    var result = await instanceDisberse.getSingersAndThreshold(orgHash)
//    console.log(result[0])
//    console.log(result[1].toNumber())

    var result = await instanceDisberse.updateOrg(orgHash, orgAddress, 2, [sortedAccounts[3],sortedAccounts[5],sortedAccounts[7]])
//    console.log(result.receipt.gasUsed)
    var result = await instanceDisberse.getSingersAndThreshold(orgHash)
//    console.log(result[0])
//    console.log(result[1].toNumber())
/*
    console.log(orgHash, orgAddress, 2, sortedAccounts)

    var result = await instanceDisberse.getSingersAndThreshold(orgHash)
//    console.log(result)

    var result = await instanceDisberse.newOrg(orgHash, orgAddress, 2, sortedAccounts)
    console.log(result.logs[0].event)
    console.log(result.logs[0].args)
    console.log(result)
//    console.log(orgHash, orgAddress, 2, sortedAccounts)
*/
  })

  it("test function verifyAndSend", async() => {
    const currencies = ["GBP","USD","EUR","AUD"]

    const sortedAccounts = accounts.sort(hexSortAsc)

    instanceDisberse = await Disberse.new()

    var org = "Org Name Ltd 4"
    var orgHash = web3.utils.keccak256(org)
    var orgWallet = wallet.generate()
    var orgAddress = orgWallet.getAddressString()
    var result = await instanceDisberse.newOrg(orgHash, orgAddress, 2, [sortedAccounts[0],sortedAccounts[1]])
    console.log(result.receipt.gasUsed)
    console.log(result.logs[0].args[0].toNumber())
//console.log([sortedAccounts[0],sortedAccounts[1]])

    var result = await instanceDisberse.getSingersAndThreshold(orgHash)
//    console.log(result)
    console.log(result[0])
    console.log(result[1].toNumber())

    var sig0 = getVerifyArgs(0)
    var sig1 = getVerifyArgs(6)

    var value = 999
    var curType  = 3
    var v = [sig0.v, sig1.v]
    var r = [sig0.r, sig1.r]
    var s = [sig0.s, sig1.s]
    var h = [sig0.h, sig1.h]
    var addresses = [sig0.addr, sig1.addr]
    var addressTo = accounts[2]
//console.log(addresses)
    
    // test deposit txType = 1
    var txType = 1
    var projectRef = web3.utils.fromAscii('test project name')
//console.log(v)
    var result = await instanceDisberse.
      verifyAndSend(orgHash, v, r, s, h, addresses, value, curType, projectRef, addressTo, txType)
//    console.log(result.logs)

    var balance = await instanceDisberse.getBalance(accounts[0], 3)
    console.log("balance ASD user 0 ")
    console.log("0 ASD: " + balance.toNumber())
  })

})
