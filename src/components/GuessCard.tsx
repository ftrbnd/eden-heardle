'use client';

import { faCheck, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface GuessCardProps {
  name: string;
  album: string;
  cover: string;
  correctStatus?: 'CORRECT' | 'ALBUM' | 'WRONG' | string;
  showAnimation: boolean;
}

const getIcon = (correctStatus: string) => {
  switch (correctStatus) {
    case 'CORRECT':
      return <FontAwesomeIcon icon={faCheck} style={{ color: '#52fa7c' }} />;
    case 'ALBUM':
      return <FontAwesomeIcon icon={faX} style={{ color: '#ffa257' }} />;
    case 'WRONG':
      return <FontAwesomeIcon icon={faX} style={{ color: '#ff5757' }} />;
    default: // isPending = true
      return <span className="loading loading-ring loading-xs"></span>;
  }
};

const getTooltip = (correctStatus: string) => {
  switch (correctStatus) {
    case 'CORRECT':
      return 'You got it!';
    case 'ALBUM':
      return 'Same album...';
    case 'WRONG':
      return 'Nope!';
  }
};

export function GuessCard({ name, album, cover, correctStatus, showAnimation }: GuessCardProps) {
  return (
    <motion.div className="card card-side bg-base-200 shadow-xl w-full" initial={showAnimation && { y: '100vh' }} animate={showAnimation && { y: 0 }}>
      <figure>
        <Image src={cover} alt={name} height={50} width={50} />
      </figure>
      <div className="flex items-center w-full justify-between px-4">
        <div className="tooltip" data-tip={`From: ${album}`}>
          <h2 className="card-title text-left">{name}</h2>
        </div>
        <div className="tooltip tooltip-left" data-tip={getTooltip(correctStatus ?? '')}>
          {getIcon(correctStatus ?? '')}
        </div>
      </div>
    </motion.div>
  );
}
