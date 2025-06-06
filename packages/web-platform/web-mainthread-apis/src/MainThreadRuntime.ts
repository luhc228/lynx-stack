// Copyright 2023 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import {
  type LynxTemplate,
  type PageConfig,
  type ProcessDataCallback,
  type StyleInfo,
  type FlushElementTreeOptions,
  type Cloneable,
  type CssInJsInfo,
  type BrowserConfig,
  lynxUniqueIdAttribute,
  type publishEventEndpoint,
  type publicComponentEventEndpoint,
  type reportErrorEndpoint,
  type RpcCallType,
  type postExposureEndpoint,
  type LynxContextEventTarget,
  type LynxJSModule,
} from '@lynx-js/web-constants';
import { globalMuteableVars } from '@lynx-js/web-constants';
import { createMainThreadLynx, type MainThreadLynx } from './MainThreadLynx.js';
import { initializeElementCreatingFunction } from './elementAPI/elementCreating/elementCreatingFunctions.js';
import { createAttributeAndPropertyFunctions } from './elementAPI/attributeAndProperty/attributeAndPropertyFunctions.js';
import * as domTreeApis from './elementAPI/domTree/domTreeFunctions.js';
import { createEventFunctions } from './elementAPI/event/eventFunctions.js';
import { createStyleFunctions } from './elementAPI/style/styleFunctions.js';
import {
  flattenStyleInfo,
  genCssContent,
  genCssInJsInfo,
  transformToWebCss,
} from './utils/processStyleInfo.js';
import type { LynxRuntimeInfo } from './elementAPI/ElementThreadElement.js';
import { createExposureService } from './utils/createExposureService.js';

export interface MainThreadRuntimeCallbacks {
  mainChunkReady: () => void;
  flushElementTree: (
    options: FlushElementTreeOptions,
    timingFlags: string[],
  ) => void;
  _ReportError: RpcCallType<typeof reportErrorEndpoint>;
  __OnLifecycleEvent: (lifeCycleEvent: Cloneable) => void;
  markTiming: (pipelineId: string, timingKey: string) => void;
  publishEvent: RpcCallType<typeof publishEventEndpoint>;
  publicComponentEvent: RpcCallType<typeof publicComponentEventEndpoint>;
  postExposure: RpcCallType<typeof postExposureEndpoint>;
}

export interface MainThreadConfig {
  pageConfig: PageConfig;
  globalProps: unknown;
  callbacks: MainThreadRuntimeCallbacks;
  styleInfo: StyleInfo;
  customSections: LynxTemplate['customSections'];
  lepusCode: LynxTemplate['lepusCode'];
  browserConfig: BrowserConfig;
  tagMap: Record<string, string>;
  docu: Pick<Document, 'append' | 'createElement' | 'addEventListener'>;
  jsContext: LynxContextEventTarget;
}

export const elementToRuntimeInfoMap = Symbol('elementToRuntimeInfoMap');
export const getElementByUniqueId = Symbol('getElementByUniqueId');
export const updateCSSInJsStyle = Symbol('updateCSSInJsStyle');
export const lynxUniqueIdToElement = Symbol('lynxUniqueIdToElement');
export const switchExposureService = Symbol('switchExposureService');

export class MainThreadRuntime {
  /**
   * @private
   */
  [lynxUniqueIdToElement]: WeakRef<HTMLElement>[] = [];

  /**
   * @private
   */
  [switchExposureService]: (enable: boolean, sendEvent: boolean) => void;
  /**
   * @private
   */
  private _lynxUniqueIdToStyleSheet: WeakRef<HTMLStyleElement>[] = [];

  /**
   * @private
   */
  _page?: HTMLElement;
  /**
   * @private the CreatePage will append it to this
   */
  _rootDom: Pick<Element, 'append' | 'addEventListener'>;
  /**
   * @private
   */
  _timingFlags: string[] = [];

  /**
   * @private
   */
  [elementToRuntimeInfoMap]: WeakMap<HTMLElement, LynxRuntimeInfo> =
    new WeakMap();

  constructor(
    public config: MainThreadConfig,
  ) {
    this.__globalProps = config.globalProps;
    this.lynx = createMainThreadLynx(config);
    /**
     * now create the style content
     * 1. flatten the styleInfo
     * 2. transform the styleInfo to web css
     * 3. generate the css in js info
     * 4. create the style element
     * 5. append the style element to the root dom
     */
    flattenStyleInfo(this.config.styleInfo);
    transformToWebCss(this.config.styleInfo);
    const cssInJsInfo: CssInJsInfo = this.config.pageConfig.enableCSSSelector
      ? {}
      : genCssInJsInfo(this.config.styleInfo);
    const cardStyleElement = this.config.docu.createElement('style');
    cardStyleElement.innerHTML = genCssContent(
      this.config.styleInfo,
      this.config.pageConfig,
    );
    this._rootDom = this.config.docu;
    this._rootDom.append(cardStyleElement);
    /**
     * now create Element PAPIs
     */
    Object.assign(
      this,
      createAttributeAndPropertyFunctions(this),
      domTreeApis,
      createEventFunctions(this),
      createStyleFunctions(
        this,
        cssInJsInfo,
      ),
      initializeElementCreatingFunction(this),
    );
    this._ReportError = this.config.callbacks._ReportError;
    this.__OnLifecycleEvent = this.config.callbacks.__OnLifecycleEvent;
    /**
     * Start the exposure service
     */
    this[switchExposureService] =
      createExposureService(this).switchExposureService;
    /**
     * to know when the main thread is ready
     */
    Object.defineProperty(this, 'renderPage', {
      get: () => {
        return this.#renderPage;
      },
      set: (val: (data: unknown) => void) => {
        this.#renderPage = val;
        queueMicrotask(this.config.callbacks.mainChunkReady);
      },
    });
    for (const nm of globalMuteableVars) {
      Object.defineProperty(this, nm, {
        get: () => {
          return this.__lynxGlobalBindingValues[nm];
        },
        set: (v: any) => {
          this.__lynxGlobalBindingValues[nm] = v;
          for (const handler of this.__varsUpdateHandlers) {
            handler();
          }
        },
      });
    }
  }
  /**
   * @private
   */
  [getElementByUniqueId](uniqueId: number): HTMLElement | undefined {
    return this[lynxUniqueIdToElement][uniqueId]?.deref();
  }

  [updateCSSInJsStyle](uniqueId: number, newStyles: string) {
    let currentElement = this._lynxUniqueIdToStyleSheet[uniqueId]?.deref();
    if (!currentElement) {
      currentElement = this.config.docu.createElement(
        'style',
      ) as HTMLStyleElement;
      this._lynxUniqueIdToStyleSheet[uniqueId] = new WeakRef(currentElement);
      this._rootDom.append(currentElement);
    }
    currentElement.innerHTML =
      `[${lynxUniqueIdAttribute}="${uniqueId}"]{${newStyles}}`;
  }

  /**
   * @private
   */
  __lynxGlobalBindingValues: Record<string, any> = {};

  get globalThis() {
    return this;
  }

  lynx: MainThreadLynx;

  __globalProps: unknown;

  processData?: ProcessDataCallback;

  #renderPage?: (data: unknown) => void;

  declare renderPage: (data: unknown) => void;

  _ReportError: RpcCallType<typeof reportErrorEndpoint>;

  __OnLifecycleEvent: (lifeCycleEvent: Cloneable) => void;

  __LoadLepusChunk: (path: string) => boolean = (path) => {
    try {
      // @ts-expect-error
      if (self.WorkerGlobalScope) {
        const lepusChunkUrl = this.config.lepusCode[`${path}`];
        if (lepusChunkUrl) path = lepusChunkUrl;
        // @ts-expect-error
        importScripts(path);
        const entry = (globalThis.module as LynxJSModule).exports;
        entry?.(this);
      } else {
        throw new Error(
          'importing scripts synchronously is only available for the multi-thread running mode',
        );
      }
      return true;
    } catch {
    }
    return false;
  };

  __FlushElementTree = (
    _subTree: unknown,
    options: FlushElementTreeOptions,
  ) => {
    const timingFlags = this._timingFlags;
    this._timingFlags = [];
    if (this._page && !this._page.parentElement) {
      this._rootDom.append(this._page);
    }
    this.config.callbacks.flushElementTree(options, timingFlags);
  };

  updatePage?: (data: Cloneable, options?: Record<string, string>) => void;
  runWorklet?: (obj: unknown, event: unknown) => void;

  private __varsUpdateHandlers: (() => void)[] = [];
  set _updateVars(handler: () => void) {
    this.__varsUpdateHandlers.push(handler);
  }
}
