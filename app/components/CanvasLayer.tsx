import {
    PointerLockControls,
    Splat,
    StatsGl
} from '@react-three/drei';
import { FirstPersonControls } from './FirstPersonControls.tsx'

const CanvasLayer = () => {

  const [splatExists, setSplatExists] = useState(false);

  useEffect(() => {
    const checkFileExists = async () => {
      try {
        const response = await fetch('/splat.splat');
        if (response.ok) {
          setSplatExists(true);
        } else {
          setSplatExists(false);
        }
      } catch (error) {
        setSplatExists(false);
      }
    }

    checkFileExists();
  }, []);
  const splatUrl = 'https://antimatter15.com/splat-data/train.splat';
  const { gltfUrl, throttleDpr, maxDpr, throttleSplats, maxSplats } = useControls({
    splatUrl: { label: 'Splat URL', options: splatUrls },
    gltfUrl: { label: "Gltf URL", options: gltfUrls },
    throttleDpr: {
      label: 'Degrade pixel ratio based on perf.',
      value: false,
    },
    maxDpr: { label: 'Max pixel ratio', value:  1 },
    throttleSplats: {
      label: 'Degrade splat count based on perf.',
      value: false,
    },
    maxSplats: { label: 'Max splat count', value: 10000000 },
  }) as any;

  // Performance factor
  const [factor, setFactor] = useState(1);

  // Downsample pixels if perf gets bad
  // const [dpr, setDpr] = useState(maxDpr);
  const dpr = Math.min(maxDpr, Math.round(0.5 + 1.5 * factor));
  const effectiveDpr = throttleDpr ? Math.min(maxDpr, dpr) : maxDpr;

  // Downsample splats if perf gets bad
  const [splats, setSplats] = useState(maxSplats);
  // const splats =
  const effectiveSplats = throttleSplats
    ? Math.min(maxSplats, splats)
    : maxSplats;

  const splatScale = 2.7 as number;
  const splatPos = [12.1 + 0, 19.3, -1.0] as [number, number, number];
  const splatRot = [-0.516, 0.15, 0.1] as [number, number, number];

  return (
    <>
      <Leva oneLineLabels collapsed />
      <div className="absolute w-full h-full">
      <Canvas
        gl={{ antialias: false }}
        dpr={effectiveDpr}
      >
        <PerformanceMonitor
          ms={250}
          iterations={1}
          step={1}
          onIncline={({ factor }) => {
            setFactor(factor);
            setSplats(() =>
              Math.min(
                maxSplats,
                Math.round((0.9 + 0.2 * factor) * effectiveSplats)
              )
            );
          }}
          onDecline={({ factor }) => {
            setFactor(factor);
            setSplats(() =>
              Math.min(
                maxSplats,
                Math.round((0.9 + 0.2 * factor) * effectiveSplats)
              )
            );
          }}
        />

        <StatsGl />
        <ambientLight />
        <pointLight position={[0, 0, 0]} />
        <FirstPersonControls />
        <PointerLockControls />
        {splatExists &&
        <Splat  position={[0, 2, 1]} src="splat.splat" /> }
        {!splatExists &&
        <Splat
        position={[0, 2, 1]}
        src="https://huggingface.co/cakewalk/splat-data/resolve/main/nike.splat" />}
      </Canvas>
      </div>
      <div className="absolute bottom-0 left-0 rounded-lg bg-white shadow border-gray-200 bg-white p-2 m-4">
        {factor < 1.0 && (throttleSplats || throttleDpr) ? (
          <div className="text-red-500">
            Quality degraded to save FPS! You can disable this in settings.
          </div>
        ) : null}
        {factor < 0.5 && !throttleSplats && !throttleDpr ? (
          <div className="text-red-500">
            FPS degraded! You can enable quality tuning in settings.
          </div>
        ) : null}
        <div>Perf factor: {factor.toFixed(2)}</div>
        <div>Applied pixel ratio: {effectiveDpr.toFixed(2)}</div>
        <div>Applied splat count: {(effectiveSplats / 1e6).toFixed(2)}M</div>
      </div>
    </>
  );
};

export default CanvasLayer;
