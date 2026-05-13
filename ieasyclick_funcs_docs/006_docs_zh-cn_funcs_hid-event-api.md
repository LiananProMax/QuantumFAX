本页总览

## 说明 ​

- HID事件模块运行的所有函数，是需要使用EasyClick HID主控程序激活HID后才可以调用的
- HID主控程序使用请看 高级功能 - HID主控用法 : [HID主控](https://ieasyclick.com/docs/zh-cn/advance/hid) 或者使用[HID小主机](https://ieasyclick.com/docs/zh-cn/centerscreen/hidlinux)
- 代理事件模块的对象前缀是 hidEvent，例如 hidEvent.click 这样调用

提示

- EC 10.6.0+新增了通过USB模式直接通信的函数，这样的情况适合手机和HID主控不在一个网络下，弥补网络通信的缺陷，需要配合HID主控v2.2.0+,详细使用教程：[HID USB通信](https://ieasyclick.com/docs/zh-cn/advance/hid)
- 网络模式优势在于不用在手机上确认 配件模式的权限，缺点就是需要网络互通，需要是同一个局域网或者公开IP或使用frp代理转发
- USB模式优势在于不限制网络，确定是需要人工确认配件模式的权限
- USB模式下的函数 都是以ByUsb结尾，请注意！
- 网络模式和USB都可以通过HID高级组网，内部会自动转发数据到从控，具体参考[高级组网](https://ieasyclick.com/docs/zh-cn/advance/hid)
- 在实际使用过程中需要考虑好场景,

提示

- hid只是一种点击模式，无障碍、代理模式、root都含有点击和获取节点功能，如果你用不了节点，就使用图色
- 图色权限请使用 `image.requestScreenCapture` 函数的 type=1 带权限截图方式
- hid除了不能使用节点，其他功能都是一样，无需特殊处理

提示

- HID主控4.0以上支持WINUSB驱动，不需要安装libusb驱动，可直接在win上使用
- HID主控4.0暂不支持usb方式通信，请注意

## HID网络模式函数 ​

### setHidCenter 设置HID主控地址 ​

- 网络模式下使用
- 设置HID主控地址
- 适配版本 EC 安卓 9.15.0+
- @param hidCenterUrl HID主控程序运行的网址
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
}

function initHid() {
    // 先设置一下局域网内的HID程序地址，也可以通过FRP软件映射到外网，然后填写外网地址
    hidEvent.setHidCenter("http://192.168.2.14:8988")
    hidEvent.closeUsbDevice();
    sleep(3000)
    let init = hidEvent.initUsbDevice()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
   
    return true;
}

main();
```

### initUsbDevice 初始化HID设备 ​

- 网络模式下使用
- 初始化HID设备
- 适配版本 EC 安卓 9.15.0+
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
}

function initHid() {
    // 先设置一下局域网内的HID程序地址，也可以通过FRP软件映射到外网，然后填写外网地址
    hidEvent.setHidCenter("http://192.168.2.14:8988")
    hidEvent.closeUsbDevice();
    sleep(3000)
    let init = hidEvent.initUsbDevice()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
   
    return true;
}

main();
```

### checkFirstPoint 矫正HID坐标 ​

- 网络模式下使用,已经过期了，v2.0.0+HID无需矫正坐标
- 调用 initUsbDevice 再调用这个函数
- 如果HID主控是2.0以上版本 这个函数不用调用了，无需矫正坐标直接点击等动作
- 适配版本 EC 安卓 9.15.0+
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
}

function initHid() {
    // 先设置一下局域网内的HID程序地址，也可以通过FRP软件映射到外网，然后填写外网地址
    hidEvent.setHidCenter("http://192.168.2.14:8988")
    hidEvent.closeUsbDevice();
    let init = hidEvent.initUsbDevice()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
    // 开始矫正屏幕坐标
    // 如果HID主控是2.0以上版本 这个函数不用调用了
    let po = hidEvent.checkFirstPoint()
    if (po == null) {
        logd("矫正坐标成功")
    } else {
        loge("矫正坐标失败:" + init);
        return false
    }
    return true;
}

main();
```

### closeUsbDevice 关闭HID设备 ​

- 网络模式下使用
- 关闭HID设备
- 该操作会取消HID主控和设备的通信，在适当的时候进行操作
- 适配版本 EC 安卓 9.15.0+
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
}

function initHid() {
    // 先设置一下局域网内的HID程序地址，也可以通过FRP软件映射到外网，然后填写外网地址
    hidEvent.setHidCenter("http://192.168.2.14:8988")
    hidEvent.closeUsbDevice();
    sleep(3000)
    let init = hidEvent.initUsbDevice()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
   
    return true;
}

main();
```

### clickPoint 点击坐标 ​

- 网络模式下使用
- 适配版本 EC 安卓 9.15.0+
- @param x x坐标
- @param y y坐标
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
    // 点击坐标 0,0的地方
    let click = hidEvent.clickPoint(device.getScreenWidth(), device.getScreenHeight())
    if (click == null) {
        logd("点击坐标成功")
    } else {
        console.log("点击坐标失败" + click)
    }
    sleep(1000)
    let doub = hidEvent.doubleClickPoint(300, 400)
    if (doub == null) {
        logd("双击坐标成功")
    } else {
        console.log("双击坐标失败" + doub)
    }

    sleep(1000)
    let ps = hidEvent.press(600, 800, 2000)
    if (ps == null) {
        logd("长按 坐标成功")
    } else {
        console.log("长按 坐标失败" + ps)
    }

    sleep(1000)
    let ps1 = hidEvent.press(device.getScreenWidth(), device.getScreenHeight(), 2000)
    if (ps1 == null) {
        logd("长按 坐标成功")
    } else {
        console.log("长按 坐标失败" + ps1)
    }


    mtouch()


}

function initHid() {
    // 先设置一下局域网内的HID程序地址，也可以通过FRP软件映射到外网，然后填写外网地址
    hidEvent.setHidCenter("http://192.168.2.14:8988")
    hidEvent.closeUsbDevice();
    sleep(3000)
    let init = hidEvent.initUsbDevice()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
  
    return true;
}


function mtouch() {
    let data = [
        {"action": 0, "x": 250, "y": 1800, "pointer": 1, "delay": 100},
        {"action": 2, "x": 250, "y": 1700, "pointer": 1, "delay": 100},
        {"action": 2, "x": 300, "y": 1700, "pointer": 1, "delay": 100},
        {"action": 2, "x": 330, "y": 1650, "pointer": 1, "delay": 200},
        {"action": 2, "x": 400, "y": 1650, "pointer": 1, "delay": 100},
        {"action": 1, "x": 600, "y": 400, "pointer": 1, "delay": 100}
    ]

    let tou = hidEvent.multiTouch(data, 1000)
    if (tou == null) {
        logd("多点触摸 成功")
    } else {
        loge("多点触摸 失败:" + tou);
        return false
    }
}


main();
```

### doubleClickPoint 双击坐标 ​

- 适配版本 EC 安卓 9.15.0+
- @param x x坐标
- @param y y坐标
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
    // 点击坐标 0,0的地方
    let click = hidEvent.clickPoint(device.getScreenWidth(), device.getScreenHeight())
    if (click == null) {
        logd("点击坐标成功")
    } else {
        console.log("点击坐标失败" + click)
    }
    sleep(1000)
    let doub = hidEvent.doubleClickPoint(300, 400)
    if (doub == null) {
        logd("双击坐标成功")
    } else {
        console.log("双击坐标失败" + doub)
    }

    sleep(1000)
    let ps = hidEvent.press(600, 800, 2000)
    if (ps == null) {
        logd("长按 坐标成功")
    } else {
        console.log("长按 坐标失败" + ps)
    }

    sleep(1000)
    let ps1 = hidEvent.press(device.getScreenWidth(), device.getScreenHeight(), 2000)
    if (ps1 == null) {
        logd("长按 坐标成功")
    } else {
        console.log("长按 坐标失败" + ps1)
    }


    mtouch()


}

function initHid() {
    // 先设置一下局域网内的HID程序地址，也可以通过FRP软件映射到外网，然后填写外网地址
    hidEvent.setHidCenter("http://192.168.2.14:8988")
    hidEvent.closeUsbDevice();
    sleep(3000)
    let init = hidEvent.initUsbDevice()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
   
    return true;
}


function mtouch() {
    let data = [
        {"action": 0, "x": 250, "y": 1800, "pointer": 1, "delay": 100},
        {"action": 2, "x": 250, "y": 1700, "pointer": 1, "delay": 100},
        {"action": 2, "x": 300, "y": 1700, "pointer": 1, "delay": 100},
        {"action": 2, "x": 330, "y": 1650, "pointer": 1, "delay": 200},
        {"action": 2, "x": 400, "y": 1650, "pointer": 1, "delay": 100},
        {"action": 1, "x": 600, "y": 400, "pointer": 1, "delay": 100}
    ]

    let tou = hidEvent.multiTouch(data, 1000)
    if (tou == null) {
        logd("多点触摸 成功")
    } else {
        loge("多点触摸 失败:" + tou);
        return false
    }
}


main();
```

### press 长按坐标 ​

- 网络模式下使用
- 长按坐标
- 适配版本 EC 安卓 9.15.0+
- @param x x坐标
- @param y y坐标
- @param delay 按住时间，单位是毫秒
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
    // 点击坐标 0,0的地方
    let click = hidEvent.clickPoint(device.getScreenWidth(), device.getScreenHeight())
    if (click == null) {
        logd("点击坐标成功")
    } else {
        console.log("点击坐标失败" + click)
    }
    sleep(1000)
    let doub = hidEvent.doubleClickPoint(300, 400)
    if (doub == null) {
        logd("双击坐标成功")
    } else {
        console.log("双击坐标失败" + doub)
    }

    sleep(1000)
    let ps = hidEvent.press(600, 800, 2000)
    if (ps == null) {
        logd("长按 坐标成功")
    } else {
        console.log("长按 坐标失败" + ps)
    }

    sleep(1000)
    let ps1 = hidEvent.press(device.getScreenWidth(), device.getScreenHeight(), 2000)
    if (ps1 == null) {
        logd("长按 坐标成功")
    } else {
        console.log("长按 坐标失败" + ps1)
    }


    mtouch()


}

function initHid() {
    // 先设置一下局域网内的HID程序地址，也可以通过FRP软件映射到外网，然后填写外网地址
    hidEvent.setHidCenter("http://192.168.2.14:8988")
    hidEvent.closeUsbDevice();
    sleep(3000)
    let init = hidEvent.initUsbDevice()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
  
    return true;
}


function mtouch() {
    let data = [
        {"action": 0, "x": 250, "y": 1800, "pointer": 1, "delay": 100},
        {"action": 2, "x": 250, "y": 1700, "pointer": 1, "delay": 100},
        {"action": 2, "x": 300, "y": 1700, "pointer": 1, "delay": 100},
        {"action": 2, "x": 330, "y": 1650, "pointer": 1, "delay": 200},
        {"action": 2, "x": 400, "y": 1650, "pointer": 1, "delay": 100},
        {"action": 1, "x": 600, "y": 400, "pointer": 1, "delay": 100}
    ]

    let tou = hidEvent.multiTouch(data, 1000)
    if (tou == null) {
        logd("多点触摸 成功")
    } else {
        loge("多点触摸 失败:" + tou);
        return false
    }
}


main();
```

### multiTouch 多点触摸 ​

- 网络模式下使用
- 多点触摸
- 适配版本 EC 安卓 9.15.0+
- 触摸参数: action :一般情况下 按下为0，弹起为1，移动为2
- x: X坐标
- y: Y坐标
- pointer：设置第几个手指触摸点，分别是 1，2，3等，代表第n个手指
- delay: 该动作延迟多少毫秒执行
- @param touch1 第1个手指的触摸点数组,例如： `[{"action":0,"x":1,"y":1,"pointer":1,"delay":20},{"action":2,"x":1,"y":1,"pointer":1,"delay":20}]`
- @param timeout 多点触摸执行的超时时间，单位是毫秒
- @return `{boolean|布尔型}`

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
    // 点击坐标 0,0的地方
    let click = hidEvent.clickPoint(device.getScreenWidth(), device.getScreenHeight())
    if (click == null) {
        logd("点击坐标成功")
    } else {
        console.log("点击坐标失败" + click)
    }
    sleep(1000)
    let doub = hidEvent.doubleClickPoint(300, 400)
    if (doub == null) {
        logd("双击坐标成功")
    } else {
        console.log("双击坐标失败" + doub)
    }

    sleep(1000)
    let ps = hidEvent.press(600, 800, 2000)
    if (ps == null) {
        logd("长按 坐标成功")
    } else {
        console.log("长按 坐标失败" + ps)
    }

    sleep(1000)
    let ps1 = hidEvent.press(device.getScreenWidth(), device.getScreenHeight(), 2000)
    if (ps1 == null) {
        logd("长按 坐标成功")
    } else {
        console.log("长按 坐标失败" + ps1)
    }


    mtouch()


}

function initHid() {
    // 先设置一下局域网内的HID程序地址，也可以通过FRP软件映射到外网，然后填写外网地址
    hidEvent.setHidCenter("http://192.168.2.14:8988")
    sleep(3000)
    hidEvent.closeUsbDevice();
    let init = hidEvent.initUsbDevice()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
  
    return true;
}


function mtouch() {
    let data = [
        {"action": 0, "x": 250, "y": 1800, "pointer": 1, "delay": 100},
        {"action": 2, "x": 250, "y": 1700, "pointer": 1, "delay": 100},
        {"action": 2, "x": 300, "y": 1700, "pointer": 1, "delay": 100},
        {"action": 2, "x": 330, "y": 1650, "pointer": 1, "delay": 200},
        {"action": 2, "x": 400, "y": 1650, "pointer": 1, "delay": 100},
        {"action": 1, "x": 600, "y": 400, "pointer": 1, "delay": 100}
    ]

    let tou = hidEvent.multiTouch(data, 1000)
    if (tou == null) {
        logd("多点触摸 成功")
    } else {
        loge("多点触摸 失败:" + tou);
        return false
    }
}


main();
```

### swipe 滑动 ​

- 网络模式下使用
- 滑动，自带随机的那种滑动
- 适配版本 EC 安卓 9.36.0+
- @param x 起点x坐标
- @param y 起点y坐标
- @param ex 终点x坐标
- @param ey 终点y坐标
- @param delay 按住时间，单位是毫秒
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
}

function initHid() {
    // 先设置一下局域网内的HID程序地址，也可以通过FRP软件映射到外网，然后填写外网地址
    hidEvent.setHidCenter("http://192.168.2.14:8988")
    hidEvent.closeUsbDevice();
    sleep(3000)
    let init = hidEvent.initUsbDevice()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
    hidEvent.swipe(100, 200, 600, 800, 2000)
    return true;
}

main();
```

### home 主页 ​

- 网络模式下使用
- 适配版本 EC 安卓 10.21.0+
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
}

function initHid() {
    // 先设置一下局域网内的HID程序地址，也可以通过FRP软件映射到外网，然后填写外网地址
    hidEvent.setHidCenter("http://192.168.2.14:8988")
    hidEvent.closeUsbDevice();
    sleep(3000)
    let init = hidEvent.initUsbDevice()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
    let r = hidEvent.home()
    logd(r)
    return true;
}

main();
```

### back 返回 ​

- 网络模式下使用
- 适配版本 EC 安卓 10.21.0+
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
}

function initHid() {
    // 先设置一下局域网内的HID程序地址，也可以通过FRP软件映射到外网，然后填写外网地址
    hidEvent.setHidCenter("http://192.168.2.14:8988")
    hidEvent.closeUsbDevice();
    sleep(3000)
    let init = hidEvent.initUsbDevice()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
    let r = hidEvent.back()
    logd(r)
    return true;
}

main();
```

### openNotification 打开状态栏 ​

- 网络模式下使用
- 适配版本 EC 安卓 10.21.0+
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
}

function initHid() {
    // 先设置一下局域网内的HID程序地址，也可以通过FRP软件映射到外网，然后填写外网地址
    hidEvent.setHidCenter("http://192.168.2.14:8988")
    hidEvent.closeUsbDevice();
    sleep(3000)
    let init = hidEvent.initUsbDevice()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
    let r = hidEvent.openNotification()
    logd(r)
    return true;
}

main();
```

### recentApps 最近任务 ​

- 网络模式下使用
- 适配版本 EC 安卓 10.21.0+
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
}

function initHid() {
    // 先设置一下局域网内的HID程序地址，也可以通过FRP软件映射到外网，然后填写外网地址
    hidEvent.setHidCenter("http://192.168.2.14:8988")
    hidEvent.closeUsbDevice();
    sleep(3000)
    let init = hidEvent.initUsbDevice()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
    let r = hidEvent.recentApps()
    logd(r)
    return true;
}

main();
```

## HID-USB模式函数 ​

### initUsbDeviceByUsb 初始化HID设备 ​

- [USB模式]初始化HID设备
- 适配版本 EC 安卓 10.6.0+
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
}

function initHid() {
    let init = hidEvent.initUsbDeviceByUsb()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
    let swipe = hidEvent.swipeByUsb(100, 200, 600, 800, 2000)
    logd("swipe result " + swipe)
    return true;
}

main();
```

### clickPointByUsb 点击坐标 ​

- [USB模式]点击坐标
- 适配版本 EC 安卓 10.6.0+
- @param x x坐标
- @param y y坐标
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
}

function initHid() {
    let init = hidEvent.initUsbDeviceByUsb()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
    let result = hidEvent.clickPointByUsb(600, 800)
    logd(" result " + result)
    return true;
}

main();
```

### doubleClickPointByUsb 双击坐标 ​

- [USB模式]双击坐标
- 适配版本 EC 安卓 10.6.0+
- @param x x坐标
- @param y y坐标
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
}

function initHid() {
    let init = hidEvent.initUsbDeviceByUsb()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
    let result = hidEvent.doubleClickPointByUsb(600, 800)
    logd(" result " + result)
    return true;
}

main();
```

### pressByUsb 长按坐标 ​

- [USB模式]双击坐标
- 适配版本 EC 安卓 10.6.0+
- @param x x坐标
- @param y y坐标
- @param delay 按住时间，单位是毫秒
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
}

function initHid() {
    let init = hidEvent.initUsbDeviceByUsb()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
    let result = hidEvent.pressByUsb(600, 800, 5000)
    logd(" result " + result)
    return true;
}

main();
```

### multiTouchByUsb 多点触摸 ​

- [USB模式]多点触摸
- 适配版本 EC 安卓 10.6.0+
- 触摸参数: action :一般情况下 按下为0，弹起为1，移动为2
- x: X坐标
- y: Y坐标
- pointer：设置第几个手指触摸点，分别是 1，2，3 等，代表第n个手指
- delay: 该动作延迟多少毫秒执行, 大于40ms，否则可能出现坐标漂移的现象
- @param touch1 第1个手指的触摸点数组,例如： `[{"action":0,"x":1,"y":1,"pointer":1,"delay":30},{"action":2,"x":1,"y":1,"pointer":1,"delay":30}]`
- @param timeout 多点触摸执行的超时时间，单位是毫秒
- @return `{boolean|布尔型}`

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
}

function mtouch() {
    let data = [
        {"action": 0, "x": 250, "y": 1800, "pointer": 1, "delay": 100},
        {"action": 2, "x": 250, "y": 1700, "pointer": 1, "delay": 100},
        {"action": 2, "x": 300, "y": 1700, "pointer": 1, "delay": 100},
        {"action": 2, "x": 330, "y": 1650, "pointer": 1, "delay": 200},
        {"action": 2, "x": 400, "y": 1650, "pointer": 1, "delay": 100},
        {"action": 1, "x": 600, "y": 400, "pointer": 1, "delay": 100}
    ]

    let tou = hidEvent.multiTouchByUsb(data, 1000)
    if (tou == null) {
        logd("多点触摸 成功")
    } else {
        loge("多点触摸 失败:" + tou);
        return false
    }
}

function initHid() {
    let init = hidEvent.initUsbDeviceByUsb()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
    mtouch();
    return true;
}

main();
```

### swipeByUsb 滑动 ​

- [USB模式]滑动
- 适配版本 EC 安卓 10.6.0+
- @param x 起点x坐标
- @param y 起点y坐标
- @param ex 终点x坐标
- @param ey 终点y坐标
- @param delay 按住时间，单位是毫秒
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
}

function initHid() {
    let init = hidEvent.initUsbDeviceByUsb()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
    let swipe = hidEvent.swipeByUsb(100, 200, 600, 800, 2000)
    logd("swipe result " + swipe)
    return true;
}

main();
```

### homeByUsb 主页 ​

- USB模式下使用
- 适配版本 EC 安卓 10.21.0+
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
}

function initHid() {
    let init = hidEvent.initUsbDeviceByUsb()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
    let r = hidEvent.homeByUsb()
    logd(r)
    return true;
}

main();
```

### backByUsb 返回 ​

- USB模式下使用
- 适配版本 EC 安卓 10.21.0+
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
}

function initHid() {
    let init = hidEvent.initUsbDeviceByUsb()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
    let r = hidEvent.backByUsb()
    logd(r)
    return true;
}

main();
```

### openNotificationByUsb 打开状态栏 ​

- USB模式下使用
- 适配版本 EC 安卓 10.21.0+
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
}

function initHid() {
    let init = hidEvent.initUsbDeviceByUsb()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
    let r = hidEvent.openNotificationByUsb()
    logd(r)
    return true;
}

main();
```

### recentAppsByUsb 最近任务 ​

- USB模式下使用
- 适配版本 EC 安卓 10.21.0+
- @return `{string}` null 代表成功，其他代表错误消息

```
function main() {
    let i = initHid()
    if (!i) {
        return
    }
}

function initHid() {
    let init = hidEvent.initUsbDeviceByUsb()
    if (init == null) {
        logd("初始化HID设备成功")
    } else {
        loge("初始化失败:" + init);
        return false
    }
    let r = hidEvent.recentAppsByUsb()
    logd(r)
    return true;
}

main();
```
