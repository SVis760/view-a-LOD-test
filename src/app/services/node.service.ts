import { Injectable } from '@angular/core';
import { NodeModel, NodeObj, nodeObjValuesAsArray } from '../models/node.model';
import { replacePrefixes, truncate } from '../helpers/util.helper';
import { ThingWithLabelModel } from '../models/thing-with-label.model';
import { Settings } from '../config/settings';

@Injectable({
  providedIn: 'root',
})
export class NodeService {
  constructor() {}

  getObj(
    node: NodeModel | undefined,
    preds: string[],
    replacePrefix = false,
  ): NodeObj {
    if (!node) {
      return { value: '' };
    }

    for (const pred of preds) {
      const nodeObj: NodeObj = node?.[pred];
      const noObjFoundForThisPred =
        !nodeObj || !nodeObj.value || nodeObj.value.length === 0;
      if (noObjFoundForThisPred) {
        continue;
      }

      if (replacePrefix) {
        const valuePrefixesReplaces: string[] | string = Array.isArray(
          nodeObj.value,
        )
          ? nodeObj.value.map((o) => replacePrefixes(o))
          : replacePrefixes(nodeObj.value);
        return { value: valuePrefixesReplaces, direction: nodeObj.direction };
      }

      return nodeObj;
    }

    return { value: '' };
  }

  getObjAsArray(
    node: NodeModel | undefined,
    preds: string[],
    replacePrefix = false,
  ) {
    return nodeObjValuesAsArray(this.getObj(node, preds, replacePrefix));
  }

  getTitle(node: ThingWithLabelModel, maxCharacters?: number): string {
    const nodeTitle = node.label;
    if (nodeTitle) {
      const shouldTruncate = maxCharacters !== undefined;
      return shouldTruncate ? truncate(nodeTitle, maxCharacters) : nodeTitle;
    }
    return replacePrefixes(node['@id']);
  }

  getViewsBasedOnTypes(node: NodeModel): string[] {
    const nodeTypes = this.getObjAsArray(node, Settings.predicates.type);
    const views: string[] = [];
    for (const [viewType, view] of Object.entries(Settings.views)) {
      if (nodeTypes.includes(viewType)) {
        views.push(view);
      }
    }

    return views;
  }

  getId(node: NodeModel) {
    const id = node['@id'].value;
    return Array.isArray(id) ? id.join(' ') : id;
  }
}
