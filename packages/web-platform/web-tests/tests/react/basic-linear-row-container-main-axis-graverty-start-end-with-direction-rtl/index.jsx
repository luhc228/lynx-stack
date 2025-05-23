/*
// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
*/
import { Component, root } from '@lynx-js/react';
import './index.css';
class Page extends Component {
  render() {
    return (
      <>
        <view
          id='container-start'
          class='container start horizontal'
          style='background-color:pink;width:300px;height:50px;'
        >
          <view class='container-item' style='background-color:red;' />
          <view class='container-item' style='background-color:green;' />
          <view class='container-item' style='background-color:blue;' />
        </view>
        <view
          id='container-end'
          class='container end horizontal'
          style='background-color:#99ddaa;width:300px;height:50px;'
        >
          <view class='container-item' style='background-color:red;' />
          <view class='container-item' style='background-color:green;' />
          <view class='container-item' style='background-color:blue;' />
        </view>
        <view
          id='container-start-rtl'
          class='container start horizontal rtl'
          style='background-color:pink;width:300px;height:50px;'
        >
          <view class='container-item' style='background-color:red;' />
          <view class='container-item' style='background-color:green;' />
          <view class='container-item' style='background-color:blue;' />
        </view>
        <view
          id='container-end-rtl'
          class='container end horizontal rtl'
          style='background-color:#99ddaa;width:300px;height:50px;direction:lynx-rtl;'
        >
          <view class='container-item' style='background-color:red;' />
          <view class='container-item' style='background-color:green;' />
          <view class='container-item' style='background-color:blue;' />
        </view>
        <view
          id='container-start-reverse'
          class='container start horizontal-reverse'
          style='background-color:pink;width:300px;height:50px;'
        >
          <view class='container-item' style='background-color:red;' />
          <view class='container-item' style='background-color:green;' />
          <view class='container-item' style='background-color:blue;' />
        </view>
        <view
          id='container-end-reverse'
          class='container end horizontal-reverse'
          style='background-color:#99ddaa;width:300px;height:50px;'
        >
          <view class='container-item' style='background-color:red;' />
          <view class='container-item' style='background-color:green;' />
          <view class='container-item' style='background-color:blue;' />
        </view>
        <view
          id='container-start-rtl-reverse'
          class='container start horizontal-reverse rtl'
          style='background-color:pink;width:300px;height:50px;'
        >
          <view class='container-item' style='background-color:red;' />
          <view class='container-item' style='background-color:green;' />
          <view class='container-item' style='background-color:blue;' />
        </view>
        <view
          id='container-end-rtl-reverse'
          class='container end horizontal-reverse rtl'
          style='background-color:#99ddaa;width:300px;height:50px;'
        >
          <view class='container-item' style='background-color:red;' />
          <view class='container-item' style='background-color:green;' />
          <view class='container-item' style='background-color:blue;' />
        </view>
      </>
    );
  }
}
root.render(<Page></Page>);
