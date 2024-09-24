import CanvasLayer from '~/components/CanvasLayer';
import ControlsInfoPopup from '~/components/controlsInfo'

export default function Index() {
  return (
    <>
      <CanvasLayer />

      <ControlsInfoPopup>
      </ControlsInfoPopup>

      <h1 className="fixed top-12 left-12 text-xl text-white">
        Hyperrealistic Indoor Street View <br /> Exercise
      </h1>
    </>
  );
}
