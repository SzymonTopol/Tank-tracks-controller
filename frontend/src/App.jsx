import { Joystick } from 'react-joystick-component'
import { useGameLoop } from './hooks/useGameLoop';
import { useEffect, useState, useDeferredValue } from 'react';
import { TelemetryCharts } from './TelemetryCharts';

const constraint = (val, min, max) => Math.round(Math.max(min, Math.min(max,val)));

const RESOLUTION = 8;
const MAX_POWER = Math.pow(2,RESOLUTION)-1;

// returns left and right motor power values based on given x and y values on a cartesian plane (with borders from -1 to 1)
const calculateDifferencialPower = (x,y) => {
  let left = constraint((y+x)*MAX_POWER,-MAX_POWER,MAX_POWER);
  let right= constraint((y-x)*MAX_POWER,-MAX_POWER,MAX_POWER);

  return {left,right};
}

function App() {

  const { updateMotors, telemetry, telemetryHistory ,toggleHalt, isHaltedUI, tankState, updatePidParams } = useGameLoop();

 const deferredHistory = useDeferredValue(telemetryHistory);

  const handleMove = (event) => {
    console.log("Moved:", event);
    const{x,y} = event;

    const {left, right} = calculateDifferencialPower(x,y);

    updateMotors(left,right);
  }

  const handleStop = () => {
    console.log("Stopped");
    updateMotors(0,0);
  }

  const [localPid, setLocalPid] = useState({k:0, T_i:0, T_d:0, clamp:0});

  useEffect(()=>{
    setLocalPid(tankState);
  },[tankState]);

  const applyPid = () => {
    updatePidParams({
      k: Number(localPid.k),
      T_i: Number(localPid.T_i),
      T_d: Number(localPid.T_d),
      clamp: Number(localPid.clamp)
    });
  }

  const handleKeyDown = (e) => {
    if(e.key === 'Enter') {
      applyPid();
      e.target.blur();
    }
  };

  useEffect(() => {
    const keys = { w: false, a:false, s:false, d:false};

    const handleKeyEvent = (e, isPressed) => {
      const key = e.key.toLowerCase();

      if(!keys.hasOwnProperty(key)) return;

      keys[key] = isPressed;

      const y = (keys.w ? 1 : 0) - (keys.s ? 1:0);
      const x = (keys.d ? 1 : 0) - (keys.a ? 1:0);

      const {left, right} = calculateDifferencialPower(x,y);

      updateMotors(left,right);
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
    <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <h1 style={{ margin: 0 }}>TankUI</h1>
    
      <div style={{ 
        padding: '10px 20px', 
        background: '#222', 
        color: (telemetry?.cleanBattery > 20) ? '#0f0' : '#f00', 
        fontFamily: 'monospace', 
        fontSize: '24px', 
        fontWeight: 'bold',
        borderRadius: '8px',
        border: '2px solid #444'
        }}>
          BATTERY: {telemetry ? telemetry.cleanBattery : '--.-'}%
      </div>
    </div>

      <div style={{ padding: '20px', background: '#f0f0f0', marginBottom: '20px', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>Telemetry History</h3>
        {/* 3. Pass the deferred array instead of the raw array */}
        {deferredHistory.length > 0 && <TelemetryCharts data={deferredHistory} />}
      </div>


      <Joystick
      size={100}
      sticky={false}
      baseColor="#EEEEEE"
      stickColor="#BBBBBB"
      move={handleMove}
      stop={handleStop}
      />

      <button 
      onClick={toggleHalt}
      style={{
        padding: '15px 30px',
        fontSize: '20px',
        fontWeight: 'bold',
        backgroundColor: isHaltedUI ? '#ff4444' : '#cccccc',
        color: isHaltedUI ? 'white' : 'black',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        marginBottom: '20px'
      }}
    >
    {isHaltedUI ? 'HANDBRAKE ENGAGED' : 'HALT'}
    </button>

    <div style={{ padding: '20px', background: '#e8e8e8', marginBottom: '20px', borderRadius: '8px' }}>
          <h3>PID Parameters</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
              <label>
                  K: <input 
                        type="number" 
                        step="0.01" 
                        value={localPid.k} 
                        onChange={(e) => setLocalPid({ ...localPid, k: e.target.value })}
                        onBlur={applyPid}
                        onKeyDown={handleKeyDown}
                      />
              </label>
              <label>
                  Ti: <input 
                        type="number" 
                        step="0.01" 
                        value={localPid.T_i} 
                        onChange={(e) => setLocalPid({ ...localPid, T_i: e.target.value })}
                        onBlur={applyPid}
                        onKeyDown={handleKeyDown}
                      />
              </label>
              <label>
                  Td: <input 
                        type="number" 
                        step="0.01" 
                        value={localPid.T_d} 
                        onChange={(e) => setLocalPid({ ...localPid, T_d: e.target.value })}
                        onBlur={applyPid}
                        onKeyDown={handleKeyDown}
                      />
              </label>
              <label>
                  Clamp: <input 
                        type="number" 
                        step="1" 
                        value={localPid.clamp} 
                        onChange={(e) => setLocalPid({ ...localPid, clamp: e.target.value })}
                        onBlur={applyPid}
                        onKeyDown={handleKeyDown}
                      />
              </label>
          </div>
      </div>
    </>
  )
}

export default App
