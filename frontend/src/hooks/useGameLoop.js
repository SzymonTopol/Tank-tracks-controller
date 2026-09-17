import {useEffect, useRef} from 'react';

export function useGameLoop() {
    const lastTxTime = useRef(0);
    const INTERVAL = 50;

    const motors = useRef({ left: 0, right: 0});

    const requestRef = useRef();

    const updateMotors = (left, right) => {
        motors.current = {left, right};
    }


    useEffect(() =>{
        const tick = (currentTime) => {

            if(currentTime > lastTxTime.current + INTERVAL){
                lastTxTime.current += INTERVAL;
                console.log("Interval joystic data: ", motors.current);
            };
            requestRef.current = requestAnimationFrame(tick);
        }
        requestRef.current = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    return {updateMotors};
}