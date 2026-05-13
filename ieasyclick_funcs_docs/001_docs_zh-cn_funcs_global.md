本页总览

## 说明 ​

全局模块是指直接调用方法就可以使用的模块，无需使用前缀对象名称

## CLI相关 ​

### getCliArgs 获取CLI命令行提交的参数 ​

- 获取CLI命令行提交的参数
- 如果配合AI使用，可以优先从cli获取参数，如果获取不到在从其他地方获取
- 这样就能做到AI 自动传参，打包后从其他地方获取参数的AI自动测试
- 适合版本 EC 安卓 12.0.0+
- @return 0 JSON对象，如果是null说明不是CLI运行过来的

```
function main() {
    let a = getCliArgs();
    if (a == null){
        // 从其他地方获取
    }
    logd(JSON.stringify(a))
}

main();
```

## 版本判断 ​

### checkApkVersion8 ​

- 检查apk主版本是否是8版本，如果不是会有异常发生
- 该函数可以在程序中调用，防止iec和apk版本不一致
- 适合版本 EC 8.2.0+

```
function main() {
    checkApkVersion8();
}

main();
```

### checkApkVersion9 ​

- 检查apk主版本是否是9版本，如果不是会有异常发生
- 该函数可以在程序中调用，防止iec和apk版本不一致
- 适合版本 EC 9.1.0+

```
function main() {
    checkApkVersion9();
}

main();
```

## 中控投屏相关 ​

### getCenterTaskInfo 获取中控任务 ​

- 取得中控发过来的任务参数信息
- 中控启动脚本，可以配置参数，在这里使用本函数获取参数，给脚本使用
- 适合版本 EC 安卓 9.27.0+
- 注意：这个需要使用参数配置,读取顺序是 优先读取单个设备配置 ，如果单个设备配置无任何数据，就读取 全局配置，
- 返回参数中 含有 **from_global** 这样的key，代表是来源于全局参数
- @return `{json}` 对象

```
function main() {
    while (true) {
        logd("---> " + new Date())
        sleep(2000);
        let info = getCenterTaskInfo()
        logd("info -> " + JSON.stringify(info))

        if (info) {
            logd("test param => " + info['valueJson']['test']);
        }
        sleep(2000);
    }
}

main()
```

## 插件模块加载 ​

### loadDex 载入dex或者apk ​

- 载入dex文件
- @param path 路径，加载顺序分别是插件目录(例如 ab.apk)或者是文件路径(例如 /sdcard/ab.apk)加载
- @return true 载入成功， false载入失败

```
function main() {
    //类似这样会先从IEC文件的插件目录查找
    //loadDex("ocr.apk");
    //下面这个是从sdcard查找
    loadDex("/sdcard/a.apk");
    // a.apk中存在com.A这个这个类，可以直接使用
    var obj = new com.A();
}

main();
```

### setRepeatLoadDex 设置重复加载dex或者apk ​

- 设置重复加载dex，apk，防止插件过大导致加载时间过长
- 适合版本 EC 7.1.0+
- @param r 是否重复加载，true 可以重复加载，false 不可以重复加载
- @return true 载入成功， false载入失败

```
function main() {
    setRepeatLoadDex(false)
    //类似这样会先从IEC文件的插件目录查找
    //loadDex("ocr.apk");
    //下面这个是从sdcard查找
    loadDex("/sdcard/a.apk");
    // a.apk中存在com.A这个这个类，可以直接使用
    var obj = new com.A();
}

main();
```

### require 导入JS ​

- 导入JS模块
- @param path 路径，例如 本地/sdcard/a.js或者 EC工程中的文件路径 slib/a.js
- @return 模块对象

```
function main() {
    //注意,js文件不要放在js目录或下级目录中
    //注意,EC3.5版本不支持,EC已经6.15了兄弟
    test = require("slib/a.js")
    logd(test.c());
}

main();
//视频介绍:https://www.bilibili.com/video/BV1ES4y1f7qV?vd_source=2abc6be820f5a6382ebc0ceafc5dbe00&p=39&spm_id_from=333.788.videopod.episodes
```

### importClass 导入JAVA类 ​

- 导入java的class给js用
- @param clz class的名称例如: com.A

```
function main() {
    importClass(com.A);
    var obj = new com.A();
}

main();
```

### importPackage 导入JAVA包 ​

- 导入java包下面所有类给js用
- @param clz class的名称例如: com.b

```
function main() {
    importPackage(com.b);
    var obj = new com.b.A();
}

main();
```

## 脚本启停和暂停 ​

### exit 退出脚本 ​

```
exit();
```

### isScriptExit 是否已退出脚本 ​

- 判断EC运行的当前线程是否处于退出状态，可用判断脚本是否退出，或者子线程是否退出
- 适用版本(EC 6.2.0+)
- @return true 已退出

```
function main() {
    try {
        while (true) {
            sleep(1000)
            logd("222")
            if (isScriptExit()) {
                break
            }
        }
        logd("222")
    } catch (e) {
        logd(e)
        if (isScriptExit()) {
            return
        }
    }
}

main();
```

### sleep 暂停执行 ​

- 休眠
- @param miSecond 毫秒

```
function main() {
    sleep(1000);
}

main();
```

### execScript 载入JS ​

- 执行JS文件或者内容, [如果出现illegalStateException，可以尝试修改**eval**函数执行js脚本]
- eval函数是js自带的，直接传入js内容就行
- @param type 1=文件，2=直接是JS内容
- @param content 路径例如/sdcard/a.js或者js的内容
- @return 布尔型，true代表执行成功， false代表失败

```
function main() {
    var d = 'while(true){sleep(1000);logd(111111);}';

    thread.execAsync(function () {
        //execScript(1,"/sdcard/ad.js")
        execScript(2, d);
    });

    while (true) {
        sleep(2000);
        loge("fsadffsad")
    }

}

main();
```

### restartScript 重启脚本 ​

- 重启脚本，适合无限循环，或者有异常的情况可以下载最新的iec再次执行，避免进入UI才能热更新,
- 注意: 该方法威力巨大，请自行控制好是否自动重启，否则只能强杀进程才能停止
- @param path 新的IEC路径，如果不需要可以填写null
- @param stopCurrent 是否停止当前的脚本
- @param delay 延迟多少秒后执行
- @return bool true 代表成功 false 代表失败

```
function main() {
    logd("我是在脚本运行的");
    setStopCallback(function () {
        restartScript(null, true, 3)
    });

    //setExceptionCallback(function (){
    //    restartScript(null,true,3)
    //});
    sleep(1000);
    logd("脚本结束")
}

main();
```

### setScriptPause 设置脚本暂停或者继续 ​

- 设置脚本暂停或者继续
- 适配 EC 10.0.0+
- @param pause true 代表暂停脚本，false代表继续
- @param timeout 自动恢复时间单位毫秒，0 代表不自动恢复，等待外部交互后恢复，大于0代表到了时间自动恢复运行
- @return `{boolean}` true 代表脚本处于暂停中，false 代表继续运行中

```
function main() {
    sleep(1000);
    logd("start....")
    // 代表暂停脚本执行，3秒后会自动化继续
    // 这里仅仅是演示，实际情况需要根据自己的业务逻辑做判断或者从ui进行暂停脚本
    setScriptPause(true, 3000)

    logd("我是三秒后的日志")
}

main();
```

### isScriptPause 脚本是否处于暂停中 ​

- 脚本是否处于暂停中
- 适配 EC 10.0.0+
- @return `{boolean}` true 代表脚本处于暂停中

```
function main() {
    sleep(1000);
    logd("start....")
    // 代表暂停脚本执行，3秒后会自动化继续
    // 这里仅仅是演示，实际情况需要根据自己的业务逻辑做判断或者从ui进行暂停脚本
    // 仅仅是函数调用演示，实际情况根据业务处理
    logd("isScriptPause " + isScriptPause())
    setScriptPause(true, 3000)
    logd("isScriptPause " + isScriptPause())
    logd("我是三秒后的日志")
}

main();
```

## JSON处理 ​

### JSON.stringify 格式化为JSON字符串 ​

- 格式化对象为JSON字符串
- @param 对象
- @return 字符串

```
function main() {
    var m = {"sss": "a"};
    var d = JSON.stringify(m);
    toast(d);
}

main();
```

### JSON.parse 转换为JSON对象 ​

- 格式化JSON字符串为对象
- @param 字符串
- @return 对象

```
function main() {
    var m = {"sss": "a"};
    var d = JSON.stringify(m);
    d = JSON.parse(d);
    toast(d);
}

main();
```

## 监听脚本和服务 ​

### setStopCallback 脚本停止监听 ​

- 脚本开头执行一次即可

```
function main() {
    setStopCallback(function () {
        logd("fdsafsad 我是停止回调")
    });
    var result = sleep(1000);
    if (result) {
        toast("成功");
    } else {
        toast("失败");
    }
}

main();
```

### setExceptionCallback 脚本异常停止监听 ​

- 脚本开头执行一次即可

```
function main() {
    setExceptionCallback(function (msg) {
        logd(" 异常停止消息: " + msg)
    });
    var result = sleep(1000);
    if (result) {
        toast("成功");
    } else {
        toast("失败");
    }
    //这里有异常抛出
    result.length();
}

main();
```

### observeEvent 对系统事件进行监听 ​

- 对系统事件进行监听
- 代理模式适用版本(EC 6.0.0+)
- @param event 事件类型 类型有:
- activity-change 页面切换，支持无障碍和代理模式
- notification-show：状态栏通知展示， 支持无障碍和代理模式
- toast-show：Toast消息展示， 支持无障碍和代理模式
- key-down：按键按下， 支持无障碍
- key-up：按键弹起 支持无障碍
- acc-service-interrupt：无障碍服务被中断 支持无障碍
- acc-service-destroy： 无障碍服务被销毁 支持无障碍
- acc-event：无障碍节点事件 支持无障碍和代理模式
- acc-service-connected: 无障碍服务连接成功 支持无障碍
- auto-service-status: 自动化服务可用状态 支持无障碍
- @param callback 事件回调
- @return `{bool}` | true 成功，false失败

```
function main() {
    startEnv();
    logd("开始监听");
    observeEvent("activity-change", function (key, data) {
        logd("页面切换: " + typeof data)
        logd("页面切换: " + data)
    });
    //监听无障碍节点事件
    observeEvent("acc-event", function (key, data) {
        logd("acc-event: " + typeof data)
        logd("acc-event: " + data)
    });
    while (true) {
        sleep(1000)
    }
    //取消事件监听
    cancelObserveEvent("acc-event")
}

main();
```

### cancelObserveEvent 取消对系统事件监听 ​

- 取消事件监听
- @param event 事件类型
- @return `{bool}` | true 成功，false失败

```
function main() {
    startEnv();
    logd("开始监听");
    observeEvent("activity-change", function (key, data) {
        logd("页面切换: " + typeof data)
        logd("页面切换: " + data)
    });
    //监听无障碍节点事件
    observeEvent("acc-event", function (key, data) {
        logd("acc-event: " + typeof data)
        logd("acc-event: " + data)
    });
    sleep(10000)
    //取消事件监听
    cancelObserveEvent("acc-event")
}

main();
```

## 告警发送 ​

### sendDingDingMsg 发送钉钉消息 ​

- 发送钉钉消息
- 适合EC 9.11.0+
- @param url 群组/部门 机器人Webhook地址
- @param secret 群组/部门 机器人Webhook密钥, 可以不写使用关键字过滤方式
- @param msg 要发送的消息
- @param atMobile at手机号，多个用英文逗号隔开
- @param atAll 是否at所有人，写true或者false
- @return `{string}` 调用钉钉返回的json字符串结果,格式 `{"errcode":0,"errmsg":"ok"}`，errcode=0代表成功其他都是错误

```
function main() {
    // 演示的地址和密钥，具体获取参考这个网页： https://www.dingtalk.com/qidian/help-detail-20781541.html
    // https://blog.csdn.net/weixin_44646065/article/details/110637713
    let url = "https://oapi.dingtalk.com/robot/send?access_token=59735fa75d835dbfaa502bb42886fca982960d20sac5e1df6bba4dd1aba02999c"
    let sec = "SEC2305788ab08e9534a33b86ae376697d3c9ee3095f331345d5ccd6e2e065ca8069"
    var res = sendDingDingMsg(url, sec, "我是消息", "", true);
    logd("sendDingDingMsg:" + res);
}

main();
```

## 日志消息方法 ​

### setSaveLog 保存日志 ​

- 设置保存日志信息到文件中
- @param save 是否保存
- @param path 自定义的文件夹
- @param size 每个文件分隔的尺寸
- @return 保存日志文件的目录

```
function main() {
    var s = setSaveLog(true, "/sdcard/aaa/", 1024 * 1024);
    logd("save dir is:" + s);
}

main();
```

### setSaveLogEx 保存日志 ​

- 设置保存日志信息到文件中
- @param save 是否保存
- @param path 自定义的文件夹
- @param size 每个文件分隔的尺寸
- @param fileName 日志的自定义文件名称
- @return 保存日志文件的目录

```
function main() {
    var s = setSaveLogEx(true, "/sdcard/aaa/", 1024 * 1024, "testlog");
    logd("save dir is:" + s);
}

main();
```

### setFloatDisplayLineNumber 打印日志行号 ​

- 打印日志的时候，悬浮窗是否展示行号，正式发布，可以不展示行号，不影响调试和保存在文件的日志中
- @param ds true 代表显示， false 不显示

```
function main() {
    setFloatDisplayLineNumber(true);

}

main();
```

### toast 带参数Toast消息 ​

- 显示Toast消息
- 适用版本(EC 5.21.0+)
- @param msg 消息字符串
- @param extra 扩展map参数，只有在有悬浮窗权限情况下参数才会生效 x : X坐标 y : Y坐标 duration : 持续时长 单位是毫秒 textColor : 16进制文字颜色，例如#888888 width : toast宽度 height : toast高度 draggable : 是否能够拖动true 代表可以

```
function main() {
    let toastExtra = {
        "x": 100,
        "y": 1200,
        "duration": 1000,
        "textColor": "#778899",
        "width": 200,
        "height": 200,
        "draggable": true
    }
    for (var i = 0; i < 3; i++) {
        sleep(500)
        toast(time() + "ddd", toastExtra);
    }
    logd(time() + "  222");
}

main();
```

### toast1 Toast1消息 ​

- 显示Toast消息 (扩展方法)
- @param msg 消息字符串

```
function main() {
    toast1("msg");
}

main();
```

### toast2 Toast2消息 ​

- 显示Toast消息(扩展方法)
- @param msg 消息字符串

```
function main() {
    toast2("msg");
}

main();
```

### setLogLevel 设置日志的等级 ​

- 设置日志的等级,可以根据情况关闭或开启日志
- 适用版本(EC 5.21.0+)
- @param level 日志等级，值分别是 debug,info,warn,error,off，排序分别是debug < info < warn < error < off，
- 例如 off代表关闭所有级别日志，debug代表打印包含logd,logi,logw,loge的日志，info代表打印包含logi,logw,loge的日志，warn 代表打印包含logw,loge的日志
- @param displayToast 是否展示toast消息
- @return `{bool}` 布尔型 true代表成功 false代表失败

```
function main() {
    setLogLevel("info", false)
    for (var i = 0; i < 1; i++) {
        sleep(10);
        //logd(time()+" debug");
        logi(time() + " info");
        //logw(time()+" warn");
        //loge(time()+" error");
        toast("--- " + time());
    }
    //logd(time()+"  222");
}

main();
```

### logd 调试日志 ​

- 调试日志
- @param msg 消息字符串

```
function main() {
    logd("msg");
    //可变参数写法
    logd("我是消息{},{}", "测试1", 2)
}

main();
```

### loge 错误日志 ​

- 错误日志
- @param msg 消息字符串

```
function main() {
    loge("msg");
    //可变参数写法
    loge("我是消息{},{}", "测试1", 2)
}

main();
```

### logw 警告日志 ​

- 警告日志
- @param msg 消息字符串

```
function main() {
    logw("msg");
    //可变参数写法
    logw("我是消息{},{}", "测试1", 2)
}

main();
```

### logi 信息日志 ​

- 信息日志
- @param msg 消息字符串

```
function main() {
    logi("msg");
    //可变参数写法
    logi("我是消息{},{}", "测试1", 2)
}

main();
```

### clearLog 清除日志 ​

- 清除日志
- @param lines 整型，要清除的行数，-1 代表全部清除

```
function main() {
    showLogWindow()
    sleep(1000)
    for (var i = 0; i < 4; i++) {
        logd(" " + i);
    }
    sleep(2000)
    //清除前三行
    clearLog(3)
    //清除所有
    clearLog(-1)
}

main();
```

## 读取IEC包资源 ​

### readIECFileAsString 读取IEC内部文件为字符串 ​

- 读取IEC文件中的资源文件，并返回字符串
- @param fileName 文件名称，如果放在某个文件夹下 需要加上文件名称
- @return `{string}` 如果是null代表没内容

```
function main() {
    var testData = readIECFileAsString("res/a.txt");
    logd(testData)
}

main();
```

### readIECFileAsByte 读取IEC内部文件为数组资源 ​

- 读取IEC文件中的资源文件，并返回java的直接数组
- @param fileName 文件名称，如果放在某个文件夹下 需要加上文件名称
- @return `{字节数组}` 如果是null代表没内容

```
function main() {
//这里已读取图片为例子
    var d = readIECFileAsByte("res/a.png")
    importPackage(android.graphics)
    let ad = BitmapFactory.decodeByteArray(d, 0, d.length)
    logd(d)
    logd(d.length)
    logd(ad);
}

main();
```

### readResString 读取字符串资源 ​

- 读取res文件夹中的资源文件,并返回字符串
- @param fileName 文件名称，不要加res前缀
- @return string 如果是null代表没内容

注意

- 不要用`运行选中`功能执行,此功能不会带着附件文件执行,必须运行整个项目

```
function main() {
    var testData = readResString("a.txt");
}

main();
```

### readResBitmap 读取Bitmap资源 ​

- 读取res文件夹中的资源文件，并返Bitmap图片对象
- @param fileName 文件名称，不要加res前缀
- @return Bitmap 如果是null代表没内容

注意

- 不要用`运行选中`功能执行,此功能不会带着附件文件执行,必须运行整个项目

```
function main() {
    var b = readResBitmap("a.txt");
}

main();
```

### readResAutoImage 读取Image资源 ​

- 读取res文件夹中的资源文件，并返 AutoImage 图片对象
- @param fileName 文件名称，不要加res前缀
- @return AutoImage 如果是null代表没内容

注意

- 不要用`运行选中`功能执行,此功能不会带着附件文件执行,必须运行整个项目

```
function main() {
    var b = readResAutoImage("img/a.png");
}

main();
```

### saveResToFile 保存资源为文件 ​

- 保存res文件夹中的资源文件到指定的路径
- @param fileName 文件名称，不要加res前缀
- @param path 要保存到的路径地址，例如/sdcard/aa.txt
- @return `{boolean|布尔型}` true代表保存成功

```
function main() {
    var b = saveResToFile("img/a.png", "/sdcard/a.png");
}

main();
```

### findIECFile 查找IEC的文件 ​

- 查找IEC的文件
- 适合版本 EC 8.0.0+
- @param dir 文件夹名称，null代表只读res/文件夹，没有默认是res文件夹，可以是类似 res/aaa/这样的文件夹
- @param names 文件名称前缀,null代表不匹配， 例如aaa,多个前缀用|分割，例如 aaa|bb|cc
- @param ext 文件扩展名 ,null代表不匹配，例如.png,多个扩展用|分割，例如 .png|.jpg|.bmp
- @param recursion 是否递归子目录，true代表递归
- @return `{array}` 文件名称JSON数组

```
function main() {
    let res = findIECFile("res/", "dd2", ".png|.jpg", true)
    logd("findIECFile {}", JSON.stringify(res));

}

main();
```

## UI参数读取 ​

### deleteConfig 删除配置值 ​

- @param key 在UI界面中配置的key
- @return `{bool}` true 代表成功 false 代表失败

```
function main() {
    var testData = deleteConfig("test_key");
}

main();
```

### readConfigInt 读取整型配置 ​

- @description 读取UI界面中的参数,返回是整型
- @param key 在UI界面中配置的key
- @return 整型，找不到就返回0

```
function main() {
    var testData = readConfigInt("test_key");
}

main();
```

### readConfigString 读取字符串配置 ​

- 读取UI界面中的参数,返回是字符串
- @param key 在UI界面中配置的key
- @return 字符串 找不到就返回空字符串

```
function main() {
    var testData = readConfigString("test_key");
}

main();
```

### readConfigDouble 读取double配置 ​

- 读取UI界面中的参数,返回是Double型
- @param key 在UI界面中配置的key
- @return double

```
function main() {
    var testData = readConfigDouble("test_key");
}

main();
```

### readConfigBoolean 读取布尔型配置 ​

- 读取UI界面中的参数,返回是布尔型
- @param key 在UI界面中配置的key
- @return true 或者 false

```
function main() {
    var testData = readConfigBoolean("test_key");
}

main();
```

### getConfigJSON 取所有配置 ​

- 取得配置的JSON
- @return JSON数据

```
function main() {
    var testData = getConfigJSON();
}

main();
```

### updateConfig 更新配置 ​

- 更新配置
- @param key 键
- @param value 值
- @return `{boolean}` true 成功，false失败

```
function main() {
    updateConfig("a", "sss");
}

main();
```

## EC 系统设置 ​

### setECSystemConfig 设置EC参数 ​

- 设置EC的系统参数
- @param params map形式例如 `{"running_mode":"无障碍"}`,

```
{
  "running_mode": "无障碍",
  "auto_start_service": "是",
  "log_float_window": "否",
  "ctrl_float_window": "否"
}
```

- 参数解释有：
- running_mode : 运行模式 值有 无障碍，代理两种
- auto_start_service： 开机自启动 值有 是，否 两种
- log_float_window : 日志悬浮窗展示 值有 是，否 两种
- ctrl_float_window : 启停控制悬浮窗展示 值有 是，否 两种
- ctrl_float_window_h: 启停控制悬浮窗 横向 展示 值有 是，否 两种
- agent_node_support: 代理模式是否支持节点 值分别是1=默认 2=shelldump 3=不启动节点服务
- @return 布尔型 true 是 false 否

```
function main() {
    var m = {
        "node_service": "需要",
        "proxy_service": "不需要",
        "running_mode": "无障碍",
        "log_float_window": "否",
        "ctrl_float_window": "否"
    };
    setECSystemConfig(m);
}

main();
```

### openECSystemSetting 打开EC系统界面 ​

- 打开EC系统设置页面
- @return true 成功 false 失败

```
function main() {
    var result = openECSystemSetting();
}

main();
```

### setWallpaperService 设置壁纸服务函数 ​

- 设置壁纸服务函数
- 适用版本(EC 6.1.0+)
- @return 布尔型 true代表启动成功，false代表启动失败

```
function main() {
    var result = setWallpaperService();
}

main();
```

### isWallpaperServiceSet 是否设置壁纸成功 ​

- 是否设置壁纸成功
- 适用版本(EC 6.1.0+)
- @return 布尔型 true代表启动成功，false代表启动失败

```
function main() {
    var result = isWallpaperServiceSet();
}

main();
```

### openECloudSetting 打开EC云控界面 ​

- 打开EC云控界面
- @return true 成功 false 失败

```
function main() {
    var result = openECloudSetting();
}

main();
```

## 设置IEC文件(脚本中的热更新) ​

### setIECPath 设置脚本路径 ​

- 设置要执行的IEC文件路径
- @return true 成功 false 失败

```
function main() {
    var result = setIECPath("/sdcard/release.iec");
    logd("result : " + result);
    logd("当前路径 " + getIECPath());
    //开启定时任务准备下一次执行
    var id2 = startJob("task2", "2", true);
    logd("job id " + id2);
}

main();
```

## 运行模式 ​

### activeSelf 激活自己 ​

- 激活自己,条件：1 开启USB调试，2 开启本机ADB WIFI调试,请参考激活章节文档
- 适用版本(EC 5.15.0+)
- @param activeType 激活类型，0 自动，1 模式1 2 模式2
- @param timeout 超时时间
- @return `{string}` 激活成功：代表成功，其他都是错误消息

```
function main() {
    var result = activeSelf(0, 10 * 1000);
    logd(result)
}

main();
```

### activeDevice 通过IP激活其他设备 ​

- ip 设备的IP,条件：1 开启目标设备USB调试，2 开启目标设备ADB WIFI调试,请参考激活章节文档
- 适用版本(EC 5.15.0+)
- @param ip 设备的IP
- @param activeType 激活类型，0 自动，1 模式1 2 模式2
- @param timeout 超时时间
- @return `{string}` 激活成功：代表成功，其他都是错误消息

```
function main() {
    var result = activeDevice("192.168.1.108", 0, 10 * 1000);
    logd(result)
}

main();
```

### isAccMode 无障碍模式判断 ​

- 是否是无障碍模式
- @return true或者false

```
function main() {
    var result = isAccMode();
}

main();
```

### isAgentMode 代理模式判断 ​

- 是否是代理模式
- @return true或者false

```
function main() {
    var result = isAgentMode();
}

main();
```

### isServiceOk 自动化服务状态 ​

- 自动化服务是否正常
- @return true或者false

```
function main() {
    var result = isServiceOk();
}

main();
```

### startEnv 启动自动化 ​

- 启动自动化服务环境
- @return true或者false

```
function main() {
    var result = startEnv();
}

main();
```

### daemonEnv 守护自动化环境 ​

- 守护自动化环境
- 如果是激活或者无障碍保活的情况下，尽量保证自动服务不掉线
- 适合版本 :EC 6.7.0+
- @param daemon 是否守护自动化环境 true 是，false 否
- @return 布尔型 true代表启动成功，false代表启动失败

```
function main() {
    var result = daemonEnv(true);
}

main();
```

### closeEnv 关闭自动化 ​

- 关闭自动化环境
- @param skinAccPage 无障碍模式停止失败 是否跳转到开启无障碍页面
- @return 布尔型 true代表启动成功，false代表启动失败

```
function main() {
    var result = closeEnv(false);
}

main();
```

## 时间相关 ​

### time 毫秒级当前时间戳 ​

- 适用版本(EC 5.14.0+)
- 毫秒级当前时间戳
- @return `{long}` 毫秒级别的long时间

```
function main() {
    logd(time());
}

main();
```

### timeFormat 格式化时间 ​

- 适用版本(EC 5.14.0+)
- 格式化时间函数例如：`yyyy-MM-dd HH:mm:ss`
- @return `{string}` 格式化之后的当前时间

```
function main() {
    logd(timeFormat("yyyy-MM-dd HH:mm:ss"));
}

main();
```

### console.time 计时开始 ​

- 适用版本(EC 5.14.0+)
- 计时开始,和timeEnd成对出现计算用时
- @param label 标签
- @return `{long}` 当前时间

```
function main() {
    console.time("1");
    sleep(1000)
    logd(console.timeEnd("1"))
}

main();
```

### console.timeEnd 计时结束 ​

- 适用版本(EC 5.14.0+)
- 计时结束,和timeEnd成对出现计算用时
- @param label 标签
- @return `{long}` 与计时开始的差值

```
function main() {
    console.time("1");
    sleep(1000)
    logd(console.timeEnd("1"))
}

main();
```
