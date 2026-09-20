import { MAX_POWER } from './constants';

export const clamp = (val, min, max) => Math.round(Math.max(min, Math.min(max, val)));

export const calculateDifferentialPower = (x, y) => { //Calculating power to each track based on the x and y place on the cartesian plane (from -1 to 1)
    const safeX = Number.isFinite(x) ? x : 0;
    const safeY = Number.isFinite(y) ? y : 0;

    const cleanX = clamp(safeX, -1.0, 1.0);
    const cleanY = clamp(cleanY, -1.0, 1.0);

    const left = clamp((cleanY + cleanX) * MAX_POWER, -MAX_POWER, MAX_POWER);
    const right = clamp((cleanY - cleanX) * MAX_POWER, -MAX_POWER, MAX_POWER);
    
    return { left, right };
};