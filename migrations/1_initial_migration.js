const TruffleConfig = require('../truffle');

//console.log(TruffleConfig.networks['testnet'])
//console.log(TruffleConfig.networks.development)

const Migrations = artifacts.require("Migrations");

module.exports = function(deployer, network, addresses) {
  const config = TruffleConfig.networks[network];
  if(config.network_id == 15) {
    console.log('>> Unlocking account ' + config.from);
    web3.eth.personal.unlockAccount(config.from, '123', 36000);
    deployer.deploy(Migrations,{gas:4682702});
  } else 
    deployer.deploy(Migrations);
};

