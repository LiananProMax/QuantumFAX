本页总览

## 说明 ​

- OTG HID事件模块运行的所有函数，需要借助硬件的方式才能使用
- 具体请看OTG HID配置 高级功能 - OTG HID硬件 : [OTGHID硬件](https://ieasyclick.com/docs/zh-cn/advance/otghid)
- 代理事件模块的对象前缀是 otgEvent，例如 otgEvent.click 这样调用

提示

- OTG hid只是一种点击模式，无障碍、代理模式、root都含有点击和获取节点功能，如果你用不了节点，就使用图色
- 图色权限请使用 `image.requestScreenCapture` 函数的 type=1 带权限截图方式
- OTG hid除了不能使用节点，其他功能都是一样，无需特殊处理

## init 初始化 OTG 串口 ​

- 初始化 OTG 串口
- 适配版本 EC 安卓 11.40.0+
- @return `{null|string}` null 代表成功，其他代表错误消息

```
// 这个只是测试的例子 方便大家观看
var OTG_STEP_DELAY_MS = 2000;

/** 是否执行 home / back / recents / systemKey 等导航类测试 */
var OTG_TEST_RUN_NAV_KEYS = false;

/** 触控测试坐标（按对端分辨率修改） */
var OTG_TEST_X = 200;
var OTG_TEST_Y = 200;
var OTG_TEST_X2 = 400;
var OTG_TEST_Y2 = 400;

function _ok(name, err) {
    if (err == null || err === "" || err === undefined) {
        logd("[OTG-TEST] OK  " + name);
        return true;
    }
    loge("[OTG-TEST] FAIL " + name + " -> " + err);
    return false;
}

function runOtgEventTests() {
    logd("[OTG-TEST] ========== start ==========");

    _ok("init", otgEvent.init());
    sleep(OTG_STEP_DELAY_MS);

    _ok("connectFirst", otgEvent.connectFirst());
    sleep(OTG_STEP_DELAY_MS);

    logd("[OTG-TEST] isConnected = " + otgEvent.isConnected());

    
    // 如果获取不到 就sleep 3s 后重新获取
    logd("mac "+otgEvent.getMacAddress())
    
    _ok("setTimeouts(800,1500,2500)", otgEvent.setTimeouts(2000, 2000, 3000));
    sleep(OTG_STEP_DELAY_MS);

    _ok("clickPoint", otgEvent.clickPoint(200, 300));
    sleep(OTG_STEP_DELAY_MS);

    _ok("doubleClickPoint", otgEvent.doubleClickPoint(400, 500));
    sleep(OTG_STEP_DELAY_MS);

    _ok("press(600ms)", otgEvent.press(600, 700, 5000));
    sleep(OTG_STEP_DELAY_MS);

    _ok("swipe", otgEvent.swipe(OTG_TEST_X, OTG_TEST_Y, OTG_TEST_X2, OTG_TEST_Y2, 400));
    sleep(OTG_STEP_DELAY_MS);

    _ok("touchDown", otgEvent.touchDown(OTG_TEST_X, OTG_TEST_Y));
    sleep(OTG_STEP_DELAY_MS);
    _ok("touchMove(pressed=true)", otgEvent.touchMove(OTG_TEST_X + 30, OTG_TEST_Y + 30));
    sleep(OTG_STEP_DELAY_MS);
    _ok("touchMove(pressed=false)", otgEvent.touchMove(OTG_TEST_X + 60, OTG_TEST_Y + 60));
    sleep(OTG_STEP_DELAY_MS);
    _ok("touchUp", otgEvent.touchUp(OTG_TEST_X + 60, OTG_TEST_Y + 60));
    sleep(OTG_STEP_DELAY_MS);

    if (OTG_TEST_RUN_NAV_KEYS) {
        _ok("systemKey(home)", otgEvent.systemKey("home"));
        sleep(OTG_STEP_DELAY_MS);
        _ok("systemKey(back)", otgEvent.systemKey("back"));
        sleep(OTG_STEP_DELAY_MS);
        _ok("systemKey(recents)", otgEvent.systemKey("recents"));
        sleep(OTG_STEP_DELAY_MS);

        _ok("recents()", otgEvent.recents());
        sleep(OTG_STEP_DELAY_MS);
        _ok("back()", otgEvent.back());
        sleep(OTG_STEP_DELAY_MS);
        _ok("home()", otgEvent.home());
        sleep(OTG_STEP_DELAY_MS);
    } else {
        logd("[OTG-TEST] skip systemKey / recents / back / home (set OTG_TEST_RUN_NAV_KEYS = true to run)");
    }

    _ok("keyPressChar a", otgEvent.keyPressChar("", "a"));
    sleep(OTG_STEP_DELAY_MS);
    _ok("keyPress 97 (a)", otgEvent.keyPress("", 97));
    sleep(OTG_STEP_DELAY_MS);

    var seq = [
        {"action": 0, "x": OTG_TEST_X, "y": OTG_TEST_Y, "pointer": 1, "delay": 40},
        {"action": 2, "x": OTG_TEST_X + 50, "y": OTG_TEST_Y + 50, "pointer": 1, "delay": 40},
        {"action": 2, "x": OTG_TEST_X + 100, "y": OTG_TEST_Y + 100, "pointer": 1, "delay": 40},
        {"action": 1, "x": OTG_TEST_X + 100, "y": OTG_TEST_Y + 100, "pointer": 1, "delay": 40}
    ];
    _ok("multiTouch", otgEvent.multiTouch(seq, 5000));
    sleep(OTG_STEP_DELAY_MS);

    _ok("close", otgEvent.close());
    sleep(OTG_STEP_DELAY_MS);

    logd("[OTG-TEST] ========== end ==========");
}

runOtgEventTests();
```

## connectFirst 连接第一个串口设备 ​

- 连接第一个 串口设备
- 适配版本 EC 安卓 11.40.0+
- 注意：如果没有授权，会弹权限框，此时会返回错误信息，授权后再调用一次即可
- @return `{null|string}` null 代表成功，其他代表错误消息

```
    // 参开 init 函数例子 
```

## isConnected 连接状态 ​

- 连接状态
- 适配版本 EC 安卓 11.40.0+
- @return `{boolean}` true 代表链接成功

```
    // 参开 init 函数例子 
```

## setTimeouts 设置超时 ​

- 设置超时（全局生效）
- 适配版本 EC 安卓 11.40.0+
- @param writeTimeoutMs 写入超时（ms），默认 1000
- @param replyTimeoutMs 等待回复超时（ms），默认 2000
- @param durationExtraTimeoutMs 对 press/swipe 等带 duration 的动作额外等待（ms），默认 3000
- @return `{null|string}` null和空代表成功，其他代表错误信息

```
    // 参开 init 函数例子 
```

## clickPoint 点击 ​

- 点击
- 适配版本 EC 安卓 11.40.0+
- @param x x坐标
- @param y y坐标
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 init 函数例子 
```

## press 长按 ​

- 长按
- 适配版本 EC 安卓 11.40.0+
- @param x x坐标
- @param y y坐标
- @param holdMs 延迟时间 单位毫秒
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 init 函数例子 
```

## doubleClick 双击 ​

- 双击
- 适配版本 EC 安卓 11.40.0+
- @param x x坐标
- @param y y坐标
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 init 函数例子 
```

## touchDown 按下 ​

- 按下
- 适配版本 EC 安卓 11.40.0+
- @param x x坐标
- @param y y坐标
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 init 函数例子 
```

## touchMove 移动 ​

- 移动
- 适配版本 EC 安卓 11.40.0+
- @param x x坐标
- @param y y坐标
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 init 函数例子 
```

## touchUp 抬起 ​

- 抬起
- 适配版本 EC 安卓 11.40.0+
- @param x x坐标
- @param y y坐标
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 init 函数例子 
```

## swipe 滑动 ​

- 滑动
- 适配版本 EC 安卓 11.40.0+
- @param x x坐标
- @param y y坐标
- @param ex 终点x坐标
- @param ey 终点y坐标
- @param delay 总计滑动时间单位是毫秒
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 init 函数例子 
```

## multiTouch 多点触摸 ​

- 多点触摸
- 适配版本 EC 安卓 11.40.0+
- 触摸参数: action :一般情况下 按下为0，弹起为1，移动为2
- x: X坐标
- y: Y坐标
- pointer：设置第几个手指触摸点，分别是 1，2，3 等，代表第n个手指
- delay: 该动作延迟多少毫秒执行, 大于40ms，否则可能出现坐标漂移的现象
- @param touch1 第1个手指的触摸点数组,例如： `[{"action":0,"x":1,"y":1,"pointer":1,"delay":30},{"action":2,"x":1,"y":1,"pointer":1,"delay":30}]`
- @param timeout 多点触摸执行的超时时间，单位是毫秒
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 init 函数例子 
```

## systemKey 系统按键 ​

- 系统按键
- 适配版本 EC 安卓 11.40.0+
- @param key 值有=home back recents
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 init 函数例子 
```

## recents 任务列表 ​

- 任务列表
- 可能在有的手机不生效，因为不是标准按键
- 适配版本 EC 安卓 11.40.0+
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 init 函数例子 
```

## back 返回 ​

- 返回
- 适配版本 EC 安卓 11.40.0+
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 init 函数例子 
```

## home 主页 ​

- 主页
- 适配版本 EC 安卓 11.40.0+
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 init 函数例子 
```

## keyPress 键盘按键 ​

- 键盘按键
- 适配版本 EC 安卓 11.40.0+
- @param prefix 值分别有，不写或者null默认就是普通的按键， alt=按住alt键,ctrl=按住ctrl键,gui=按住win键,r_ctrl=按住右侧的ctrl键,r_shift=按住右侧的shift键,shift=按住shift键
- @param code ascii码，直接百度即可
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 init 函数例子 
```

## keyPressChar 键盘按键字符 ​

- 键盘按键字符
- 适配版本 EC 安卓 11.40.0+
- @param prefix 值分别有，不写或者null默认就是普通的按键， alt=按住alt键,ctrl=按住ctrl键,gui=按住win键,r_ctrl=按住右侧的ctrl键,r_shift=按住右侧的shift键,shift=按住shift键
- @param c 单个字符，例如 a，系统内部自动转换为 ascii码，参开地址 [https://tool.oschina.net/commons?type=4](https://tool.oschina.net/commons?type=4)
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
// 参开 init 函数例子 
```

## getMacAddress 固件MAC地址 ​

- 读取固件MAC地址
- 适配版本 EC 安卓 11.41.0+
- @returns `{string|null}` 成功为 aa:bb:cc:dd:ee :ff 形式；失败为 null

```
// 参开 init 函数例子 
```
