/**
 * shared/headers — 통합 헤더 exports
 */

import { LightHeader } from './v1/HeaderP1_LightHeader';
import { PillHeader }  from './v1/HeaderP2_PillHeader';

export { LightHeader as HeaderP1 };
export { PillHeader  as HeaderP2 };

export type HeaderVariant = 'p1' | 'p2';

export interface HeaderProps {
  variant: HeaderVariant;
}

export function Header({ variant }: HeaderProps) {
  if (variant === 'p1') return <LightHeader />;
  return <PillHeader />;
}

