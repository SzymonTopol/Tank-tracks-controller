import {useRef} from 'react';

export function useGameLoop() {
    const lastTxTime = useRef(0);

    const motors = useRef({ left: 0, right: 0});
}