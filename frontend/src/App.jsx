import { Joystick } from 'react-joystick-component'
import { useGameLoop } from './hooks/useGameLoop';
import { useEffect, useState } from 'react';

const constraint = (val, min, max) => Math.round(Math.max(min, Math.min(max,val)));

const RESOLUTION = 8;

function App() {

  const { updateMotors, telemetry, toggleHalt, isHaltedUI, pidParams, updatePidParams } = useGameLoop();

  const handleMove = (event) => {
    console.log("Moved:", event);
    const{x,y} = event;

    let left = constraint((y+x)*(Math.pow(2,RESOLUTION)-1),-(Math.pow(2,RESOLUTION)-1),Math.pow(2,RESOLUTION)-1);
    let right= constraint((y-x)*(Math.pow(2,RESOLUTION)-1),-(Math.pow(2,RESOLUTION)-1),Math.pow(2,RESOLUTION)-1);

    updateMotors(left,right);
  }

  const handleStop = () => {
    console.log("Stopped");
    updateMotors(0,0);
  }

  const [localPid, setLocalPid] = useState({k:0, T_i:0, T_d:0, clamp:0});

  useEffect(()=>{
    setLocalPid(pidParams);
  },[pidParams]);

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

  return (
    <>
      <div>TankUI</div>

      <div style={{ padding: '20px', fontFamily: 'monospace', background: '#f0f0f0', marginBottom: '20px' }}>
        <strong> Telemetry: </strong>
        <pre>{JSON.stringify(telemetry,null,2)}</pre>
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
