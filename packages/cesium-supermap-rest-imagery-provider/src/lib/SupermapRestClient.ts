import * as Cesium from "cesium";

export class SupermapRestClient {
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
