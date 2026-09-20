export const RESOLUTION = 8;
export const MAX_POWER = Math.pow(2, RESOLUTION) - 1;

export const INTERVAL = 50;
export const ALPHA = 0.05; // Battery smoothing

export const DRIVE_MODES = {
    NFS: 'NFS',
    TANK: 'TANK'
};

export const CONTROL_SOURCES = {
    WSAD: 'WSAD',
    GAMEPAD_NFS: 'Gamepad (NFS)',
    GAMEPAD_TANK: 'Gamepad (Tank)',
    JOYSTICK: 'Joystick'
};

// Standard Gamepad API button mappings
export const PAD_BUTTONS = {
    BUMPER_L: 4,
    BUMPER_R: 5,
    TRIGGER_L: 6,
    TRIGGER_R: 7,
    DPAD_UP: 12,
    DPAD_DOWN: 13
};

export const PAD_AXES = {
    LEFT_STICK_X: 0
};