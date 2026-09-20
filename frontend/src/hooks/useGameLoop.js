import {useEffect, useRef, useState, useCallback } from 'react';

export function useGameLoop() {
    const lastTxTime = useRef(0);
    const INTERVAL = 50;

    const motors = useRef({ left: 0, right: 0});

    const requestRef = useRef();

    const ws = useRef(null);

    const driveMode = useRef(1); //1 for nfs-ish, 2 for Tank (will later do it on an enum)
    const lastDpadState = useRef({up: false, down: false});

    const [telemetry, setTelemetry] = useState(null);

    const [isHaltedUI, setIsHaltedUI] = useState(false);
    const isHalted = useRef(false);

    const [tankState, setTankState] = useState({k:0, T_i:0, T_d:0, clamp:0});

    const RESOLUTION = 8;
    const MAX_POWER = Math.pow(2, RESOLUTION) - 1;
    const constraint = (val, min, max) => Math.round(Math.max(min, Math.min(max, val)));

    const calculateDifferentialPower = (x, y) => {
        const left = constraint((y + x) * MAX_POWER, -MAX_POWER, MAX_POWER);
        const right = constraint((y - x) * MAX_POWER, -MAX_POWER, MAX_POWER);
        return { left, right };
    };

    const updateMotors = useCallback((left, right) => {
        motors.current = {left, right};
    },[]);

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

            const gamepads = navigator.getGamepads();
            const pad = gamepads[0]; //first selected controller

            //parts of this might be moved into a different file to make code more readable
            if (pad) {
                const dpadUp = pad.buttons[12].pressed;
                const dpadDown = pad.buttons[13].pressed;

                //up goes for nfs-ish, down goes for regular tank one
                if (dpadUp && !lastDpadState.current.up) driveMode.current = 1;
                if (dpadDown && !lastDpadState.current.down) driveMode.current = 2;
            
                lastDpadState.current = { up: dpadUp, down: dpadDown}; //this just asks for an enum

                //could be refactored to a switch
                if (driveMode.current === 1) {//nfs
                    
                    const steering = pad.axes[0];
                    const throttle = pad.buttons[7].value - pad.buttons[6].value; //same here, another enum to not have buttons 6/7 etc.
                
                    //avoid accidental drift
                    // const cleanX = Math.abs(x) > 0.1 ? x : 0;
                    const cleanSteering = Math.abs(steering) > 0.1? steering: 0;
                    const cleanThrottle = Math.abs(throttle) > 0.05? throttle : 0;

                    let leftBase = cleanThrottle;
                    let righBase = cleanThrottle;

                    if(cleanSteering > 0){
                        righBase = cleanThrottle * (1-cleanSteering);
                        //if going down from 255 to 0 on the opposite axis proves inadequte - this could be slightly reworked to have full -255 to 255 range (and not 0 to 255)
                    }else if (cleanSteering < 0){
                        leftBase = cleanThrottle * (1 + cleanSteering);
                    }

                    const left = constraint(leftBase*MAX_POWER, -MAX_POWER, MAX_POWER);
                    const right = constraint(righBase * MAX_POWER, -MAX_POWER, MAX_POWER);

                    
                    updateMotors(left,right);
                }else if (driveMode.current === 2) { // tank
                    
                    const leftDir = pad.buttons[4].pressed ? -1.0 : 1.0;
                    const rightDir = pad.buttons[5].pressed ? -1.0 : 1.0;

                    const left = constraint(pad.buttons[6].value * leftDir * MAX_POWER, -MAX_POWER, MAX_POWER);
                    const right = constraint(pad.buttons[7].value * rightDir * MAX_POWER, -MAX_POWER, MAX_POWER);

                    updateMotors(left, right);
                }
            }

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