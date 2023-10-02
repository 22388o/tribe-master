'use client';

import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import {
  configureChains,
  createConfig,
  WagmiConfig as WagmiConfigWrapper,
} from 'wagmi';
import { arbitrum, mainnet, polygon } from 'wagmi/chains';

const chains = [arbitrum, mainnet, polygon];
const projectId = '882e57d7426200de1ce35607e26a6392';

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  publicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

export default function WagmiConfig({ children }: React.PropsWithChildren) {
  return (
    <>
      <WagmiConfigWrapper config={wagmiConfig}>{children}</WagmiConfigWrapper>

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}
