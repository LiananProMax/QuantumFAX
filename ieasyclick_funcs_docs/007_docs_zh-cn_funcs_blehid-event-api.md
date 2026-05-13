本页总览

## 说明 ​

- 蓝牙HID事件模块运行的所有函数，需要借助硬件的方式才能使用
- 具体请看蓝牙HID配置 高级功能 - 蓝牙HID硬件 : [蓝牙HID硬件](https://ieasyclick.com/docs/zh-cn/advance/blehid)
- 代理事件模块的对象前缀是 bleEvent，例如 bleEvent.click 这样调用

提示

- ble hid只是一种点击模式，无障碍、代理模式、root都含有点击和获取节点功能，如果你用不了节点，就使用图色
- 图色权限请使用 `image.requestScreenCapture` 函数的 type=1 带权限截图方式
- ble hid除了不能使用节点，其他功能都是一样，无需特殊处理

## startConnect 连接蓝牙设备 ​

- 连接蓝牙设备
- 这个可以不在app设置中预设置，这个函数带扫描链接保存的
- 如果不想一个个配置，就使用这个函数
- 适配版本 EC 安卓 11.37.0+
- @param bleDeviceName 蓝牙设备名称，不写就从app系统设置中读取，开发板mac地址的后8位，全部小写
- @param save 是否保存到app设置的 蓝牙设备名称，如果想存储到系统设置，就写true
- @param timeout 链接超时时间 单位是毫秒
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
function main() {
    logd("开始链接ble...")
    let cr = connect_ble();
    if (cr == null || cr == "") {
        logd("链接ble成功")
    } else {
        logw("链接ble失败 " + cr)
        return
    }
    sleep(1000)
    // 可以进入开发者选项 开启指针看点击效果
    logd("开始测试 clickPoint")
    // let crc = bleEvent.clickPoint(399, 4525);
    // if (crc == null || crc == "") {
    //     logd("点击成功 ")
    // } else {
    //     logd("点击失败 " + crc)
    // }
    // sleep(3000)
    // logd("开始测试 press")
    // let crc2 = bleEvent.press(399, 455, 5000);
    // if (crc2 == null || crc2 == "") {
    //     logd("press 成功 ")
    // } else {
    //     logd("press 失败 " + crc2)
    // }
    // sleep(6000)
    // sleep(1000)
    // logd("开始测试 doubleClick")
    // let doubleClickr = bleEvent.doubleClick(666, 1000, 30);
    // if (doubleClickr == null || doubleClickr == "") {
    //     logd("doubleClick 成功 ")
    // } else {
    //     logd("doubleClick 失败 " + doubleClickr)
    // }
    // sleep(6000)
    //
    // test_Swipe();
    // touchTest()
    // mtouch();
    test_Swipe();
    testSystemKey();
    
    // 输入a这个字符
    bleEvent.keyPressChar("","a")
    
    testPressKey();
    //bleEvent.stopConnect()
    sleep(100000)
    logd("0---end ");
}


function testPressKey() {
    sleep(1000)
    let press_a = bleEvent.keyPress("", 65);
    console.log("press_a {}", press_a)
}

function testSystemKey() {

    sleep(1000)

    logd("home " + bleEvent.home())
    sleep(1000)

    logd("back " + bleEvent.back())

    sleep(1000)
    logd("recents " + bleEvent.recents())

}

function test_Swipe() {
    sleep(1000)
    let td = bleEvent.swipe(300, 400, 500, 600, 5000)
    logd("swipe result: " + td)
    sleep(6000)
}

function mtouch() {
    sleep(1000)

    let data = [
        {"action": 0, "x": 250, "y": 1800, "pointer": 1, "delay": 100},
        {"action": 2, "x": 250, "y": 1700, "pointer": 1, "delay": 100},
        {"action": 2, "x": 330, "y": 1650, "pointer": 1, "delay": 200},
        {"action": 2, "x": 330, "y": 1640, "pointer": 1, "delay": 200},
        {"action": 2, "x": 330, "y": 1620, "pointer": 1, "delay": 200},
        {"action": 2, "x": 322, "y": 1500, "pointer": 1, "delay": 200},
        {"action": 2, "x": 322, "y": 1400, "pointer": 1, "delay": 200},
        {"action": 2, "x": 334, "y": 1000, "pointer": 1, "delay": 200},
        {"action": 2, "x": 339, "y": 1000, "pointer": 1, "delay": 200},
        {"action": 2, "x": 330, "y": 1000, "pointer": 1, "delay": 200},
        {"action": 2, "x": 453, "y": 1000, "pointer": 1, "delay": 200},
        {"action": 2, "x": 555, "y": 1000, "pointer": 1, "delay": 200},
        {"action": 2, "x": 557, "y": 600, "pointer": 1, "delay": 200},
        {"action": 1, "x": 600, "y": 400, "pointer": 1, "delay": 100}
    ]

    let tou = bleEvent.multiTouch(data, 1000)
    sleep(5000)
    if (tou == null) {
        logd("多点触摸 成功")
    } else {
        loge("多点触摸 失败:" + tou);
        return false
    }
}

function touchTest() {
    sleep(6000)
    let td = bleEvent.touchDown(300, 400)
    console.log(" touchDown result " + td)
    sleep(1000)
    bleEvent.touchMove(350, 460)
    sleep(1000)
    bleEvent.touchMove(400, 500)
    sleep(1000)
    logd("touchUp " + bleEvent.touchUp(400, 500))
}


/**
 * 链接ble
 * @returns {null}
 */
function connect_ble() {
    if (bleEvent.isConnected()) {
        return null;
    }
    bleEvent.stopConnect();
    return bleEvent.startConnect("", false, 15000);

}

// 正常设备无需调用
// bleEvent.setWidthEqualsHeight(true)

main()
```

## stopConnect 断开连接 ​

- 断开连接
- 适配版本 EC 安卓 11.37.0+
- @return `{string}` null 代表成功，其他代表错误消息

```
    // 参开 startConnect 函数例子 
```

## setHeartbeatTimeout 断开连接 ​

- 设置心跳超时时间
- 与设备心跳时间超过了设定的，代表链接断开了，默认是30s
- @param tt 超时时间，单位是毫秒
- 适配版本 EC 安卓 11.37.0+

```
    // 参开 startConnect 函数例子 
```

## isConnected 链接状态 ​

- 链接状态
- 适配版本 EC 安卓 11.37.0+
- @returns `{boolean}` true 代表已经链接 false代表未链接

```
    // 参开 startConnect 函数例子 
```

## setWidthEqualsHeight 坐标系的宽度等于高度 ​

- 设置坐标系的宽度等于高度
- 一般不用设置，如果发现坐标点点击不对可以设置，例如iqoo系列需要设置
- 适配版本 EC 安卓 11.37.0+
- @param r true代表是
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 startConnect 函数例子 
```

## clickPoint 点击 ​

- 点击
- 适配版本 EC 安卓 11.37.0+
- @param x x坐标
- @param y y坐标
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 startConnect 函数例子 
```

## press 长按 ​

- 长按
- 注意，这个由于和脚本是异步的，调用后请sleep(delay)这么长时间 防止事件冲突
- 适配版本 EC 安卓 11.37.0+
- @param x x坐标
- @param y y坐标
- @param delay 延迟时间 单位毫秒
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 startConnect 函数例子 
```

## doubleClick 双击 ​

- 双击
- 适配版本 EC 安卓 11.37.0+
- @param x x坐标
- @param y y坐标
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 startConnect 函数例子 
```

## touchDown 按下 ​

- 按下
- 适配版本 EC 安卓 11.37.0+
- @param x x坐标
- @param y y坐标
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 startConnect 函数例子 
```

## touchMove 移动 ​

- 移动
- 适配版本 EC 安卓 11.37.0+
- @param x x坐标
- @param y y坐标
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 startConnect 函数例子 
```

## touchUp 抬起 ​

- 抬起
- 适配版本 EC 安卓 11.37.0+
- @param x x坐标
- @param y y坐标
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 startConnect 函数例子 
```

## swipe 滑动 ​

- 滑动
- 注意，这个由于和脚本是异步的，调用后请sleep(delay)这么长时间 防止事件冲突
- 适配版本 EC 安卓 11.37.0+
- @param x x坐标
- @param y y坐标
- @param ex 终点x坐标
- @param ey 终点y坐标
- @param delay 总计滑动时间单位是毫秒
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 startConnect 函数例子 
```

## multiTouch 多点触摸 ​

- 多点触摸
- 注意，这个由于和脚本是异步的，调用后请sleep滑动总时间 防止事件冲突
- 适配版本 EC 安卓 11.37.0+
- 触摸参数: action :一般情况下 按下为0，弹起为1，移动为2
- x: X坐标
- y: Y坐标
- pointer：设置第几个手指触摸点，分别是 1，2，3 等，代表第n个手指
- delay: 该动作延迟多少毫秒执行, 大于40ms，否则可能出现坐标漂移的现象
- @param touch1 第1个手指的触摸点数组,例如：`[{"action":0,"x":1,"y":1,"pointer":1,"delay":30},{"action":2,"x":1,"y":1,"pointer":1,"delay":30}]`
- @param timeout 多点触摸执行的超时时间，单位是毫秒
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 startConnect 函数例子 
```

## systemKey 系统按键 ​

- 系统按键
- 适配版本 EC 安卓 11.37.0+
- @param key 值有=home back recents
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 startConnect 函数例子 
```

## recents 任务列表 ​

- 任务列表
- 可能在有的手机不生效，因为不是标准按键
- 适配版本 EC 安卓 11.37.0+
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 startConnect 函数例子 
```

## back 返回 ​

- 返回
- 适配版本 EC 安卓 11.37.0+
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 startConnect 函数例子 
```

## home 主页 ​

- 主页
- 适配版本 EC 安卓 11.37.0+
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 startConnect 函数例子 
```

## keyPress 键盘按键 ​

- 键盘按键
- 适配版本 EC 安卓 11.37.0+
- @param prefix 值分别有，不写或者null默认就是普通的按键， alt=按住alt键,ctrl=按住ctrl键,gui=按住win键,r_ctrl=按住右侧的ctrl键,r_shift=按住右侧的shift键,shift=按住shift键
- @param code ascii码，直接百度即可
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 参开 startConnect 函数例子 
```

## keyPressChar 键盘按键字符 ​

- 键盘按键字符
- 适配版本 EC 安卓 11.37.0+
- @param prefix 值分别有，不写或者null默认就是普通的按键， alt=按住alt键,ctrl=按住ctrl键,gui=按住win键,r_ctrl=按住右侧的ctrl键,r_shift=按住右侧的shift键,shift=按住shift键
- @param c 单个字符，例如 a，系统内部自动转换为 ascii码，参开地址 [https://tool.oschina.net/commons?type=4](https://tool.oschina.net/commons?type=4)
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    
    // 参开 startConnect 函数例子 
```

## hideBleName 隐藏蓝牙的名称 ​

- 隐藏蓝牙的名称
- 防止被搜索到
- 适配版本 EC 安卓 11.38.0+
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 结合 startConnect 例子
    // 链接成功后 调用
    bleEvent.hideBleName();
    sleep(1000)
    // 多调用一次
    let cr = bleEvent.hideBleName();
    if (cr == null || cr == "") {
        logd("隐藏成功")
    } else {
        logw("隐藏失败 " + cr)
        return
    }
```

## showBleName 显示蓝牙的名称 ​

- 显示蓝牙的名称
- 如果蓝牙通信不成功，可能导致不能显示，那就手动重启一下开发板
- 适配版本 EC 安卓 11.38.0+
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 结合 startConnect 例子
    // 链接成功后 调用
    bleEvent.showBleName();
    sleep(1000)
    // 多调用一次
    let cr = bleEvent.showBleName();
    if (cr == null || cr == "") {
        logd("成功")
    } else {
        logw("失败 " + cr)
        return
    }
```

## showBleName 显示蓝牙的名称 ​

- 显示蓝牙的名称
- 如果蓝牙通信不成功，可能导致不能显示，那就手动重启一下开发板
- 适配版本 EC 安卓 11.38.0+
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 结合 startConnect 例子
    // 链接成功后 调用
    bleEvent.showBleName();
    sleep(1000)
    // 多调用一次
    let cr = bleEvent.showBleName();
    if (cr == null || cr == "") {
        logd("成功")
    } else {
        logw("失败 " + cr)
        return
    }
```

## getConfigBleName 获取app配置的蓝牙名称 ​

- 获取app配置的蓝牙名称
- 适配版本 EC 安卓 11.38.0+
- @returns `{string|null}` 名称字符串

```
    let cr = bleEvent.getConfigBleName();
    logd("cr "+cr)
```

## setWifi 设置WIFI ​

- 设置WIFI
- 适配版本 EC 安卓 11.39.0+
- 设置完成后需要重启开发板才能联网
- @param name WiFi 名称
- @param pwd Wifi 密码
- @returns `{string|null}`null或者空代表正常 其他代表错误信息

```
    // 蓝牙连接成功后 调用这个函数

    let cr = bleEvent.setWifi("112","333");
    logd("cr "+cr)
```

## reset 重启开发板 ​

- 重启开发板
- 适配版本 EC 安卓 11.39.0+
- @returns `{string|null}` null或者空代表正常 其他代表错误信息

```
    // 蓝牙连接成功后 调用这个函数
    let cr = bleEvent.reset();
    logd("cr "+cr)
```
