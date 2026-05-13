本页总览

## 说明 ​

- Adb交互模块主要是通过无线调试方式链接adb，执行各种adb命令
- 不需要插入数据线

提示

- 如果低于安卓11的手机，请使用电脑的方式开启网络调试，命令是 adb tcpip 5555 如果没有条件下载adb开启网络调试功能 可以进入这个网页，在线开启网络调试 --> [https://adb.ieasyclick.com/](https://adb.ieasyclick.com/)
- 如果高于等于安卓11，直接进入手机设置页面-开发者选项-无线调试打开-使用配对码配对设备
- 由于需要配对，通过app的系统设置，ADB无线调试功能，跟着提示进行扫描链接，再通过函数进行执行adb其他命令
- 安卓11以上是配对方式，安卓11以下是扫描授权方式
- 连接过或者配对过的，一般只需要链接历史记录函数链接成功，即可在脚本中使用，无需二次配对

## adbClient.connectHistory 链接历史记录 ​

- 链接历史记录
- 适配EC 安卓 11.33.0+
- @param timeout 超时单位是毫秒
- @returns `{*|boolean}` true代表链接成功 false代表失败

```
function testadb() {

    adbClient.closeAdbConnect();

    let connected = adbClient.connectHistory(10000)
    logd("connectHistory " + connected)
    if (connected) {
        logd("adb链接上了")
        let lsr = adbClient.runShell("ls -alh /sdcard/", 30000)
        // 重启
        //adbClient.runShell("reboot",10000)
        logd(lsr)
        startEnvNow();
        return;
    }


    let scanResult = "";

    if (device.getSdkInt() > 29) {
        scanResult = adbClient.startScan(0, 0, 60 * 1000)
    } else {
        logd("开始扫描...如果手机上有授权弹窗，请允许")
        scanResult = adbClient.startScan(5555, 6000, 60 * 1000)
    }
    logd("扫描结果信息: " + scanResult)
    if (scanResult == null || scanResult == undefined || scanResult == "") {
        logd("扫描没有任何信息")
        return;
    }
    let scr = JSON.parse(scanResult)
    if (scr["code"] != 0) {
        // 没有扫描信息
        logd("扫描错误: " + scr["msg"])
        return;
    }

    logd("adb链接成功")
    startEnvNow();
}

function startEnvNow() {
    if (!adbClient.isAdbConnected()) {
        logw("adb未链接，请重新链接")
        return false;
    }
    let act = adbClient.activeSelf(1, 20000)
    logd("自激活结果: " + act)
    if (act == null || act == undefined || act == "") {
        logd("自激活结果 没有任何信息")
        return false;
    }
    let act2 = JSON.parse(act)
    if (act2["code"] != 0) {
        // 没有扫描信息
        logd("自激活结果错误: " + act2["msg"])
        return false;
    }
    logd("启动自动化环境")
    let str = startEnv()
    logd("启动自动化环境: " + str)
    return str;
}


function main() {

    testadb();

    //logd(adbClient.openNotificationPermissionPage())

}


main();
```

## adbClient.startScan 开始扫描 ​

- 开始扫描
- 高于安卓11的，端口参数不写，走的是配对模式，开始扫描后会提示打开网络调试界面找到使用配对码配对设备，通知栏会弹出提示，输入配对码即可配对
- 低于安卓11的，填写开始端口和结束端口，会自动扫描，一般网络调试端口是5555，扫描后会提示授权允许对话框，允许即可
- 如果失败，可以多次尝试，不过建议先去app的系统设置中完成adb网络调试的配对，这样就无需调用这个函数了
- 适配EC 安卓 11.33.0+
- @param startPort 网络调试开始端口
- @param endPort 网络调试结束端口
- @param timeout 超时时间 单位毫秒
- @returns `{string}`JSON字符串，code=0代表成功，data 代表返回的数据，msg代表消息

```
    // 请看 adbClient.connectHistory 函数的例子
```

## adbClient.stopScan 停止扫描 ​

- 停止扫描
- 适配EC 安卓 11.33.0+
- @returns `{*|boolean}` true代表成功 false代表失败

```
    // 请看 adbClient.connectHistory 函数的例子
```

## adbClient.closeAdbConnect 关闭adb连接 ​

- 关闭adb连接
- 适配EC 安卓 11.33.0+
- @returns `{*|boolean}` true代表成功 false代表失败

```
    // 请看 adbClient.connectHistory 函数的例子
```

## adbClient.isAdbConnected adb是否链接 ​

- adb是否链接上来了
- 适配EC 安卓 11.33.0+
- @returns `{*|boolean}` true代表成功 false代表失败

```
    // 请看 adbClient.connectHistory 函数的例子
```

## adbClient.runShell 运行shell命令 ​

- 运行shell命令
- 适配EC 安卓 11.33.0+
- @param command 命令,例如 ls /sdcard/或者pm install /sdcard/xxx.apk 安装命令
- @param timeout 超时时间 单位是毫秒
- @returns `{string}` JSON字符串，code=0代表成功，data 代表返回的数据，msg代表消息

```
    // 请看 adbClient.connectHistory 函数的例子
```

## adbClient.activeSelf 激活自己 ​

- 激活自己
- 适配EC 安卓 11.33.0+
- @param type 值分别是1和2 ，激活方式不同
- @param timeout 超时时间 单位是毫秒
- @returns `{string}` JSON字符串，code=0代表成功，data 代表返回的数据，msg代表消息

```
    // 请看 adbClient.connectHistory 函数的例子
```

## adbClient.openAdbWifiDebugPage 打开无线调试界面 ​

- 打开无线调试界面
- 适配EC 安卓 11.33.0+
- @returns `{*|boolean}` true 成功 false失败

```
    function main() {
        // app放在前台 直接调用 
        let r = adbClient.openAdbWifiDebugPage();
        logd(r)
    }
    
    main();
```

## adbClient.openNotificationPermissionPage 打开通知栏权限界面 ​

- 打开通知栏权限界面
- 适配EC 安卓 11.33.0+
- @returns `{*|boolean}` true 成功 false失败

```
    function main() {
        // app放在前台 直接调用 
        let r = adbClient.openNotificationPermissionPage();
        logd(r)
    }
    
    main();
```
