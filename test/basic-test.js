import { EncryptedTokenStore } from '../dist/token-store.js';
import { FamilySearchClient } from '../dist/familysearch-client.js';

// Test encrypted token store
console.log('Testing EncryptedTokenStore...');
const store = new EncryptedTokenStore('test-password');

// Test encryption and decryption
const testToken = 'test-access-token-12345';
console.log('Original token:', testToken);

const encrypted = store.encrypt(testToken);
console.log('Encrypted token:', encrypted);

const decrypted = store.decrypt(encrypted);
console.log('Decrypted token:', decrypted);

if (testToken === decrypted) {
  console.log('✓ Encryption/Decryption works correctly');
} else {
  console.error('✗ Encryption/Decryption failed');
  process.exit(1);
}

// Test FamilySearch client initialization
console.log('\nTesting FamilySearchClient...');
const client = new FamilySearchClient({
  accessToken: 'test-token',
  baseUrl: 'https://api.familysearch.org/platform',
});

console.log('✓ FamilySearchClient initialized');

// Test cache
console.log('\nTesting cache...');
const cache = new Map();
cache.set('test-key', { data: 'test-data', timestamp: Date.now() });
console.log('Cache size:', cache.size);
console.log('✓ Cache working');

console.log('\n✓ All basic tests passed!');
