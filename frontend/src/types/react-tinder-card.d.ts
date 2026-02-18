declare module 'react-tinder-card' {
  import { ReactNode } from 'react';

  export interface TinderCardProps {
    onSwipe?: (direction: string) => void;
    onCardLeftScreen?: (direction: string) => void;
    preventSwipe?: string[];
    className?: string;
    children?: ReactNode;
  }

  export default function TinderCard(props: TinderCardProps): JSX.Element;
}
