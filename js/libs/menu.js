"use strict";

import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";

const NODE_NAME = "shinich39.pkg39.menu";
const MENU_NAME = "Send to pkg39";

function getPathFromURL(url) {
  let filename = url.searchParams.get("filename");
  if (filename && filename !== "") {
    filename = "/" + filename;
  }
  let subdir = url.searchParams.get("subfolder");
  if (subdir && subdir !== "") {
    subdir = "/" + subdir;
  }
  let dir = url.searchParams.get("type");
  if (dir && dir !== "") {
    dir = "/" + dir;
  }
  return `ComfyUI${dir}${subdir}${filename}`;
}

async function saveImage(filePath) {
  const response = await api.fetchApi(`/shinich39/pkg39/save_image`, {
    method: "POST",
    headers: { "Content-Type": "application/json", },
    body: JSON.stringify({ path: filePath }),
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  const data = await response.json();

  return data;
}

async function sendTopkg39() {
  if (this.imgs) {
    // If this node has images then we add an open in new tab item
    let img;
    if (this.imageIndex != null) {
      // An image is selected so select that
      img = this.imgs[this.imageIndex];
    } else if (this.overIndex != null) {
      // No image is selected but one is hovered
      img = this.imgs[this.overIndex];
    }
    if (img) {
      const url = new URL(img.src);
      const filePath = getPathFromURL(url);
      await saveImage(filePath);
    }
  }
}

app.registerExtension({
	name: NODE_NAME,
	async beforeRegisterNodeDef(nodeType, nodeData, app) {

    // add "Send to pkg39" to preview image menu
		const origGetExtraMenuOptions = nodeType.prototype.getExtraMenuOptions;
		nodeType.prototype.getExtraMenuOptions = function (_, options) {
			const r = origGetExtraMenuOptions ? origGetExtraMenuOptions.apply(this, arguments) : undefined;
			let optionIndex = options.findIndex((o) => o?.content === "Save Image");
      if (optionIndex > -1) {
        options.splice(
          optionIndex + 1,
          0,
          {
            content: MENU_NAME,
            callback: () => {
              sendTopkg39.apply(this);
            },
          },
        );
      }
      return r;
		};

	},
});