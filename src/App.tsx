import * as Cesium from "cesium";
import { useEffect, useRef } from "react";

const WGS84Scales = [
  3.38032714321e-9, 6.76065428641e-9, 1.352130857282e-8, 2.704261714564e-8, 5.408523429128e-8, 1.0817046858257e-7,
  2.1634093716514e-7, 4.3268187433028e-7, 8.6536374866056e-7, 1.73072749732112e-6, 3.46145499464224e-6,
  6.92290998928448e-6, 1.3845819978568952e-5, 2.7691639957137904e-5, 5.538327991427581e-5, 1.1076655982855162e-4,
  2.2153311965710323e-4, 4.4306623931420646e-4, 8.861324786284129e-4, 0.0017722649572568258, 0.0035445299145136517,
  0.007089059829027303
];
const WebmercatorScales = [
  1.6901635716e-9, 3.38032714321e-9, 6.76065428641e-9, 1.352130857282e-8, 2.704261714564e-8, 5.408523429128e-8,
  1.0817046858257e-7, 2.1634093716514e-7, 4.3268187433028e-7, 8.6536374866056e-7, 1.73072749732112e-6,
  3.46145499464224e-6, 6.92290998928448e-6, 1.3845819978568952e-5, 2.7691639957137904e-5, 5.538327991427581e-5,
  1.1076655982855162e-4, 2.2153311965710323e-4, 4.4306623931420646e-4, 8.861324786284129e-4, 0.0017722649572568258,
  0.0035445299145136517, 0.007089059829027303
];

class SupermapRestClient {
  constructor(private url: string) {}

  async getCapabilities() {
    const jsonResource = new Cesium.Resource(this.url + ".json");
    return await jsonResource.fetchJson();
  }

  getTilingSchemeFromCapabilities(capabilities: any) {
    let tilingScheme: Cesium.TilingScheme;
    if (capabilities.prjCoordSys.epsgCode === 4326) {
      const rectangle = new Cesium.Rectangle(
        capabilities.bounds.left,
        capabilities.bounds.bottom,
        capabilities.bounds.right,
        capabilities.bounds.top
      );
      tilingScheme = new Cesium.GeographicTilingScheme({
        numberOfLevelZeroTilesX: 2,
        numberOfLevelZeroTilesY: 1,
        rectangle
      });
    } else if (capabilities.prjCoordSys.epsgCode === 3857) {
      const southwest = new Cesium.Cartesian2(capabilities.bounds.left, capabilities.bounds.bottom);
      const northeast = new Cesium.Cartesian2(capabilities.bounds.right, capabilities.bounds.top);
      tilingScheme = new Cesium.WebMercatorTilingScheme({
        numberOfLevelZeroTilesX: 1,
        numberOfLevelZeroTilesY: 1,
        rectangleSouthwestInMeters: southwest,
        rectangleNortheastInMeters: northeast
      });
    } else {
      throw new Error(`espsgCode ${capabilities.prjCoordSys.epsgCode} is not supported.`);
    }
    return tilingScheme;
  }
}

async function buildSupermapRestImageryProvider(url: string) {
  const client = new SupermapRestClient(url);

  const capabilities = await client.getCapabilities();

  const tilingScheme = client.getTilingSchemeFromCapabilities(capabilities);

  let originX: number;
  let originY: number;
  if (tilingScheme instanceof Cesium.WebMercatorTilingScheme) {
    originX = -20037508.342787;
    originY = 20037508.342787;
  } else {
    originX = -180;
    originY = 90;
  }

  const tileImageResource = new Cesium.Resource(url + "/tileImage.png");
  tileImageResource.appendQueryParameters({
    transparent: true,
    cacheEnabled: true,
    width: 256,
    height: 256,
    redirect: false,
    overlapDisplayed: false,
    origin: `{x:${originX},y:${originY}}`,
    x: "{x}",
    y: "{y}",
    scale: "{scale}"
  });

  return new Cesium.UrlTemplateImageryProvider({
    url: tileImageResource,
    tilingScheme,
    customTags: {
      scale: function (_imageryProvider: Cesium.UrlTemplateImageryProvider, _x: number, _y: number, level: number) {
        if (tilingScheme instanceof Cesium.WebMercatorTilingScheme) {
          return WebmercatorScales[level];
        } else {
          return WGS84Scales[level];
        }
      }
    }
  });
}

function App() {
  const viewerRef = useRef<Cesium.Viewer>();

  useEffect(() => {
    const loadImagery = async () => {
      const url = "Your URL";
      const provider = await buildSupermapRestImageryProvider(url);
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
