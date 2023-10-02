import { generateMultisigAddress } from './tribe';

describe('generateMultisigAddress', () => {
  it('should return a string', () => {
    const pubkeys = [
      'npub163z82j5wrx5s7c50hnshlyshdvj5xmu5yfardwckwzrs7ykvjacsfcfkfa',
    ];
    const threshold = 1;
    const result = generateMultisigAddress(pubkeys, threshold);
    expect(result).toBe(
      'tb1p525uvth3tu2pstt92ju0gt6gn268a0kwyd538z3en0wqkwncg74qj3zatc'
    );
  });
});
