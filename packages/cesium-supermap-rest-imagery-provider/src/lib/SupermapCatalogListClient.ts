import * as Cesium from "cesium";
import { SupermapRestStaticResourceClient } from "./SupermapRestStaticResourceClient";

export class SupermapCatalogListClient {
  private _url: string;

  constructor(url: string) {
    this._url = url;
  }

  async doRequest() {
    const resource = new Cesium.Resource(this._url + ".json");
    const json = await resource.fetchJson();
    const resourceList: { name: string; client: SupermapRestStaticResourceClient }[] = [];
    for (const item of json) {
      if (item.resourceType === "StaticResource") {
        resourceList.push({
          name: item.name,
          client: new SupermapRestStaticResourceClient(item.path)
        });
      }
    }
    return resourceList;
  }
}
