import * as Cesium from "cesium";
import { SupermapCatalogListClient } from "./SupermapCatalogListClient";

export class SupermapRestClient {
  private _url: string;

  constructor(url: string) {
    this._url = url;
  }

  async doRequest() {
    const resource = new Cesium.Resource(this._url + ".json");
    const json = await resource.fetchJson();
    const resourceList: { name: string; client: SupermapCatalogListClient }[] = [];
    for (const item of json) {
      if (item.resourceType === "CatalogList") {
        resourceList.push({
          name: item.name,
          client: new SupermapCatalogListClient(item.path)
        });
      }
    }
    return resourceList;
  }
}
