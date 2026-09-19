import {useEffect, useRef, useState} from 'react';

export function useGameLoop() {
    const lastTxTime = useRef(0);
    const INTERVAL = 50;

    const motors = useRef({ left: 0, right: 0});

    const requestRef = useRef();

    const ws = useRef(null);

    const [telemetry, setTelemetry] = useState(null);

    const [isHaltedUI, setIsHaltedUI] = useState(false);
    const isHalted = useRef(false);

    const [tankState, setTankState] = useState({k:0, T_i:0, T_d:0, clamp:0});

    const updateMotors = (left, right) => {
        motors.current = {left, right};
    }

    const toggleHalt = async () => {
        isHalted.current = !isHalted.current
        setIsHaltedUI(isHalted.current)

        if(isHalted.current){
            updateMotors(0,0);
        }

        try{
            await fetch('http://127.0.0.1:8080/api/tank/halt', {
                method: 'POST'
            });
            console.log("HALT triggered succesfully");
        }catch(err){
            console.error("Failed to trigger HALT - ", err);
        }
    }

    const updatePidParams = async (newParams) => {
        try{
            await fetch('http://127.0.0.1:8080/api/tank/pid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newParams)
            });
            setTankState(newParams);
            console.log("PID parameters updated ", newParams);
        }catch(err){
            console.log("Failed to update PID - ", err);
        }
    }

    useEffect(() =>{
        const tick = (currentTime) => {

            if(currentTime > lastTxTime.current + INTERVAL){
                lastTxTime.current += INTERVAL;
                // console.log("Interval joystic data: ", motors.current);

                if(!isHalted.current && ws.current && ws.current.readyState === WebSocket.OPEN){
                    const payload = JSON.stringify(motors.current);
                    ws.current.send(payload);
                }
            };
            requestRef.current = requestAnimationFrame(tick);
        }
        requestRef.current = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    useEffect(() => {
        
        ws.current = new WebSocket('ws://127.0.0.1:8080/ws/tank');

        ws.current.onopen = () => console.log("Websocket connected");
        ws.current.onclose = () => console.log("Websocket disconnected");
        ws.current.onerror = (error) => console.error("Websocket error: ", error);

        ws.current.onmessage = (event) => {
            try{
                const data = JSON.parse(event.data);
                setTelemetry(data);
            }catch(err){
                console.error("Failed to parse telemetry - ", err);
            }
        }

        return () => {
            if(ws.current){
                ws.current.close();
            }
        };
    },[]);

    useEffect(() => {
        const fetchTankState = async() => {
            try{
                const response = await fetch('http://127.0.0.1:8080/api/tank/state');
                const data = await response.json();
                setTankState(data);

                isHalted.current = data.isHalt;
                setIsHaltedUI(data.isHalt);
                console.log("Initial Tank state fetched ", data);
            }catch(err){
                console.error("Failed to fetch initial Tank State ", err);
            }
        }
        fetchTankState();
    },[]);

    return {updateMotors, telemetry, toggleHalt, isHaltedUI, tankState, updatePidParams};
}