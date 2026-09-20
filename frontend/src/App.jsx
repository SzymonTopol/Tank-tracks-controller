import { useEffect, useState, useDeferredValue } from 'react';
import { Joystick } from 'react-joystick-component';
import { useGameLoop } from './hooks/useGameLoop';
import { LeftPowerChart, RightPowerChart, LeftPIDChart, RightPIDChart } from './TelemetryCharts';
import { calculateDifferentialPower } from './utils';
import { CONTROL_SOURCES } from './constants';
import './App.css';

const PidControlCol = ({ label, propName, max, step, localPid, updateValue, applyPid, handleKeyDown }) => (
  <div className="pid-col">
    <span className="pid-label">{label}</span>
    <input 
        type="range" min="0" max={max} step={step}
        value={localPid[propName]}
        onChange={(e) => updateValue(propName, e.target.value)}
        onMouseUp={applyPid}
        className="pid-slider"
        orient="vertical" 
    />
    <input 
        type="number" step={step} value={localPid[propName]} 
        onChange={(e) => updateValue(propName, e.target.value)}
        onBlur={applyPid} onKeyDown={handleKeyDown}
        className="pid-input"
    />
  </div>
);

function App() {
  const { updateMotors, telemetry, telemetryHistory, toggleHalt, isHaltedUI, tankState, updatePidParams, activeControl } = useGameLoop();
  const deferredHistory = useDeferredValue(telemetryHistory);
  const [localPid, setLocalPid] = useState({k:0, T_i:0, T_d:0, clamp:0});

  useEffect(() => {
    document.title = "RC Tank Controller";
  }, []);

  useEffect(() => {
    setLocalPid(tankState);
  }, [tankState]);

  const handleMove = ({ x, y }) => {
    const { left, right } = calculateDifferentialPower(x, y);
    updateMotors(left, right, CONTROL_SOURCES.JOYSTICK);
  };

  const handleStop = () => updateMotors(0, 0, CONTROL_SOURCES.JOYSTICK);

  const applyPid = () => {
    updatePidParams({
      k: Number(localPid.k),
      T_i: Number(localPid.T_i),
      T_d: Number(localPid.T_d),
      clamp: Number(localPid.clamp)
    });
  };

  const updatePidValue = (propName, value) => {
    setLocalPid(prev => ({ ...prev, [propName]: value }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      applyPid();
      e.target.blur();
    }
  };

  useEffect(() => {
    const keys = { w: false, a: false, s: false, d: false };

    const handleKeyEvent = (e, isPressed) => {
      const key = e.key.toLowerCase();
      if (!keys.hasOwnProperty(key)) return;
      
      keys[key] = isPressed;

      const y = (keys.w ? 1 : 0) - (keys.s ? 1 : 0);
      const x = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
      const { left, right } = calculateDifferentialPower(x, y);

      updateMotors(left, right, CONTROL_SOURCES.WSAD);
    };

    const handleKeyDown = (e) => handleKeyEvent(e, true);
    const handleKeyUp = (e) => handleKeyEvent(e, false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [updateMotors]);

  return (
    <div className="app-container">
      <div className="dashboard-grid">

        {/* --- LEFT COLUMN --- */}
        <div className="column-side">
            <h1 className="app-title">Tank<span>UI</span></h1>
            
            <div className="side-bottom-content">
                {deferredHistory.length > 0 ? (
                    <>
                        <LeftPowerChart data={deferredHistory} />
                        <LeftPIDChart data={deferredHistory} />
                    </>
                ) : <div className="status-text">Waiting for telemetry...</div>}
            </div>
        </div>

        {/* --- CENTER COLUMN (Controls) --- */}
        <div className="column-center">
            
            <div className="mode-indicator">
                CURRENT MODE: {activeControl}
            </div>

            <div className="joystick-container">
                <Joystick
                    size={200}
                    sticky={false}
                    baseColor="#111111"
                    stickColor={isHaltedUI ? "#552222" : "#333333"}
                    move={handleMove}
                    stop={handleStop}
                />
            </div>
            
            <div className="center-bottom-content">
                <button 
                    onClick={toggleHalt}
                    className={`btn-handbrake ${isHaltedUI ? 'engaged' : 'released'}`}
                >
                    {isHaltedUI ? 'Handbrake Engaged' : 'Handbrake'}
                </button>

                <div className="panel panel-padded">
                    <h3 className="pid-header">PID Parameters</h3>
                    
                    <div className="pid-controls-wrapper">
                        <PidControlCol label="K" propName="k" max="10" step="0.01" localPid={localPid} updateValue={updatePidValue} applyPid={applyPid} handleKeyDown={handleKeyDown}/>
                        <PidControlCol label="Ti" propName="T_i" max="50" step="0.01" localPid={localPid} updateValue={updatePidValue} applyPid={applyPid} handleKeyDown={handleKeyDown}/>
                        <PidControlCol label="Td" propName="T_d" max="10" step="0.01" localPid={localPid} updateValue={updatePidValue} applyPid={applyPid} handleKeyDown={handleKeyDown}/>
                        <PidControlCol label="Clamp" propName="clamp" max="10000" step="1" localPid={localPid} updateValue={updatePidValue} applyPid={applyPid} handleKeyDown={handleKeyDown}/>
                    </div>
                </div>
            </div>
        </div>

        {/* --- RIGHT COLUMN --- */}
        <div className="column-side">
            
            <div className="battery-wrapper">
                <div className={`battery-indicator ${telemetry?.cleanBattery > 20 ? 'battery-good' : 'battery-low'}`}>
                    <span className="battery-label">BATTERY</span> 
                    {telemetry ? telemetry.cleanBattery : '--.-'}%
                </div>
            </div>

            <div className="side-bottom-content">
                {deferredHistory.length > 0 ? (
                    <>
                        <RightPowerChart data={deferredHistory} />
                        <RightPIDChart data={deferredHistory} />
                    </>
                ) : null}
            </div>
        </div>

      </div>
    </div>
  );
}

export default App;