import * as Cesium from "cesium";
import { SupermapRestClient } from "./SupermapRestClient";

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

export class SupermapRestImageryProvider extends Cesium.UrlTemplateImageryProvider {
  private constructor(options: Cesium.UrlTemplateImageryProvider.ConstructorOptions) {
    super(options);
  }

  static async fromUrl(url: string) {
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

    return new SupermapRestImageryProvider({
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
}
