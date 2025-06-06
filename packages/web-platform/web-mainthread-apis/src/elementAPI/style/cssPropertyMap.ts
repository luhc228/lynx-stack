// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
const cacheForCamelize: Record<string, string> = {};

export function camelize(str: string): string {
  if (cacheForCamelize[str]) {
    return cacheForCamelize[str];
  }

  const result = (str + '').replace(/-\D/g, function(match) {
    return match.charAt(1).toUpperCase();
  });
  cacheForCamelize[str] = result;
  return result;
}

let index = 1;
const cssPropertyMap: Record<
  number,
  { name: string; dashName: string; defaultValue: string }
> = {};
const cssPropertyReverseMap: Record<string, number> = {};
const V = (name: string, defaultValue: string) => {
  const k = index++;
  cssPropertyMap[k] = { name: camelize(name), dashName: name, defaultValue };
  cssPropertyReverseMap[name] = k;
};

V('top', 'auto');
V('left', 'auto');
V('right', 'auto');
V('bottom', 'auto');
V('position', 'relative');
V('box-sizing', 'auto');
V('background-color', 'transparent');
V('border-left-color', 'black');
V('border-right-color', 'black');
V('border-top-color', 'black');
V('border-bottom-color', 'black');
V('border-radius', '0px');
V('border-top-left-radius', '0px');
V('border-bottom-left-radius', '0px');
V('border-top-right-radius', '0px');
V('border-bottom-right-radius', '0px');
V('border-width', '0px');
V('border-left-width', '0px');
V('border-right-width', '0px');
V('border-top-width', '0px');
V('border-bottom-width', '0px');
V('color', 'black');
V('opacity', '1');
V('display', 'auto');
V('overflow', 'hidden');
V('height', 'auto');
V('width', 'auto');
V('max-width', 'auto');
V('min-width', 'auto');
V('max-height', 'auto');
V('min-height', 'auto');
V('padding', '0px');
V('padding-left', '0px');
V('padding-right', '0px');
V('padding-top', '0px');
V('padding-bottom', '0px');
V('margin', '0px');
V('margin-left', '0px');
V('margin-right', '0px');
V('margin-top', '0px');
V('margin-bottom', '0px');
V('white-space', 'normal');
V('letter-spacing', '0px');
V('text-align', 'start');
V('line-height', '');
V('text-overflow', 'clip');
V('font-size', 'medium');
V('font-weight', 'normal');
V('flex', '0');
V('flex-grow', '0');
V('flex-shrink', '1');
V('flex-basis', 'auto');
V('flex-direction', 'row');
V('flex-wrap', 'nowrap');
V('align-items', 'stretch');
V('align-self', 'stretch');
V('align-content', 'stretch');
V('justify-content', 'stretch');
V('background', 'transparent, transparent');
V('border-color', 'black');
V('font-family', '');
V('font-style', 'normal');
V('transform', '');
V('animation', '');
V('animation-name', '');
V('animation-duration', '');
V('animation-timing-function', 'linear');
V('animation-delay', '0s');
V('animation-iteration-count', '1');
V('animation-direction', 'normal');
V('animation-fill-mode', 'none');
V('animation-play-state', 'running');
V('line-spacing', '0px');
V('border-style', 'solid');
V('order', '0');
V('box-shadow', '');
V('transform-origin', '');
V('linear-orientation', 'vertical');
V('linear-weight-sum', '0');
V('linear-weight', '0');
V('linear-gravity', 'none');
V('linear-layout-gravity', 'none');
V('layout-animation-create-duration', '0s');
V('layout-animation-create-timing-function', 'linear');
V('layout-animation-create-delay', '0s');
V('layout-animation-create-property', 'opacity');
V('layout-animation-delete-duration', '0s');
V('layout-animation-delete-timing-function', 'linear');
V('layout-animation-delete-delay', '0s');
V('layout-animation-delete-property', 'opacity');
V('layout-animation-update-duration', '0s');
V('layout-animation-update-timing-function', 'linear');
V('layout-animation-update-delay', '0s');
V('adapt-font-size', '0');
V('aspect-ratio', '');
V('text-decoration', '');
V('text-shadow', '');
V('background-image', '');
V('background-position', '');
V('background-origin', 'border-box');
V('background-repeat', 'no-repeat');
V('background-size', '');
V('border', '');
V('visibility', 'visible');
V('border-right', '');
V('border-left', '');
V('border-top', '');
V('border-bottom', '');
V('transition', '');
V('transition-property', '');
V('transition-duration', '');
V('transition-delay', '');
V('transition-timing-function', '');
V('content', '');
V('border-left-style', '');
V('border-right-style', '');
V('border-top-style', '');
V('border-bottom-style', '');
V('implicit-animation', 'true');
V('overflow-x', 'hidden');
V('overflow-y', 'hidden');
V('word-break', 'normal');
V('background-clip', 'border-box');
V('outline', 'medium none black');
V('outline-color', 'black');
V('outline-style', 'black');
V('outline-width', 'medium');
V('vertical-align', 'default');
V('caret-color', 'auto');
V('direction', 'normal');
V('relative-id', '-1');
V('relative-align-top', '-1');
V('relative-align-right', '-1');
V('relative-align-bottom', '-1');
V('relative-align-left', '-1');
V('relative-top-of', '-1');
V('relative-right-of', '-1');
V('relative-bottom-of', '-1');
V('relative-left-of', '-1');
V('relative-layout-once', 'true');
V('relative-center', 'none');
V('enter-transition-name', '');
V('exit-transition-name', '');
V('pause-transition-name', '');
V('resume-transition-name', '');
V('flex-flow', 'row nowrap');
V('z-index', '0');
V('text-decoration-color', 'black');
V('linear-cross-gravity', 'none');
V('margin-inline-start', '0px');
V('margin-inline-end', '0px');
V('padding-inline-start', '0px');
V('padding-inline-end', '0px');
V('border-inline-start-color', 'black');
V('border-inline-end-color', 'black');
V('border-inline-start-width', '0px');
V('border-inline-end-width', '0px');
V('border-inline-start-style', '');
V('border-inline-end-style', '');
V('border-start-start-radius', '0px');
V('border-end-start-radius', '0px');
V('border-start-end-radius', '0px');
V('border-end-end-radius', '0px');
V('relative-align-inline-start', '-1');
V('relative-align-inline-end', '-1');
V('relative-inline-start-of', '-1');
V('relative-inline-end-of', '-1');
V('inset-inline-start', '0px');
V('inset-inline-end', '0px');
V('mask-image', '');
V('grid-template-columns', '');
V('grid-template-rows', '');
V('grid-auto-columns', '');
V('grid-auto-rows', '');
V('grid-column-span', '');
V('grid-row-span', '');
V('grid-column-start', '');
V('grid-column-end', '');
V('grid-row-start', '');
V('grid-row-end', '');
V('grid-column-gap', '');
V('grid-row-gap', '');
V('justify-items', 'stretch');
V('justify-self', 'auto');
V('grid-auto-flow', 'row');
V('filter', '');
V('list-main-axis-gap', '0px');
V('list-cross-axis-gap', '0px');
V('linear-direction', 'column');
V('perspective', 'none');
V('cursor', 'default');
V('text-indent', '0px');
V('clip-path', '');
V('text-stroke', '0px transparent');
V('text-stroke-width', '0px');
V('text-stroke-color', 'transparent');
V('-x-auto-font-size', 'false');
V('-x-auto-font-size-preset-sizes', '');

export function queryCSSProperty(index: number): {
  name: string;
  defaultValue: string;
  dashName: string;
} {
  return cssPropertyMap[index]!;
}

export function queryCSSPropertyNumber(name: string): number {
  return cssPropertyReverseMap[name]!;
}

export { cssPropertyMap };
