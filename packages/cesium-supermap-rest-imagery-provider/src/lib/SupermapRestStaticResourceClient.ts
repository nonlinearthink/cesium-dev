import * as Cesium from "cesium";

export class SupermapRestStaticResourceClient {
  private _url: string;

  constructor(url: string) {
    this._url = url;
  }

  async getCapabilities() {
    const jsonResource = new Cesium.Resource(this._url + ".json");
    return await jsonResource.fetchJson();
  }

  getTileImageResource(tilingScheme: Cesium.TilingScheme) {
    let originX: number;
    let originY: number;
    if (tilingScheme instanceof Cesium.WebMercatorTilingScheme) {
      originX = -20037508.342787;
      originY = 20037508.342787;
    } else {
      originX = -180;
      originY = 90;
    }

    const tileImageResource = new Cesium.Resource(this._url + "/tileImage.png");
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

    return tileImageResource;
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
