import * as Cesium from "cesium";

export class SupermapRestClient {
  private catalogListUrl: string;
  private staticResourceUrl: string | undefined;
  private mapUrl: string | undefined;

  constructor(catalogListUrl: string) {
    this.catalogListUrl = catalogListUrl;
  }

  setStaticResourceUrl(url: string) {
    this.staticResourceUrl = url;
  }

  setMapUrl(url: string) {
    this.mapUrl = url;
  }

  async *doRequest() {
    const catalogList = await SupermapRestClient.getCatalogList(this.catalogListUrl);
    yield catalogList;
    if (this.staticResourceUrl) {
      const staticResourceList = await SupermapRestClient.getStaticResourceList(this.staticResourceUrl);
      yield staticResourceList;
      if (this.mapUrl) {
        const capabilities = await SupermapRestClient.getCapabilities(this.mapUrl);
        yield capabilities;
      }
    }
  }

  static async getCatalogList(url: string) {
    const jsonResource = new Cesium.Resource(url + ".json");
    const json = await jsonResource.fetchJson();
    const list: { name: string; path: string }[] = [];
    for (const item of json) {
      if (item.resourceType === "CatalogList") {
        list.push({
          name: item.name,
          path: item.path
        });
      }
    }
    return list;
  }

  static async getStaticResourceList(url: string) {
    const jsonResource = new Cesium.Resource(url + ".json");
    const json = await jsonResource.fetchJson();
    const list: { name: string; path: string }[] = [];
    for (const item of json) {
      if (item.resourceType === "StaticResource") {
        list.push({
          name: item.name,
          path: item.path
        });
      }
    }
    return list;
  }

  static async getCapabilities(url: string) {
    const jsonResource = new Cesium.Resource(url + ".json");
    return await jsonResource.fetchJson();
  }

  static getTilingSchemeFromCapabilities(capabilities: any) {
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
