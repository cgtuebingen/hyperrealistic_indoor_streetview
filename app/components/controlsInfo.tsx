import { useState} from 'react'
import '~/styles/controlsInfo.css'

// using https://github.com/shhdharmen/keyboard-css "keyboard-css" for keyboard keys

function ControlsInfoPopup() {
  const [popupStatus, setPopupStatus] = useState(true);

  return popupStatus ? (
    <div className="controlsInfoPopup">
      <link rel="stylesheet" href="https://unpkg.com/keyboard-css@1.2.4/dist/css/main.min.css" />
      <div className="controlsInfo">
        <button 
          className="close-btn" 
          onClick={() => setPopupStatus(false)}>
          got it!
        </button>
        <span className="controls-title">Controls:</span> <br />
        <span className="mouse-icon">🖱️</span> to look around <br />
        <kbd className="kbc-button-sm">esc</kbd> to regain normal mouse controls<br />
        <kbd className="kbc-button-sm">W</kbd><kbd class="kbc-button-sm">A</kbd><kbd class="kbc-button-sm">S</kbd><kbd class="kbc-button-sm">D</kbd> to move around
      </div>
    </div>
  ) : "";
}

export default ControlsInfoPopup