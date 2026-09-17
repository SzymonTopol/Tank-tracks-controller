import { Joystick } from 'react-joystick-component'
import { useGameLoop } from './hooks/useGameLoop';

const constraint = (val, min, max) => Math.round(Math.max(min, Math.min(max,val)));

const RESOLUTION = 8;

function App() {

  const { updateMotors } = useGameLoop();

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

  return (
    <>
      <div>TankUI</div>
      <Joystick
      size={100}
      sticky={false}
      baseColor="#EEEEEE"
      stickColor="#BBBBBB"
      move={handleMove}
      stop={handleStop}
      />
    </>
  )
}

export default App
