// codacy-disable-all
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { calculateDeterministicAddress } from './deposit-address';
import { SupportedBlockchains } from './chain-id';
import { Networks } from './bitcoin';

// Component for interacting with the calculateDeterministicAddress function
const DeterministicAddressCalculator = () => {
  const [blockchain, setBlockchain] = useState<SupportedBlockchains>(
    SupportedBlockchains.Ethereum
  );
  const [accountAddress, setAccountAddress] = useState(
    '0x57f9672ba603251c9c03b36cabdbbca7ca8cfcf4'
  );
  const [network, setNetwork] = useState<
    typeof Networks.mainnet | typeof Networks.gastald
  >(Networks.mainnet);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const calculatedResult = await calculateDeterministicAddress(
        blockchain,
        accountAddress,
        network
      );
      setResult(calculatedResult);
    } catch (err: any) {
      setError(
        err.message || 'An error occurred while calculating the address'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Deterministic Address Calculator</h2>

      <div className="card">
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="blockchain" className="form-label">
              Blockchain
            </label>
            <select
              id="blockchain"
              className="form-select"
              value={blockchain}
              onChange={(e) =>
                setBlockchain(
                  e.target.value as SupportedBlockchains
                )
              }
            >
              {Object.values(SupportedBlockchains).map(
                (chain) => (
                  <option key={chain} value={chain}>
                    {chain}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="accountAddress" className="form-label">
              Account Address
            </label>
            <input
              id="accountAddress"
              type="text"
              className="form-control"
              value={accountAddress}
              onChange={(e) => setAccountAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>

          <div className="mb-3">
            <label htmlFor="network" className="form-label">
              Network
            </label>
            <select
              id="network"
              className="form-select"
              value={network}
              onChange={(e) =>
                setNetwork(
                  e.target.value as typeof Networks.mainnet
                )
              }
            >
              <option value={Networks.mainnet}>Mainnet</option>
              <option value={Networks.gastald}>
                Gastald (Testnet)
              </option>
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleCalculate}
            disabled={loading || !accountAddress}
          >
            {loading ? 'Calculating...' : 'Calculate Address'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="card mt-3">
          <div className="card-body">
            <h5 className="card-title">Result</h5>
            <div className="mb-2">
              <strong>Deposit Address:</strong>
              <div className="font-monospace mt-1 p-2 bg-light rounded">
                {result.depositAddress}
              </div>
            </div>
            {result.addresses && result.addresses.length > 0 && (
              <div className="mt-3">
                <strong>All Addresses:</strong>
                <ul className="list-group mt-2">
                  {result.addresses.map(
                    (addr: any, index: number) => (
                      <li
                        key={index}
                        className="list-group-item"
                      >
                        <div className="font-monospace">
                          {addr.address}
                        </div>
                        <small className="text-muted">
                          To Address: {addr.toAddress}{' '}
                          | Token:{' '}
                          {addr.tokenAddress ||
                            'Native'}
                        </small>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const meta: Meta<typeof DeterministicAddressCalculator> = {
  title: 'Deposit Address/Calculate Deterministic Address',
  component: DeterministicAddressCalculator,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DeterministicAddressCalculator>;

export const Default: Story = {};

export const EthereumMainnet: Story = {
  render: () => {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
      const calculate = async () => {
        setLoading(true);
        try {
          const res = await calculateDeterministicAddress(
            SupportedBlockchains.Ethereum,
            '0x57f9672ba603251c9c03b36cabdbbca7ca8cfcf4',
            Networks.mainnet
          );
          setResult(res);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      calculate();
    }, []);

    if (loading) {
      return (
        <div className="container mt-4">
          <div className="spinner-border" />
        </div>
      );
    }

    return (
      <div className="container mt-4">
        <h3>Ethereum Mainnet Example</h3>
        <p>
          <strong>Blockchain:</strong> Ethereum
        </p>
        <p>
          <strong>Address:</strong>{' '}
          0x57f9672ba603251c9c03b36cabdbbca7ca8cfcf4
        </p>
        {result && (
          <div className="alert alert-success mt-3">
            <strong>Deposit Address:</strong>{' '}
            {result.depositAddress}
          </div>
        )}
      </div>
    );
  },
};

export const BaseMainnet: Story = {
  render: () => {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
      const calculate = async () => {
        setLoading(true);
        try {
          const res = await calculateDeterministicAddress(
            SupportedBlockchains.Base,
            '0x0f90793a54e809bf708bd0fbcc63d311e3bb1be1',
            Networks.mainnet
          );
          setResult(res);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      calculate();
    }, []);

    if (loading) {
      return (
        <div className="container mt-4">
          <div className="spinner-border" />
        </div>
      );
    }

    return (
      <div className="container mt-4">
        <h3>Base Mainnet Example</h3>
        <p>
          <strong>Blockchain:</strong> Base
        </p>
        <p>
          <strong>Address:</strong>{' '}
          0x0f90793a54e809bf708bd0fbcc63d311e3bb1be1
        </p>
        {result && (
          <div className="alert alert-success mt-3">
            <strong>Deposit Address:</strong>{' '}
            {result.depositAddress}
          </div>
        )}
      </div>
    );
  },
};

export const SuiMainnet: Story = {
  render: () => {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
      const calculate = async () => {
        setLoading(true);
        try {
          const res = await calculateDeterministicAddress(
            SupportedBlockchains.Sui,
            '0xa51d5c52371626bb6894ce9b599c935f8dea92ca34668f2da7148df2458640b8',
            Networks.mainnet
          );
          setResult(res);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      calculate();
    }, []);

    if (loading) {
      return (
        <div className="container mt-4">
          <div className="spinner-border" />
        </div>
      );
    }

    return (
      <div className="container mt-4">
        <h3>Sui Mainnet Example</h3>
        <p>
          <strong>Blockchain:</strong> Sui
        </p>
        <p>
          <strong>Address:</strong>{' '}
          0xa51d5c52371626bb6894ce9b599c935f8dea92ca34668f2da7148df2458640b8
        </p>
        {result && (
          <div className="alert alert-success mt-3">
            <strong>Deposit Address:</strong>{' '}
            {result.depositAddress}
          </div>
        )}
      </div>
    );
  },
};
