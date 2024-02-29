import * as Cesium from "cesium";
import { useEffect, useRef } from "react";
import { SupermapRestImageryProvider } from "./lib/SupermapRestImageryProvider";
import { SupermapRestClient } from "./lib/SupermapRestClient";
import { SupermapCatalogListClient } from "./lib/SupermapCatalogListClient";
import { SupermapRestStaticResourceClient } from "./lib/SupermapRestStaticResourceClient";

function App() {
  const viewerRef = useRef<Cesium.Viewer>();

  useEffect(() => {
    const loadImagery = async () => {
      const selectId = 0;
      const url = "http://192.168.31.4:8090/iserver/services/map-China/rest";

      const client = new SupermapRestClient(url);
      const catalogList = await client.doRequest();

      const catalogListClient: SupermapCatalogListClient = catalogList[selectId].client;
      const staticResourceList = await catalogListClient.doRequest();

      const staticResourceClient: SupermapRestStaticResourceClient = staticResourceList[selectId].client;
      const provider = await SupermapRestImageryProvider.fromSupermapRestStaticResourceClient(staticResourceClient);
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
