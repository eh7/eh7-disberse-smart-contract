module.exports = {
  networks: {
    development: {
      host: "localhost",
//      port: 8545,
      port: 9545,
//      mnemonic: 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat',
      network_id: "*" // Match any network id
    },
    "testnet": {
      network_id: 15,
      host: "10.0.0.10",
      port: 8547   // Different than the default below
    }
  }
};
