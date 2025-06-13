import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'

export default function useKeysPressed( {
    active,
    //not sure what this is for
    down
} = {}) {

  const keysPressed = reactive([]);
  const keysPressTime = [];
  
  const isPressed = (key) => {
    return keysPressed.map((k) => k.key).includes(key)
  }

  const isOnlyPressed = (keys) => {
    return keys.every((key) => isPressed(key)) && keys.length === keysPressed.length
  }

  function handleKeyDown(e) {
    // if(down.value) e.preventDefault();
    //loop through keysPressed
    if(!isPressed(e.key)) {
      const {key, keyCode} = e;
      keysPressed.push({
        key,
        keyCode
      });
    }
  }  

  function handleKeyUp(e) {
    console.log(e);
    //loop through keysPress
    if(isPressed(e.key)) {
      //remove
      const index = getIndex(e);
      keysPressed.splice(index, 1);
    }
  }

  function getIndex(e) {
    return keysPressed.map((key) => key.keyCode)
      .indexOf(e.keyCode)
  }
  // function isPressed(e) {
  //   return keysPressed.map((key) => key.keyCode)
  //     .includes(e.keyCode)
  // }

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

  })   

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown)
    window.removeEventListener("keyup", handleKeyUp)
  })



  return { keysPressed, isPressed, isOnlyPressed }
}