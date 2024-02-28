import * as Cesium from "cesium";
import { useEffect, useRef } from "react";
import { SupermapRestImageryProvider } from "./lib/SupermapRestImageryProvider";

function App() {
  const viewerRef = useRef<Cesium.Viewer>();

  useEffect(() => {
    const loadImagery = async () => {
      const url = "http://192.168.31.4:8090/iserver/services/map-China/rest/maps/China";
      const provider = await SupermapRestImageryProvider.fromUrl(url);
      viewerRef.current?.imageryLayers.addImageryProvider(provider);
    };
    if (!viewerRef.current) {
      viewerRef.current = new Cesium.Viewer("cesiumContainer", { baseLayer: false });
      loadImagery();
    }
  }, []);

  return (
    <>
      <div id="cesiumContainer"></div>
    </>
  );
}

export default App;
