import {
  calculateDeterministicAddress,
  Config,
  BlockchainType,
  BitcoinAddressError
} from './bitcoin-segwit-address-generator';

// Example usage
async function generateSegwitAddress() {
  try {
    const publicKey = Buffer.from(
      '033dcf7a68429b23a0396ca61c1ab243ccbbcc629ff04c59394458d6db5dd2bb15',
      'hex'
    );

    // Configuration
    const config: Config = {
      network: 'mainnet',  // Use 'mainnet' for production
      depositPublicKey: publicKey,
    };

    // Sample chain ID (32 bytes)
    const chainId = Buffer.alloc(32);
    chainId[31] = 1;

    // Bitcoin address (20 bytes)
    const lbtcAddress = Buffer.from('8236a87084f8B84306f72007F36F2618A5634494', 'hex').slice(0, 20);
    
    // Destination address (20 bytes)
    const toAddress = Buffer.from('57f9672ba603251c9c03b36cabdbbca7ca8cfcf4', 'hex').slice(0, 20);
    
    // Referral ID (can be any size <= 256 bytes)
    const referralId = Buffer.from('lombard');
    
    // Nonce (32-bit unsigned integer)
    const nonce = 0;

    // Calculate deterministic segwit address
    const address = calculateDeterministicAddress(
      config,
      chainId,
      lbtcAddress,
      toAddress,
      referralId,
      nonce
    );

    console.log('Generated Segwit Address:', address);
    return address;
  } catch (error) {
    if (error instanceof BitcoinAddressError) {
      console.error('Bitcoin Address Generation Error:', error.message);
    } else {
      console.error('Unexpected Error:', error);
    }
    throw error;
  }
}

// Run the example
generateSegwitAddress().catch(console.error);
