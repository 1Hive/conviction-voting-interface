import React, { useCallback, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { Distribution, GU, useTheme, useViewport } from '@aragon/ui'

import BigNumber from '../lib/bigNumber'
import { stakesPercentages } from '../lib/math-utils'

const DISTRIBUTION_ITEMS_MAX = 5

function displayedStakes(stakes, total) {
  return stakesPercentages(
    stakes.map(({ amount }) => amount),
    {
      total,
      maxIncluded: DISTRIBUTION_ITEMS_MAX,
    }
  ).map(stake => ({
    item: {
      proposalId: stake.index === -1 ? null : stakes[stake.index].proposalId,
      proposalName:
        stake.index === -1 ? 'Others' : stakes[stake.index].proposalName,
    },
    percentage: stake.percentage,
  }))
}

const SupportDistribution = React.memo(function SupportDistribution({
  myStakes,
}) {
  const theme = useTheme()
  const { below } = useViewport()
  const compact = below('large')

  const history = useHistory()
  const handleSelectProposal = useCallback(
    id => {
      history.push(`/proposal/${id}`)
    },
    [history]
  )

  const myActiveTokens = useMemo(() => {
    if (!myStakes) {
      return new BigNumber('0')
    }

    return myStakes.reduce((accumulator, stake) => {
      return accumulator.plus(stake.amount)
    }, new BigNumber('0'))
  }, [myStakes])

  const stakes = useMemo(() => {
    if (!myStakes) {
      return null
    }
    return displayedStakes(myStakes, myActiveTokens)
  }, [myStakes, myActiveTokens])

  if (myActiveTokens.eq(0)) {
    return null
  }

  const colors = [theme.purple, theme.red, theme.positive, theme.yellow]

  return (
    <Distribution
      colors={colors}
      heading="Voting influence distribution"
      items={stakes}
      renderLegendItem={({ item }) => {
        return (
          <DistributionItem
            compact={compact}
            proposalName={item.proposalName}
            proposalId={item.proposalId}
            selectProposal={handleSelectProposal}
          />
        )
      }}
    />
  )
})

const DistributionItem = ({
  compact,
  proposalId,
  proposalName,
  selectProposal,
}) => {
  const theme = useTheme()

  const handleOnClick = useCallback(() => {
    selectProposal(proposalId)
  }, [proposalId, selectProposal])

  return (
    <div
      css={`
        background: ${theme.badge};
        border-radius: 3px;
        padding: ${0.5 * GU}px ${1 * GU}px;
        width: ${compact ? '100%' : `${18 * GU}px`};
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;

        ${proposalId &&
          `cursor: pointer; &:hover {
          background: ${theme.badge.alpha(0.7)}
        }`}
      `}
      onClick={proposalId ? handleOnClick : null}
    >
      {proposalName}
    </div>
  )
}

export default SupportDistribution
