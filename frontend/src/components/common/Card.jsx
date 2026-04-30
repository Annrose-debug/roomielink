import React from 'react';

/**
 * Card — RoomieLink's surface container.
 *
 * Props:
 *  hover   → adds lift + shadow on hover (great for clickable cards)
 *  glass   → frosted-glass look (use over coloured backgrounds)
 *  onClick → makes the card clickable
 *  accent  → 'coral' | 'violet' | 'mint' | 'yellow' — adds a top-border accent
 */
const Card = ({
  children,
  className = '',
  padding   = 'p-6',
  hover     = false,
  glass     = false,
  onClick,
  accent,   // 'coral' | 'violet' | 'mint' | 'yellow'
}) => {

  const accentStyles = {
    coral:  'border-t-4 border-coral-500',
    violet: 'border-t-4 border-violet-500',
    mint:   'border-t-4 border-mint-400',
    yellow: 'border-t-4 border-yellow-400',
  };

  const base = glass
    ? 'bg-white/80 backdrop-blur-md border border-white/60'
    : 'bg-white border border-violet-50';

  return (
    <div
      onClick={onClick}
      className={[
        base,
        'rounded-2xl shadow-card',
        padding,
        hover
          ? 'cursor-pointer transition-all duration-200 hover:shadow-card-lg hover:-translate-y-1'
          : '',
        onClick && !hover
          ? 'cursor-pointer transition-all duration-200 hover:shadow-card-lg'
          : '',
        accent ? accentStyles[accent] : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
};

export default Card;
