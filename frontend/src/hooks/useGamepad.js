import { useRef, useCallback } from 'react';
import { DRIVE_MODES, PAD_BUTTONS, PAD_AXES, MAX_POWER } from '../constants';
import { clamp } from '../utils';

export function useGamepad() {
    const driveMode = useRef(DRIVE_MODES.NFS);
    const lastDpadState = useRef({ up: false, down: false });

    const pollGamepad = useCallback(() => {
        const gamepads = navigator.getGamepads();
        const pad = gamepads[0];
        
        if (!pad) return null;

        const dpadUp = pad.buttons[PAD_BUTTONS.DPAD_UP].pressed;
        const dpadDown = pad.buttons[PAD_BUTTONS.DPAD_DOWN].pressed;

        //If i add later other states, this could be changed into an array of states 
        // and cycled between them using dpad
        if (dpadUp && !lastDpadState.current.up) driveMode.current = DRIVE_MODES.NFS;
        if (dpadDown && !lastDpadState.current.down) driveMode.current = DRIVE_MODES.TANK;

        lastDpadState.current = { up: dpadUp, down: dpadDown };

        let leftBase = 0;
        let rightBase = 0;
        let isPadActive = false;

        switch (driveMode.current) {
            case DRIVE_MODES.NFS: {
                const steering = pad.axes[PAD_AXES.LEFT_STICK_X];
                const throttle = pad.buttons[PAD_BUTTONS.TRIGGER_R].value - pad.buttons[PAD_BUTTONS.TRIGGER_L].value;

                const cleanSteering = Math.abs(steering) > 0.1 ? steering : 0;
                const cleanThrottle = Math.abs(throttle) > 0.05 ? throttle : 0;

                if (cleanSteering !== 0 || cleanThrottle !== 0) isPadActive = true;

                leftBase = cleanThrottle;
                rightBase = cleanThrottle;

                if (cleanSteering > 0) {
                    rightBase = cleanThrottle * (1 - cleanSteering);
                } else if (cleanSteering < 0) {
                    leftBase = cleanThrottle * (1 + cleanSteering);
                }
                break;
            }
            case DRIVE_MODES.TANK: {
                const leftDir = pad.buttons[PAD_BUTTONS.BUMPER_L].pressed ? -1.0 : 1.0;
                const rightDir = pad.buttons[PAD_BUTTONS.BUMPER_R].pressed ? -1.0 : 1.0;

                const lt = pad.buttons[PAD_BUTTONS.TRIGGER_L].value;
                const rt = pad.buttons[PAD_BUTTONS.TRIGGER_R].value;

                if (lt > 0.05 || rt > 0.05) isPadActive = true;

                leftBase = lt * leftDir;
                rightBase = rt * rightDir;
                break;
            }
            default:
                break;
        }

        return {
            left: clamp(leftBase * MAX_POWER, -MAX_POWER, MAX_POWER),
            right: clamp(rightBase * MAX_POWER, -MAX_POWER, MAX_POWER),
            isPadActive
        };
    }, []);

    return { pollGamepad };
}