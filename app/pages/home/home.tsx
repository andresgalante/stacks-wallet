import React, { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Spinner } from '@blockstack/ui';

import { Api } from '@api/api';
import { openTxInExplorer } from '@utils/external-links';

import { RootState } from '@store/index';
import { selectAddress } from '@store/keys';
import { selectActiveNodeApi } from '@store/stacks-node';
import { selectAddressBalance, selectAvailableBalance } from '@store/address';
import { selectRevokeDelegationModalOpen } from '@store/home/home.reducer';
import { selectTransactionsLoading, selectTransactionListFetchError } from '@store/transaction';
import { selectLoadingStacking, selectNextCycleInfo, selectStackerInfo } from '@store/stacking';
import {
  homeActions,
  selectTxModalOpen,
  selectReceiveModalOpen,
  selectHomeCardState,
  HomeCardState,
} from '@store/home';

import { TransactionModal } from '@modals/transaction/transaction-modal';
import { ReceiveStxModal } from '@modals/receive-stx/receive-stx-modal';
import { RevokeDelegationModal } from '@modals/revoke-delegation/revoke-delegation-modal';

import { useDelegationStatus } from '@hooks/use-delegation-status';
import { useTransactionList } from '@hooks/use-transaction-list';

import { StackingCard } from '@components/home/stacking-card';
import { StackingLoading } from '@components/home/stacking-loading';
import { StackingBeginsSoonCard } from '@components/home/stacking-begins-soon-card';
import { StackingError } from '@components/home/stacking-error-card';
import { TransactionListItemMempool } from '@components/home/transaction-list/transaction-list-item-mempool';
import { DelegationCard } from '@components/home/delegation-card';
import {
  TransactionList,
  StackingPromoCard,
  StackingRewardCard,
  TransactionListItem,
  BalanceCard,
} from '@components/home';
import { HomeLayout } from './home-layout';

export const Home: FC = () => {
  const dispatch = useDispatch();

  const { delegated: isDelegated } = useDelegationStatus();

  const {
    address,
    balance,
    spendableBalance,
    loadingTxs,
    txModalOpen,
    txListFetchError,
    receiveModalOpen,
    revokeDelegationModalOpen,
    activeNode,
    stackerInfo,
    stackingCardState,
  } = useSelector((state: RootState) => ({
    address: selectAddress(state),
    spendableBalance: selectAvailableBalance(state),
    balance: selectAddressBalance(state),
    txModalOpen: selectTxModalOpen(state),
    revokeDelegationModalOpen: selectRevokeDelegationModalOpen(state),
    receiveModalOpen: selectReceiveModalOpen(state),
    loadingTxs: selectTransactionsLoading(state),
    txListFetchError: selectTransactionListFetchError(state),
    activeNode: selectActiveNodeApi(state),
    nextCycleInfo: selectNextCycleInfo(state),
    stackerInfo: selectStackerInfo(state),
    stackingLoading: selectLoadingStacking(state),
    stackingCardState: selectHomeCardState(state),
  }));

  const { txs, pendingTxs, txCount, focusedTxIdRef, txDomNodeRefMap } = useTransactionList();

  if (!address) return <Spinner />;

  const transactionList = (
    <>
      <TransactionList
        txCount={txCount}
        loading={loadingTxs}
        node={activeNode}
        error={txListFetchError}
      >
        {pendingTxs.map(pendingTxs => (
          <TransactionListItemMempool
            address={address}
            domNodeMapRef={txDomNodeRefMap}
            activeTxIdRef={focusedTxIdRef}
            key={pendingTxs.tx_id}
            tx={pendingTxs}
            onSelectTx={openTxInExplorer}
          />
        ))}
        {txs.map(tx => (
          <TransactionListItem
            domNodeMapRef={txDomNodeRefMap}
            activeTxIdRef={focusedTxIdRef}
            key={tx.tx_id}
            tx={tx}
            address={address}
            onSelectTx={openTxInExplorer}
          />
        ))}
      </TransactionList>
    </>
  );
  const balanceCard = (
    <BalanceCard
      address={address}
      lockedStx={balance?.locked}
      balance={balance?.balance || null}
      onSelectSend={() => dispatch(homeActions.openTxModal())}
      onSelectReceive={() => dispatch(homeActions.openReceiveModal())}
      onRequestTestnetStx={async ({ stacking }) =>
        new Api(activeNode.url).getFaucetStx(address, stacking)
      }
    />
  );

  const stackingCardMap: Record<HomeCardState, JSX.Element> = {
    [HomeCardState.LoadingResources]: <StackingLoading />,
    [HomeCardState.NotEnoughStx]: <StackingPromoCard />,
    [HomeCardState.EligibleToParticipate]: <StackingPromoCard />,
    [HomeCardState.StackingPendingContactCall]: <StackingLoading />,
    [HomeCardState.StackingPreCycle]: (
      <StackingBeginsSoonCard blocksTillNextCycle={stackerInfo?.blocksUntilStackingCycleBegins} />
    ),
    [HomeCardState.StackingActive]: <StackingCard />,
    [HomeCardState.StackingError]: <StackingError />,
    [HomeCardState.PostStacking]: <></>,
  };

  const stackingRewardCard = (
    <StackingRewardCard lifetime="0.0281 Bitcoin (sample)" lastCycle="0.000383 Bitcoin (sample)" />
  );

  return (
    <>
      {receiveModalOpen && <ReceiveStxModal />}
      {txModalOpen && <TransactionModal balance={spendableBalance || '0'} address={address} />}
      {revokeDelegationModalOpen && <RevokeDelegationModal />}
      <HomeLayout
        transactionList={transactionList}
        balanceCard={balanceCard}
        stackingCard={isDelegated ? <DelegationCard /> : stackingCardMap[stackingCardState]}
        stackingRewardCard={stackingRewardCard}
      />
    </>
  );
};
