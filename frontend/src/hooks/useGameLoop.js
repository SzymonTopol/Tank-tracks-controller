import {useEffect, useRef, useState} from 'react';

export function useGameLoop() {
    const lastTxTime = useRef(0);
    const INTERVAL = 50;

    const motors = useRef({ left: 0, right: 0});

    const requestRef = useRef();

    const ws = useRef(null);

    const updateMotors = (left, right) => {
        motors.current = {left, right};
    }

    useEffect(() => {
        
        ws.current = new WebSocket('ws://127.0.0.1:8080/ws/tank');

        ws.current.onopen = () => console.log("Websocket connected");
        ws.current.onclose = () => console.log("Websocket disconnected");
        ws.current.onerror = (error) => console.error("Websocket error: ", error);

        return () => {
            if(ws.current){
                ws.current.close();
            }
        };
    },[]);

    useEffect(() =>{
        const tick = (currentTime) => {

            if(currentTime > lastTxTime.current + INTERVAL){
                lastTxTime.current += INTERVAL;
                console.log("Interval joystic data: ", motors.current);

                if(ws.current && ws.current.readyState === WebSocket.OPEN){
                    const payload = JSON.stringify(motors.current);
                    ws.current.send(payload);
                }
            };
            requestRef.current = requestAnimationFrame(tick);
        }
        requestRef.current = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    return {updateMotors};
}