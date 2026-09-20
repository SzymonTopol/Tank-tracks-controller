import { useEffect, useRef, useState, useCallback } from 'react';
import { useGamepad } from './useGamepad';
import { CONTROL_SOURCES, INTERVAL, ALPHA, DRIVE_MODES } from '../constants';

export function useGameLoop() {
    const lastTxTime = useRef(0);
    const motors = useRef({ left: 0, right: 0 });
    const requestRef = useRef();
    const ws = useRef(null);

    const { pollGamepad } = useGamepad();

    const [telemetry, setTelemetry] = useState(null);
    const [telemetryHistory, setTelemetryHistory] = useState([]);
    
    const [isHaltedUI, setIsHaltedUI] = useState(false);
    const isHalted = useRef(false);
    
    const [tankState, setTankState] = useState({ k: 0, T_i: 0, T_d: 0, clamp: 0 });
    const smoothedBattery = useRef(null);
    
    const [activeControl, setActiveControl] = useState(CONTROL_SOURCES.WSAD);
    const activeDevice = useRef(CONTROL_SOURCES.WSAD);

    const updateMotors = useCallback((left, right, source = CONTROL_SOURCES.WSAD) => {
        motors.current = { left, right };

        if (activeDevice.current !== source) {
            activeDevice.current = source;
            setActiveControl(source);
        }
    }, []);

    const toggleHalt = async () => { //used as a toggle function
        isHalted.current = !isHalted.current;
        setIsHaltedUI(isHalted.current);

        if (isHalted.current) {
            updateMotors(0, 0, activeDevice.current);
        }

        try {
            await fetch('http://127.0.0.1:8080/api/tank/halt', { method: 'POST' });
        } catch (err) {
            console.error("Failed to trigger HALT - ", err);
        }
    }

    const updatePidParams = async (newParams) => {
        try {
            await fetch('http://127.0.0.1:8080/api/tank/pid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newParams)
            });
            setTankState(newParams);
        } catch (err) {
            console.error("Failed to update PID - ", err);
        }
    }

    // Tick Loop
    useEffect(() => {
        const tick = (currentTime) => {
            const padData = pollGamepad();
            
            if (padData) {
                if (padData.isPadActive) {
                    const modeMap = {
                        [DRIVE_MODES.NFS]: CONTROL_SOURCES.GAMEPAD_NFS,
                        [DRIVE_MODES.TANK]: CONTROL_SOURCES.GAMEPAD_TANK
                    };
                    const padSource = modeMap[padData.activeDriveMode] || CONTROL_SOURCES.GAMEPAD_NFS;
                    
                    updateMotors(padData.left, padData.right, padSource);
                    
                } else if (
                    activeDevice.current === CONTROL_SOURCES.GAMEPAD_NFS || 
                    activeDevice.current === CONTROL_SOURCES.GAMEPAD_TANK
                ) {
                    updateMotors(0, 0, activeDevice.current);
                }
            }

            if (currentTime > lastTxTime.current + INTERVAL) {
                lastTxTime.current += INTERVAL;
                                
                if (!isHalted.current && ws.current?.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify(motors.current));
                }
            }
            requestRef.current = requestAnimationFrame(tick);
        }
        requestRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(requestRef.current);
    }, [pollGamepad, updateMotors]);

    // WebSocket Setup
    useEffect(() => {
        ws.current = new WebSocket('ws://127.0.0.1:8080/ws/tank');
        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const rawBat = data.batteryPercentage;

                smoothedBattery.current = smoothedBattery.current === null 
                    ? rawBat 
                    : (ALPHA * rawBat) + ((1 - ALPHA) * smoothedBattery.current);

                data.cleanBattery = smoothedBattery.current.toFixed(1);

                setTelemetry(data);
                setTelemetryHistory(prev => [...prev, data].slice(-60));
            } catch (err) {
                console.error("Failed to parse telemetry - ", err);
            }
        }
        return () => ws.current?.close();
    }, []);

    // Initial State Fetch
    useEffect(() => {
        const fetchTankState = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8080/api/tank/state');
                const data = await response.json();
                setTankState(data);
                isHalted.current = data.isHalt;
                setIsHaltedUI(data.isHalt);
            } catch (err) {
                console.error("Failed to fetch initial Tank State ", err);
            }
        }
        fetchTankState();
    }, []);

    return { updateMotors, telemetry, telemetryHistory, toggleHalt, isHaltedUI, tankState, updatePidParams, activeControl };
}