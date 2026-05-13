本页总览

## 说明 ​

全局模块中封装的快捷事件，不用区分是无障碍模式还是代理模式

## 代理节点设置 ​

### setAgentSupportNode 设置代理模式下获取节点方式 ​

- 设置代理模式下获取节点方式
- 该方法仅对代理模式生效
- EC 安卓 11.2.0+
- 该方法在启动代理服务之前调用，使用2和3 可以减少检测的特征
- 1的方式会出现 ruru检测出 AccessibilityManager.isEnabled，2和其他的方式不会出现
- 1的方式节点能力交强，2节点功能较弱，3 就没有节点功能
- @param support 1 类似无障碍一样的方式， 2 shell dump的的方式，3 不开启节点服务
- @return `{boolean}` true true代表成功 false代表失败

```
function main() {
  setAgentSupportNode("2");
}

main();
```

### setShellDumpCompressed 代理模式dump压缩模式 ​

- 需要在代理服务启动后才能调用该方法
- 设置代理模式下shell dump是否使用压缩模式
- 压缩模式下获取的节点数量更少，速度更快
- 该方法仅对代理模式生效
- @param compressed 1 代表压缩，2代表不压缩
- @return `{boolean}` true代表成功 false代表失败

```
function main() {
  setAgentSupportNode("2")
  startEnv()
  let a = setShellDumpCompressed(1);
  logd("setShellDumpCompressed " + a)
}

main();
```

## 手势事件模式 ​

### setGestureActionMode 设置手势模式事件 ​

- 设置各种手势模式事件的操作类型，默认是异步,目前只对无障碍模式有效
- @param mode 1 代表异步，2代表同步
- @param bool true代表成功 false代表失败

```
function main() {
  setGestureActionMode(1);
  // setGestureActionMode(2);
}

main();
```

## 点击函数 ​

### clickPoint 坐标点击 ​

- 执行条件：无障碍7.0以上或者手势执行为代理服务
- 点击坐标
- @param x x坐标
- @param y y坐标
- @return `{boolean|布尔型}`

```
function main() {
  var result = clickPoint(100, 100);
  if (result) {
    toast("点击成功");
  } else {
    toast("点击失败");
  }
}

main();
```

### click 选择器点击 ​

- 执行条件：无障碍7.0以上或者手势执行为代理服务
- 点击选择器
- @param selectors 选择器对象
- @return `{boolean|布尔型}`

```
function main() {
  var selector = text("我是文本");
  var result = click(selector);
  if (result) {
    toast("点击成功");
  } else {
    toast("点击失败");
  }
}

main();
```

### clickEx 无指针点击 ​

- 执行条件：无障碍5.0以上或者手势执行为代理服务
- 无指针方式点击选择器，节点必须是可点击的才行(clickable = true)
- @param selectors 选择器对象
- @return `{boolean|布尔型}`

```
function main() {
  var selector = text("我是文本");
  var result = clickEx(selector);
  if (result) {
    toast("点击成功");
  } else {
    toast("点击失败");
  }
}

main();
```

### longClickEx 无指针长点击 ​

- 执行条件：无障碍5.0以上或者手势执行为代理服务
- 无指针方式长点击选择器，节点必须是可点击的才行
- @param selectors 选择器对象
- @return `{boolean|布尔型}`

```
function main() {
  var selector = text("我是文本");
  var result = longClickEx(selector);
  if (result) {
    toast("点击成功");
  } else {
    toast("点击失败");
  }
}

main();
```

### clickRandom 选择器随机点击 ​

- 执行条件：无障碍7.0以上或者手势执行为代理服务
- 随机点击选择器的任意元素
- @param selectors 选择器对象
- @return `{boolean|布尔型}`

```
function main() {
  var selector = text("我是文本");
  var result = clickRandom(selector);
  if (result) {
    toast("点击成功");
  } else {
    toast("点击失败");
  }
}

main();
```

### clickRandomEx 无指针随机点击 ​

- 执行条件：无障碍5.0以上或者手势执行为代理服务
- 随机点击选择器的任意元素
- @param selectors 选择器对象
- @return `{boolean|布尔型}`

```
function main() {
  var selector = text("我是文本");
  var result = clickRandomEx(selector);
  if (result) {
    toast("点击成功");
  } else {
    toast("点击失败");
  }
}

main();
```

### clickRandomRect 区域随机点击 ​

- 执行条件：无障碍7.0以上或者手势执行为代理服务
- 随机点击区域中的坐标
- @param rect 区域对象
- @return `{boolean|布尔型}`

```
function main() {
  var rect = new Rect();
  rect.left = 10;
  rect.right = 200;
  rect.top = 10;
  rect.bottom = 400;
  var result = clickRandomRect(rect);
  if (result) {
    toast("点击成功");
  } else {
    toast("点击失败");
  }
}

main();
```

### clickCenter 点击中心点 ​

- 执行条件：无障碍7.0以上或者手势执行为代理服务
- 点击区域中的中心坐标
- @param rect 区域对象
- @return `{boolean|布尔型}`

```
function main() {
  var rect = new Rect();
  rect.left = 10;
  rect.right = 200;
  rect.top = 10;
  rect.bottom = 400;
  var result = clickCenter(rect);
  if (result) {
    toast("点击成功");
  } else {
    toast("点击失败");
  }
}

main();
```

### clickText 点击文本 ​

- 执行条件：无障碍7.0以上或者手势执行为代理服务
- 点击文本
- @param text 文本
- @return `{boolean|布尔型}`

```
function main() {
  var result = clickText("设置");
  if (result) {
    toast("点击成功");
  } else {
    toast("点击失败");
  }
}

main();
```

### longClick 选择器长点击 ​

- 执行条件：无障碍7.0以上或者手势执行为代理服务
- 长点击选择器
- @param selectors 选择器对象
- @return `{boolean|布尔型}`

```
function main() {
  var selector = text("我是文本");
  var result = longClick(selector);
  if (result) {
    toast("点击成功");
  } else {
    toast("点击失败");
  }
}

main();
```

### longClickPoint 坐标长点击 ​

- 执行条件：无障碍7.0以上或者手势执行为代理服务
- 长点击坐标
- @param x x坐标
- @param y y坐标
- @return `{boolean|布尔型}`

```
function main() {
  var result = longClickPoint(100, 100);
  if (result) {
    toast("点击成功");
  } else {
    toast("点击失败");
  }
}

main();
```

### press 坐标长按 ​

- 长按住事件
- 适用版本(EC 5.15.0+)
- @param x x坐标
- @param y y坐标
- @param delay 长按时间 毫秒
- @return `{bool}` true 成功 false 失败

```
function main() {
  var result = press(100, 100, 5000);
  if (result) {
    toast("长按成功");
  } else {
    toast("长按失败");
  }
}

main();
```

## 多点触摸 ​

### multiTouch 多点触摸 ​

- 执行条件：无障碍7.0以上或者手势执行为代理服务
- 多点触摸
- 触摸参数: action :一般情况下 按下为0，弹起为1，移动为2
- x: X坐标
- y: Y坐标
- pointer：设置第几个手指触摸点，分别是 1，2，3等，代表第n个手指
- delay: 该动作延迟多少毫秒执行，这个是值当前这个事件先延迟后执行
- @param touch1 第1个手指的触摸点数组,例如： `[{"action":0,"x":1,"y":1,"pointer":1,"delay":20},{"action":2,"x":1,"y":1,"pointer":1,"delay":20}]`
- @param touch2 第2个手指的触摸点数组
- @param touch3 第3个手指的触摸点数组
- @param timeout 多点触摸总执行的超时时间，单位是毫秒
- @return boolean|布尔型

```
function main() {
  utils.openAppByName("视频");
  sleep(3000);
  //第一种数组式的写法
  var touch1 = [
    {"action": 0, "x": 500, "y": 1200, "pointer": 1, "delay": 1},
    {"action": 2, "x": 500, "y": 1100, "pointer": 1, "delay": 20},
    {"action": 2, "x": 500, "y": 1000, "pointer": 1, "delay": 20},
    {"action": 1, "x": 1, "y": 1, "pointer": 1, "delay": 20}
  ]
  //第二种链式调用方法
  var touch1 = MultiPoint
    .get()
    .action(0).x(500).y(1200).pointer(1).delay(1)
    .next()
    .action(2).x(500).y(1100).pointer(1).delay(1)
    .next()
    .action(2).x(500).y(1000).pointer(1).delay(1)
    .next()
    .action(2).x(500).y(900).pointer(1).delay(1)
    .next()
    .action(1).x(500).y(800).pointer(1).delay(1);
  var touch2 = MultiPoint
    .get()
    .action(0).x(300).y(1200).pointer(2).delay(1)
    .next()
    .action(2).x(300).y(1100).pointer(2).delay(1)
    .next()
    .action(2).x(300).y(1000).pointer(2).delay(1)
    .next()
    .action(2).x(300).y(900).pointer(2).delay(1)
    .next()
    .action(1).x(300).y(800).pointer(2).delay(1);
  var x = multiTouch(touch1, touch2, null, 30000);
  logd("xxs " + x);
}

main();
```

### touchDown 执行按下 ​

- 执行按下
- 适合EC 7.4.0+,安卓版本8+
- @param x x坐标
- @param y y坐标
- @return 布尔型 true 代表成功 false代表失败

```
function main() {
  //整个动作需要配合使用,单独无效
  //按下
  touchDown(100, 100)
  sleep(50)
  //移动
  touchMove(100, 150)
  sleep(50)
  //移动
  touchMove(100, 200)
  sleep(50)
  //抬起
  touchUp(100, 200)
  sleep(200)
}

main();
```

### touchMove 执行移动 ​

- 执行移动
- 适合EC 7.4.0+,安卓版本8+
- @param x x坐标
- @param y y坐标
- @return 布尔型 true 代表成功 false代表失败

```
function main() {
  //整个动作需要配合使用,单独无效
  //按下
  touchDown(100, 100)
  sleep(50)
  //移动
  touchMove(100, 150)
  sleep(50)
  //移动
  touchMove(100, 200)
  sleep(50)
  //抬起
  touchUp(100, 200)
  sleep(200)
}

main();
```

### touchUp 执行弹起 ​

- 执行弹起事件
- 适合EC 7.4.0+,安卓版本8+
- @param x x坐标
- @param y y坐标
- @return 布尔型 true 代表成功 false代表失败

```
function main() {
  //整个动作需要配合使用,单独无效
  //按下
  touchDown(100, 100)
  sleep(50)
  //移动
  touchMove(100, 150)
  sleep(50)
  //移动
  touchMove(100, 200)
  sleep(50)
  //抬起
  touchUp(100, 200)
  sleep(200)
}

main();
```

### resetAllTouchState 重置touch状态 ​

- 重置touch状态
- 防止因为touch执行的时候外部原因中断导致的不能再次执行touch
- 无障碍模式不生效
- 适合EC 11.16.0+
- @return `{boolean}` true 代表成功 false代表失败

```
function main() {
  resetAllTouchState();
  logd(touchDownEx(300,500,1));
  logd(touchMoveEx(300,500,1));
  sleep(2000)
  while(true){
    sleep(10)
    logd(touchDownEx(610,510,2));
    sleep(1000)
    logd(touchMoveEx(660,660,2));
    sleep(2000)
    logd(touchUpEx(710,710,2));
    sleep(2000)
  }
}

main();
```

### touchDownEx 执行弹起 ​

- 按下事件，带手指参数
- 无障碍模式手指参数不生效
- 适合EC 11.16.0+
- @param x x坐标
- @param y y坐标
- @param pointerId 手指参数 从1开始
- @return `{boolean}` true 代表成功 false代表失败

```
function main() {
  resetAllTouchState();
  logd(touchDownEx(300,500,1));
  logd(touchMoveEx(300,500,1));
  sleep(2000)
  while(true){
    sleep(10)
    logd(touchDownEx(610,510,2));
    sleep(1000)
    logd(touchMoveEx(660,660,2));
    sleep(2000)
    logd(touchUpEx(710,710,2));
    sleep(2000)
  }
}

main();
```

### touchMoveEx 执行弹起 ​

- 移动事件，带手指参数
- 无障碍模式手指参数不生效
- 适合EC 11.16.0+
- @param x x坐标
- @param y y坐标
- @param pointerId 手指参数 从1开始
- @return `{boolean}` true 代表成功 false代表失败

```
function main() {
  resetAllTouchState();
  logd(touchDownEx(300,500,1));
  logd(touchMoveEx(300,500,1));
  sleep(2000)
  while(true){
    sleep(10)
    logd(touchDownEx(610,510,2));
    sleep(1000)
    logd(touchMoveEx(660,660,2));
    sleep(2000)
    logd(touchUpEx(710,710,2));
    sleep(2000)
  }
}

main();
```

### touchUpEx 执行弹起 ​

- 抬起事件，带手指参数
- 无障碍模式手指参数不生效
- 适合EC 11.16.0+
- @param x x坐标
- @param y y坐标
- @param pointerId 手指参数 从1开始
- @return `{boolean}` true 代表成功 false代表失败

```
function main() {
  resetAllTouchState();
  logd(touchDownEx(300,500,1));
  logd(touchMoveEx(300,500,1));
  sleep(2000)
  while(true){
    sleep(10)
    logd(touchDownEx(610,510,2));
    sleep(1000)
    logd(touchMoveEx(660,660,2));
    sleep(2000)
    logd(touchUpEx(710,710,2));
    sleep(2000)
  }
}

main();
```

## 滚动函数 ​

### scrollForward 无指针向前滚动 ​

- 执行条件：无障碍5.0以上或者手势执行为代理服务
- 向前滚动
- @param selectors 选择器对象
- @return `{boolean|布尔型}`

```
function main() {
  var selector = scrollable(true);
  var result = scrollForward(selector);
  if (result) {
    toast("滚动成功");
  } else {
    toast("滚动失败");
  }
}

main();
```

### scrollBackward 无指针向后滚动 ​

- 执行条件：无障碍5.0以上或者手势执行为代理服务
- 向后滚动
- @param selectors 选择器对象
- @return `{boolean|布尔型}`

```
function main() {
  var selector = scrollable(true);
  var result = scrollBackward(selector);
  if (result) {
    toast("滚动成功");
  } else {
    toast("滚动失败");
  }
}

main();
```

## 滑动函数 ​

### swipe 滑动 ​

- 执行条件：无障碍7.0以上或者手势执行为代理服务
- 通过选择器滑动节点
- @param selectors 节点选择器
- @param endX 结束的X坐标
- @param endY 结束的Y坐标
- @param duration 持续时长 单位毫秒
- @return 布尔型 true 代表成功 false 代表失败

```
function main() {
  var selectors = text("我是文本");
  var result = swipe(selectors, 100, 100, 200);
  if (result) {
    toast("滑动成功");
  } else {
    toast("滑动失败");
  }
}

main();
```

### swipeToPoint 坐标点滑动 ​

- 执行条件：无障碍7.0以上或者手势执行为代理服务
- 从一个坐标滑动到另一个坐标
- @param startX 起始坐标的X轴值
- @param startY 起始坐标的Y轴值
- @param endX 结束坐标的X轴值
- @param endY 结束坐标的Y轴值
- @param duration 持续时长 单位毫秒
- @return 布尔型 true 滑动成功, false 滑动失败

```
function main() {
  var result = swipeToPoint(10, 10, 100, 100, 200);
  if (result) {
    toast("滑动成功");
  } else {
    toast("滑动失败");
  }
}

main();
```

### isScrollEnd 滚到底部判断 ​

- 执行条件：无障碍5.0以上或者手势执行为代理服务
- 是否滚动到底部了，如果查不到元素也会返回false
- @param distance 滚动方向 UP,DOWN,LEFT,RIGHT
- @param selectors 选择器
- @return false 代表未滚动到位，true 代表滚动完成了

```
function main() {
  var selectors = clz("android.widget.ListView");
  var result = isScrollEnd("UP", selectors);
  if (result) {
    toast("滚动完成");
  } else {
    toast("滚动未完成");
  }
}

main();
```

## 拖动函数 ​

### drag 拖动坐标 ​

- 执行条件：无障碍7.0以上或者手势执行为代理服务
- 从一个坐标到另一个坐标的拖动
- @param startX 起始坐标的X轴值
- @param startY 起始坐标的Y轴值
- @param endX 结束坐标的X轴值
- @param endY 结束坐标的Y轴值
- @param duration 持续时长 单位毫秒
- @return 布尔型 true 拖动成功, false 拖动失败

```
function main() {
  var result = drag(10, 10, 100, 100, 200);
  if (result) {
    toast("拖动成功");
  } else {
    toast("拖动失败");
  }
}

main();
```

### dragTo 拖动选择器 ​

- 执行条件：无障碍7.0以上或者手势执行为代理服务
- 通过选择器拖动某个元素到目标元素
- @param selectors 选择器
- @param destObj 目标元素选择器
- @param duration 持续时长 单位毫秒
- @return 布尔型 true 成功 false 失败

```
function main() {
  var selectors = text("设置");
  var destObj = text("日历");
  var result = dragTo(selectors, destObj, 200);
  if (result) {
    toast("拖动成功");
  } else {
    toast("拖动失败");
  }
}

main();
```

### dragToPoint 拖动到目标选择器 ​

- 执行条件：无障碍7.0以上或者手势执行为代理服务
- 通过选择器拖动某个元素到目标X Y 坐标
- @param selectors 原始元素选择器
- @param endX 目标 X 坐标
- @param endY 目标 Y 坐标
- @param duration 持续时长 单位毫秒
- @return 布尔型 true 成功 false 失败

```
function main() {
  var selectors = text("设置");
  var result = dragToPoint(selectors, 100, 100, 200);
  if (result) {
    toast("拖动成功");
  } else {
    toast("拖动失败");
  }
}

main();
```

## 输入数据 ​

### imeInputViewShown 输入法键盘是否展示 ​

- 使用输入法输入内容时，输入法键盘视图是否展示出来
- 前提：在EC 系统设置中，勾选了 显示输入法键盘
- 适配EC 9.18.0+
- @return `{boolean|布尔型}` true代表视图展示 false代表未展示

```
function main() {
  var result = imeInputViewShown();
  if (result) {
    toast("是");
  } else {
    toast("否");
  }
}

main();
```

### currentIsOurIme 是否是自带输入法 ​

- 当前是否是我们的输入法
- @return `{boolean|布尔型}`

```
function main() {
  var result = currentIsOurIme();
  if (result) {
    toast("是");
  } else {
    toast("否");
  }
}

main();
```

### inputText 输入数据 ​

- 执行条件：无障碍5.0以上
- 通过选择器输入数据
- @param selectors 选择器
- @param content 数据字符串
- @return `{boolean|布尔型}`

```
function main() {
  var selectors = clz("android.widget.EditText");
  var result = inputText(selectors, "我是内容");
  if (result) {
    toast("是");
  } else {
    toast("否");
  }
}

main();
```

### imeInputText 输入法输入数据 ​

- 使用输入法输入内容，前提是已经设置本程序的输入法为默认输入法
- 适合没有节点的情况，例如游戏等
- @param selectors 选择器，***可以为空，如果为空，前提是输入框是聚焦的状态***
- @param content 数据字符串, 特殊字符串解释： --ec_close_input-- 关闭软键盘，--ec_open_input-- 打开软键盘 ；--ec_show_input_view-- 显示键盘的视图，--ec_hide_input_view-- 不显示键盘的视图
- @return `{boolean|布尔型}`

```
function main() {

  // 打开软键盘
  //imeInputText(null, "--ec_open_input--");

  var selectors = clz("android.widget.EditText");
  var result = imeInputText(selectors, "我是内容");

  if (result) {
    toast("是");
  } else {
    toast("否");
  }
}

main();
```

### imeInputKeyCode 输入法输入code ​

- 使用输入法输入内容，前提是已经设置本程序的输入法为默认输入法
- 适合没有节点的情况，例如游戏等
- @param selectors 选择器，可以为空，如果为空，前提是输入框是聚焦的状态
- @param content 具体请看 KeyEvent.KEYCODE_*的值，例如66 = enter 67=del,84=SEARCH
- 特殊代码： 1000: 模拟搜索按键，1001: 模拟完成按键 1002:模拟go按键，1003:模拟下一个按键，1004:模拟上一个按键 1005:模拟发送按键
- @return `{boolean|布尔型}`

```
function main() {
  // 模拟搜索按键
  // imeInputKeyCode(null,1000);
  var selectors = clz("android.widget.EditText");
  var result = imeInputKeyCode(selectors, 66);
  if (result) {
    toast("是");
  } else {
    toast("否");
  }
}

main();
```

### pasteText 粘贴数据 ​

- 执行条件：无障碍5.0以上
- 通过选择器粘贴数据
- @param selectors 选择器
- @param content 数据字符串
- @return `{boolean|布尔型}`

```
function main() {
  var selectors = clz("android.widget.EditText");
  var result = pasteText(selectors, "我是内容");
  if (result) {
    toast("是");
  } else {
    toast("否");
  }
}

main();
```

### clearTextField 清除数据 ​

- 执行条件：无障碍5.0以上
- @param selectors 节点选择器
- @return `{boolean|布尔型}`

```
function main() {
  var selectors = clz("android.widget.EditText");
  var result = clearTextField(selectors);
  if (result) {
    toast("是");
  } else {
    toast("否");
  }
}

main();
```

## 节点操作 ​

### lastNodeEventTime 最近节点事件发生时间 ​

- 适用版本(EC 5.14.0+)
- 获取最近的节点事件触发的时间，可通过时间判断节点服务是否可用
- @return `{long}` 长整型时间，毫秒级别

```
function main() {
  startEnv();
  logd("开始监听");

  while (true) {
    let d = lastNodeEventTime();
    logd("time-" + d);
    sleep(1000)
  }
}

main();
```

### setFocus 设置节点聚焦 ​

- 设置节点聚焦
- 适配EC 10.21.0+
- @param selectors 选择器对象
- @return `boolean|布尔型`

```
function main() {
  var selectors = text("设置");
  var result = setFocus(selectors);
  if (result) {
    toast("ok");
  } else {
    toast("false");
  }
}

main();
```

### has 节点存在判断 ​

- 通过选择器判断元素是否存在
- @param selectors 选择器
- @return `{null|布尔型}`

```
function main() {
  var selectors = text("设置");
  var result = has(selectors);
  if (result) {
    toast("存在节点");
  } else {
    toast("不存在节点");
  }
}

main();
```

### waitExistActivity 等界面出现 ​

- 等待activity界面出现
- @param activity 界面名称
- @param timeout 超时时间，单位毫秒
- @return `{null|布尔型}`

```
function main() {
  var ac = "com.xxx.MainActivity";
  var result = waitExistActivity(ac, 10000);
  if (result) {
    toast("存在界面");
  } else {
    toast("不存在界面");
  }
}

main();
```

### waitExistNode 等节点出现 ​

- 通过选择器判断并等待元素是否存
- @param selectors 选择器
- @param timeout 超时时间，单位毫秒
- @return `{null|布尔型}`

```
function main() {
  var selectors = text("设置");
  var result = waitExistNode(selectors, 10000);
  if (result) {
    toast("存在节点");
  } else {
    toast("不存在节点");
  }
}

main();
```

### getText 获取文本 ​

- 获取选择器得到的文本数据
- @param selectors 选择器
- @return `{字符串数组|null|字符串集合}`

```
function main() {
  var selectors = clz("android.widget.TextView");
  var result = getText(selectors);
  toast("result:" + result);
}

main();
```

### getNodeInfo 获取节点数组 ​

- 获取节点信息
- @param selectors 选择器
- @param timeout 等待时间，单位是毫秒
- @return `{null|NodeInfo数组|节点信息集合}`

```
function main() {
  var result = getNodeInfo(clz("android.widget.TextView"), 10 * 1000);
  toast("result:" + JSON.stringify(result));
}

main();
```

### getNodeAttrs 节点属性信息 ​

- 获取节点属性信息
- @param selectors 选择器
- @param attr 属性值,例如 text,className，更多的属性请参考NodeInfo对象属性
- @return `{null|字符串数组|Rect对象数组}`

```
function main() {
  var selectors = clz("android.widget.TextView");
  //获取所有text属性
  var result = getNodeAttrs(selectors, "text");
  toast("result:" + result);
  //获取所有bounds属性
  result = getNodeAttrs(selectors, "bounds");
  toast("result:" + result);
}

main();
```

### getOneNodeInfo 获取单个节点 ​

- 通过选择器 获取第一个节点信息
- @param selectors 选择器
- @param timeout 等待时间，单位是毫秒
- @return NodeInfo 对象或者null

```
function main() {
  var result = getOneNodeInfo(clz("android.widget.TextView"), 10 * 1000);
  toast("result:" + JSON.stringify(result));
  if (result) {
    result.click();
  }
}

main();
```

### setFetchNodeMode 获取节点的模式 ​

- 设置获取节点的模式
- @param mode 1 是增强型， 2 是快速型，默认是增强型
- @param fetchInvisibleNode 是否抓取隐藏的元素，默认不抓取
- @param fetchNotImportantNode 是否抓取不重要的元素，默认抓取
- @param algorithm 节点查找算法,默认是nsf，分别有 nsf = 节点静态算法，bsf= 广度优先， dsf=深度度优先
- @return `{boolean}`

```
function main() {
  // 脚本开头执行一次即可
  var result = setFetchNodeMode(1, false, true, "nsf");
  toast("result:" + result);
}

main();
```

### setNodeDumpParam 设置nsf抓节点参数 ​

- 设置nsf抓节点参数
- 部分手机上使用NSF 读取节点会导致stackoverflow异常，可以使用dumpMethod设置为2或者3进行改善
- maxDepth参数用于控制节点深度，可以提高速度
- 适配EC 10.9.0+
- 不同的深度、抓节点方式，可以增加速度以及节点过多防止内存溢出问题
- @param data map格式 `{"dumpMethod":1,"maxDepth":50}`
- dumpMethod: NSF算法下的抓节点方式分别是1、2、3，默认是1
- maxDepth: 抓节点深度
- @return boolean|布尔型

```
function main() {
  // 脚本开头执行一次即可
  var result = setNodeDumpParam(1, false, true, "nsf");
  toast("result:" + result);
  logd(dumpXml())
}

main();
```

### setBlockNodeAttr 屏蔽节点属性 ​

- 设置要屏蔽的节点属性
- 设置后，系统不会抓取这些节点数据属性
- 适配 EC 9.23.0+
- @param blockNode 字符串，以英文逗号分割，例如 clz,index,bounds，获取属性值，参考idea节点面板的右侧属性
- blockNode 设置为 "" , 代表恢复默认
- @return `{boolean}`

```
function main() {
  var result = setBlockNodeAttr("row,bounds,index");
  toast("result:" + result);
  let data = dumpXml()
  logd(data)

  // 恢复默认
  setBlockNodeAttr("")
}

main();
```

### addNodeFlag 加上节点获取的某个标志位 ​

- 加上节点获取的某个标志位
- @param flag 参见 AccessibilityServiceInfo.FLAG_*，如果是0是强制刷新
- @return `{null|boolean}`

```
function main() {
  addNodeFlag(0);
}

main();
```

### removeNodeFlag 移除节点获取的某个标志位[强制刷新节点] ​

- 移除节点获取的某个标志位
- @param flag 参见 AccessibilityServiceInfo.FLAG_*，如果是0是强制刷新

```
function main() {
  removeNodeFlag(0);
}

main();
```

### dumpXml 元素变XML ​

- 将元素节点变成XML
- @return string string|null

```
function main() {
  var result = dumpXml();
  if (result) {
    toast("ok");
  } else {
    toast("no");
  }
}

main();
```

### lockNode 锁定当前节点 ​

- 锁定当前节点，锁定后，后面就算界面刷新，但是节点还是老的信息，需要和releaseNode进行配合才能进行解锁

```
function main() {
  logd("锁住节点...")
  //锁住节点，界面刷新也不动
  console.time("1")
  lockNode()
  for (let i = 0; i < 10; i++) {
    let n = text("设置").getOneNodeInfo(1000)
    logd("lock " + n)
  }
  logd("释放节点锁...")
  //释放节点锁
  releaseNode()
  logd(console.timeEnd("1"))

  console.time("1")
  for (var i = 0; i < 10; i++) {
    let n = text("设置").getOneNodeInfo(1000)
    logd("unlocked " + n)
  }
  logd(console.timeEnd("1"))
  //锁住时间明显更短
}

main();
```

### releaseNode 释放节点的锁 ​

- 释放节点的锁，释放后，当界面刷新的时候，节点信息会变成最新的

```
function main() {
  logd("锁住节点...")
  //锁住节点，界面刷新也不动
  console.time("1")
  lockNode()
  for (let i = 0; i < 10; i++) {
    let n = text("设置").getOneNodeInfo(1000)
    logd("lock " + n)
  }
  logd("释放节点锁...")
  //释放节点锁
  releaseNode()
  logd(console.timeEnd("1"))

  console.time("1")
  for (var i = 0; i < 10; i++) {
    let n = text("设置").getOneNodeInfo(1000)
    logd("unlocked " + n)
  }
  logd(console.timeEnd("1"))
  //锁住时间明显更短
}

main();
```

## 系统按键相关 ​

### home 返回主页 ​

- 执行条件：无障碍5.0以上或者手势执行为代理服务
- 返回主页
- @return `{null|布尔型}`

```
function main() {
  var result = home();
  if (result) {
    toast("成功");
  } else {
    toast("失败");
  }
}

main();
```

### home2 返回主页2 ​

- 返回主页，无需权限和自动化
- 适配EC 安卓9.16.0+
- @return `{null|布尔型}`

```
function main() {
  var result = home2();
  if (result) {
    toast("成功");
  } else {
    toast("失败");
  }
}

main();
```

### splitScreen 分割屏幕 ​

- 执行条件：无障碍5.0以上或者手势执行为代理服务
- 适用版本(EC 5.15.0+)
- 返回主页
- @return `{null|布尔型}`

```
function main() {
  var result = splitScreen();
  if (result) {
    toast("成功");
  } else {
    toast("失败");
  }
}

main();
```

### power 模拟电源按键 ​

- 执行条件：无障碍5.0以上或者手势执行为代理服务
- 模拟电源按键，无障碍是电源对话框，代理模式是电源键按下
- @return `{null|布尔型}`

```
function main() {
  var result = power();
  if (result) {
    toast("成功");
  } else {
    toast("失败");
  }
}

main();
```

### back 返回键 ​

- 执行条件：无障碍5.0以上或者手势执行为代理服务
- 返回键
- @return `{null|布尔型}`

```
function main() {
  var result = back();
  if (result) {
    toast("成功");
  } else {
    toast("失败");
  }
}

main();
```

### openNotification 打开通知栏 ​

- 执行条件：无障碍5.0以上或者手势执行为代理服务
- 打开通知栏
- @return `{null|布尔型}`

```
function main() {
  var result = openNotification();
  if (result) {
    toast("成功");
  } else {
    toast("失败");
  }
}

main();
```

### openQuickSettings 打开快速设置 ​

- 执行条件：无障碍5.0以上或者手势执行为代理服务
- 打开快速设置
- @return `{null|布尔型}`

```
function main() {
  var result = openQuickSettings();
  if (result) {
    toast("成功");
  } else {
    toast("失败");
  }
}

main();
```

### recentApps 最近APP任务按键 ​

- 执行条件：无障碍5.0以上或者手势执行为代理服务
- 最近APP任务按键
- @return `{null|布尔型}`

```
function main() {
  var result = recentApps();
  if (result) {
    toast("成功");
  } else {
    toast("失败");
  }
}

main();
```

### getCurrentRunningPkg 当前运行的App包名 ​

- 取得当前运行的App包名
- 这个是通过节点获取的，前提是需要打开自动化服务
- 适配EC 10.6.0+
- @return string

```
function main() {
  var result = getCurrentRunningPkg();
  logd(result)
}

main();
```

### getRunningPkg 当前运行的App包名 ​

- 这个获取的不准确，已经废弃了
- 取得当前运行的App包名
- @return `{字符串|null}`

```
function main() {
  var result = getRunningPkg();
}

main();
```

### getRunningActivity 当前运行的Activity类名 ​

- 取得当前运行的Activity类名
- @return `{字符串|null}`

```
function main() {
  var result = getRunningActivity();
}

main();
```

### lockScreen 锁屏 ​

- 参考performGlobalAction 函数
- 适配EC 安卓 11.12.0+
- @return `{boolean}` 布尔型| true代表成功

```
function main() {
  var result = lockScreen();
  if (result) {
    toast("成功");
  } else {
    toast("失败");
  }
}

main();
```

### performGlobalAction 执行全局的action动作 ​

- 执行全局的action动作
- 适配EC 安卓 11.12.0+
- @param actionType 这个值请参考AccessibilityService下面的global开头的常量，例如：
- public static final int GLOBAL_ACTION_BACK = 1;
- public static final int GLOBAL_ACTION_HOME = 2;
- public static final int GLOBAL_ACTION_LOCK_SCREEN = 8;
- public static final int GLOBAL_ACTION_NOTIFICATIONS = 4;
- public static final int GLOBAL_ACTION_POWER_DIALOG = 6;
- public static final int GLOBAL_ACTION_QUICK_SETTINGS = 5;
- public static final int GLOBAL_ACTION_RECENTS = 3;
- public static final int GLOBAL_ACTION_TAKE_SCREENSHOT = 9;
- public static final int GLOBAL_ACTION_TOGGLE_SPLIT_SCREEN = 7;
- @return `{boolean}` 布尔型| true代表成功

```
function main() {
  var result = performGlobalAction(8);
  if (result) {
    toast("成功");
  } else {
    toast("失败");
  }
}

main();
```

## 通知栏 ​

### requestNotificationPermission 请求监听状态栏的权限 ​

- 请求监听状态栏的权限
- @param timeout 请求权限超时时间 单位是秒
- @return true 代表请求权限成功，false代表失败

```
function main() {
  var result = requestNotificationPermission(10);
  toast("是否有权限:" + result);
}

main();
```

### hasNotificationPermission 是否有状态栏监听权限 ​

- 检查是否含有状态栏监听权限
- @return true 代表请求权限成功，false代表失败

```
function main() {
  var result = hasNotificationPermission();
  toast("是否有权限:" + result);
}

main(); 
```

### getLastNotification 获取最近通知栏对象 ​

- 获取最近通知栏对象
- @param pkg 指定包名
- @param size 指定获取的条数
- @return `{NotificationInfo数组}`

```
function main() {
  var result = getLastNotification("com.x", 100);
  toast("结果:" + result);
}

main();
```

### shotNotification 通知发射处理 ​

- 将通知发射处理，相当于点击了通知栏
- @param seqId
- @return `{boolean|布尔型}`

```
function main() {
  var result = getLastNotification("com.x", 1);
  if (result && result.length > 0) {
    var s = shotNotification(result[0].seqId);
    toast("结果:" + s);
  }
}

main();
```

### ignoreNotification 忽略通知 ​

- 忽略通知，从缓存队列移除，下次将不会获取
- @param seqId
- @return `{boolean|布尔型}`

```
function main() {
  var result = getLastNotification("com.x", 1);
  if (result != null && result.length > 0) {
    var s = ignoreNotification(result[0].seqId);
    toast("结果:" + s);
  }
}

main();
```

### cancelNotification 取消通知 ​

- 将通知进行取消操作
- @param seqId
- @return `{boolean|布尔型}`

```
function main() {
  var result = getLastNotification("com.x", 1);
  if (result != null && result.length > 0) {
    var s = cancelNotification(result[0].seqId);
    toast("结果:" + s);
  }
}

main();
```

### getLastToast 获取toast数据 ​

- 获取toast数据
- @param pkg 指定包名
- @param size 指定获取的条数
- @return `{null|ToastInfo数组}`

```
function main() {
  let result = getLastToast("com.xx", 100);
  toast("结果:" + JSON.stringify(result));
  if (result && result.length > 0) {
    for (let i = 0; i < result.length; i++) {
      logd(result[i])
    }
  }
}

main();
```

## 悬浮窗日志 ​

### requestFloatViewPermission 请求浮窗权限 ​

- 请求展示浮窗的权限
- @param timeout 请求权限超时时间 单位是秒
- @return true 代表请求权限成功，false代表失败

```
function main() {
  var result = requestFloatViewPermission(10);
  toast("是否有权限:" + result);
}

main();
```

### hasFloatViewPermission 检查浮窗权限 ​

- 检查是否含有浮窗权限
- @return true 代表请求权限成功，false代表失败

```
function main() {
  var result = hasFloatViewPermission();
  toast("是否有权限:" + result);
}

main();
```

### showFloatView 展示浮窗 ​

- 展示浮窗（如果是开发工具调试，请先预览一下工程，然后运行脚本，避免读取不到path文件内容的情况）
- @param params js的map对象，包含的
- `var map = {"path":"main.html","tag":"test"}`; 类似这样的参数
- 参数解析:
- tag:字符串 悬浮窗唯一定位的标示
- path:字符串 IEC 中的布局文件
- title:字符串 悬浮窗标题
- titleBg:字符串 悬浮窗背景，16进制，例如#888888，或者#88000000
- x:整型 悬浮窗起始X坐标
- y:整型 悬浮窗起始Y坐标
- w:整型 悬浮窗起始宽度
- h:整型 悬浮窗起始高度
- @return true 代表请求权限成功，false代表失败

```
function main() {
  var m = {
    "path": "main.html",
    "tag": "tag",
    "title": "sss",
    "titleBg": "#888888",
    "x": 10,
    "y": 10,
    "w": 100,
    "h": 200
  };
  var xd = showFloatView(m);
  logd("showFloatView " + xd);
}

main();
```

### closeFloatView 关闭浮窗 ​

- 关闭浮窗
- @param tag showFloatView 使用的tag参数，对悬浮窗唯一定位的
- @return true 成功，false代表失败

```
function main() {
  var m = {
    "path": "main.html",
    "tag": "tag",
    "title": "sss",
    "titleBg": "#888888",
    "x": 10,
    "y": 10,
    "w": 100,
    "h": 200
  };
  var xd = showFloatView(m);
  logd("showFloatView " + xd);
  sleep(3000);
  closeFloatView("tag");
}

main();
```

### closeAllFloatView 关闭所有悬浮窗 ​

- 关闭所有悬浮窗，但不包含日志悬浮窗
- @return true 成功，false代表失败

```
function main() {
  var m = {
    "path": "main.html",
    "tag": "tag",
    "title": "sss",
    "titleBg": "#888888",
    "x": 10,
    "y": 10,
    "w": 100,
    "h": 200
  };
  var xd = showFloatView(m);
  logd("showFloatView " + xd);
  sleep(3000);
  closeAllFloatView();
}

main();
```

### showScriptCtrlFloatView 显示脚本暂停控制悬浮窗 ​

- 显示脚本暂停控制悬浮窗
- 适配EC 10.0.0+

```
function main() {
  showScriptCtrlFloatView();
}

main();
```

### closeScriptCtrlFloatView 关闭脚本暂停控制悬浮窗 ​

- 关闭脚本暂停控制悬浮窗
- 适配EC 10.0.0+

```
function main() {
  closeScriptCtrlFloatView();
}

main();
```

### showCtrlWindow 展示启停浮窗 ​

- 展示启停浮窗
- @return true 代表请求权限成功，false代表失败

```
function main() {
  var result = showCtrlWindow();
  toast("是否展示:" + result);
}

main();
```

### closeCtrlWindow 关闭启停浮窗 ​

- 关闭启停浮窗
- @return true 代表请求权限成功，false代表失败

```
function main() {
  var result = closeCtrlWindow();
  toast("是否展示:" + result);
}

main();
```

### setCtrlViewSizeEx 设置启停控制窗口 ​

- 设置启停控制窗口参数
- 适用版本(EC 6.5.0+)
- @param map 例如

```
{
  "x": 100,
  "y": 100,
  "backgroundColor": "#ffffff"
}
//解释：
//  x: 起始X位置
//  y: 起始Y位置
```

- @return bool true代表成功，false代表失败

```
function main() {
  requestFloatViewPermission(1000);
  var m = {
    "x": 100,
    "y": 200,
    "backgroundColor": "#ffffff"
  }
  showCtrlWindow();
  setCtrlViewSizeEx(m);
  sleep(5000);
}

main();
```

### showLogWindow 展示日志浮窗 ​

- 展示日志浮窗
- @return true 代表请求权限成功，false代表失败

```
function main() {
  var result = showLogWindow();
  toast("是否展示:" + result);
}

main();
```

### closeLogWindow 关闭日志浮窗 ​

- 关闭日志浮窗
- @return true 代表请求权限成功，false代表失败

```
function main() {
  closeLogWindow();
}

main();
```

### setLogViewSizeEx 设置日志窗口 ​

- 设置日志窗口大小扩展函数
- backgroundImg适用版本(EC 6.0.0+)
- @param map 例如

提示

```
{
  "x": 100,
  "y": 100,
  "w": 100,
  "h": 200,
  "textSize": 12,
  "backgroundColor": "#ffffff",
  "backgroundImg": "res/a.png",
  "title": "我是日志",
  "backgroundAlpha": 255,
  "showTitle": true,
  "canTouch": false,
  "gravity": "center",
  "showCloseBtn": true
}
```

- x: 起始X位置
- y: 起始Y位置
- w: 宽度
- h: 高度
- textSize: 日志的字体大小
- backgroundColor:背景颜色，例如#336699
- title: 日志框标题
- showTitle：是否显示标题
- gravity: 标题的位置，分别是start:靠左，center:居中，end: 靠右
- backgroundImg 背景图片, 支持GIF动画，放到工程的res文件夹，录入填写res/a.png
- backgroundAlpha 背景图的透明度 255 - 0
- 9.33.0+新增参数: canTouch: 代表是否可以触摸，包含移动点击等悬浮窗事件，false代表脚本运行期间不可以触摸，默认是false，具有穿透作用，true代表脚本运行期间可以接受事件 showCloseBtn: 是否显示关闭按钮，false不显示 true显示

- @return bool true代表成功，false代表失败

```
function main() {
  requestFloatViewPermission(1000);
  var m = {
    "x": 100,
    "y": 200,
    "w": 600,
    "h": 600,
    "gravity": "center",
    "textSize": 12,
    "backgroundColor": "#ffffff",
    "title": "我是日222志",
    "showTitle": false
  }

  showLogWindow();
  sleep(2000);
  setLogViewSizeEx(m);
  sleep(5000);
}

main();
```

### setLogFixedViewEx 设置日志固定栏目属性 ​

- 设置日志顶部固定窗口属性
- 适合EC 6.17.0+
- @param param map参数

解释:

- show: 是否展示
- h: 高度 必须大于0
- textSize: 日志的字体大小
- backgroundColor: 背景颜色，例如#336699

```
function main() {
  requestFloatViewPermission(1000);
  var m = {
    "show": true,
    "h": 150,
    "textSize": 12,
    "textColor": "#000000",
    "backgroundColor": "#ffffff"
  }
  showLogWindow();
  sleep(1000)
  setLogFixedViewEx(m);
  setFixedViewText("TEST\n都是对的")

  sleep(5000);


}

main();
```

### setFixedViewText 展示固定消息 ​

- 展示消息到悬浮窗固定的视图中
- @param msg 消息

```
function main() {
  requestFloatViewPermission(1000);
  var m = {
    "show": true,
    "h": -1,
    "textSize": 12,
    "backgroundColor": "#ffffff"
  }
  showLogWindow();
  sleep(1000)
  setLogFixedViewEx(m);
  sleep(1000);
  setFixedViewText("TEST")
}

main();
```

### setLogText 展示消息 ​

- 展示消息到悬浮窗日志中
- @param msg 消息
- @param color 颜色值例如 #ffffff
- @param size 字体大小

```
function main() {
  var result = setLogText("开始运行...", "#ffffff", 18);
}

main();
```

### expandLogView 展开日志悬浮窗 ​

- 展开日志悬浮窗
- 适配EC 9.32.0+
- @return true 成功，false代表失败

```
function main() {
  showLogWindow();
  sleep(1000)
  var result = expandLogView();
}

main();
```

### collapseLogView 折叠日志悬浮窗 ​

- 折叠日志悬浮窗，只保留标题
- 适配EC 9.32.0+
- @return true 成功，false代表失败

```
function main() {
  showLogWindow();
  sleep(1000)
  var result = collapseLogView();
}

main();
```

## 定时任务 ​

### startJob 开启定时 ​

- 开启一个定时脚本任务
- @param tag 任务的唯一标示，不能为空，脚本中可以使用readConfigString("jobTaskTag")获取当前tag值，判断是那个任务过来执行的
- @param execTime 定时时间格式: 2020-04-17 19:20:00，或者直接是秒数字，例如 3，代表3秒后
- @param cancelBeforeRunning
- @return 整型 jobid 提示
- 只能执行整个脚本,不能指定某个函数 :::

```
function main() {
  var time = "2020-04-17 09:00:00";
  //使用日期开启一个任务
  var id = startJob("task1", time, true);
  logd("job id " + id);
  //使用秒数开启，60秒后执行一个任务
  var id2 = startJob("task2", "60", true);
  logd("job id " + id2);
}

main();
```

### cancelAllJob 取消所有定时 ​

- 取消所有定时
- @return bool true 代表有任务被取消

```
function main() {
  var result = cancelAllJob();
  logd(result);
}

main();
```

### cancelJob 取消指定TAG定时 ​

- 通过tag对定时任务进行取消
- @param tag tag名称，startJob的时候tag参数的值
- @return bool true 代表有任务被取消

```
function main() {

  var result = cancelJob("task1");
  logd(result);
}

main();
```

### getAllJobTag 获取所有定时标签 ​

- 取得所有的定时任务标签
- @return 字符串数组或者null

```
function main() {
  var result = getAllJobTag();
  logd(result);
}

main();
```

## 动态权限申请 ​

### tryGetProjectionPermission 获取截图自允许权限 ​

- 获取截图自允许权限
- 代理模式忽略这函数，这个适合弹窗权限截图模式
- 适配EC 10.25.0+
- 在有shell或者root权限执行，申请完毕可以关闭shell和root
- 尝试获取截图自动允许权限，申请截图不会弹窗
- @return bool true 代表成功 false代表失败

```
function main() {
  let result = tryGetProjectionPermission()
  logd(result);
  // 接下来就可以进行申请截图权限了
}

main();
```

### tryGetAccStartupPermission 获取无障碍自允许权限 ​

- 获取无障碍自允许权限
- 有权限后 无障碍可以自动启动
- 适配EC 10.25.0+
- 在有shell或者root权限执行申请，申请完毕可以关闭shell和root
- 尝试获取无障碍自动化允许的权限
- @return bool true 代表成功 false代表失败

```
function main() {
  let result = tryGetAccStartupPermission()
  logd(result);
  // 接下来就可以进行无障碍自动启动
  startEnv();
}

main();
```

### requestRuntimePermission 申请动态权限 ​

- 申请动态权限
- 适合版本 EC 7.9.0+
- @param permissionArray 动态权限数组，可以是多个
- @timeout 申请超时时间 单位是毫秒
- @return `{bool}` true 代表有权限 false代表无权限或申请失败

```
function main() {
  let per = [
    "android.permission.READ_CALENDAR",
    "android.permission.READ_SMS"
  ]
  let result = requestRuntimePermission(per, 10000)
  logd(result);
}

main();
```

## 其他函数 ​

### random 随机函数 ​

- 取得某个范围的随机值
- @param min 最小值
- @param max 最大值
- @return 整型 在min和max中间的值, 包含最大和最小值

```
function main() {
  var result = random(100, 1000);
  sleep(result);
}

main();
```

### isReleaseIec 脚本是否是release版本 ​

- 判断脚本是否是release版本
- 适配EC 11.12.0+
- @return `{boolean}` true 是发布版本脚本 false 是debug版本

```
function main() {
  var result = isReleaseIec();
  logd(result)
}

main();
```
