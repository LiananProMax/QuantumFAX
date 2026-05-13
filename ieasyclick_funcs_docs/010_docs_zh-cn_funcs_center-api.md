本页总览

## 说明 ​

- 中控投屏模块，是需要配合EC的中控投屏系统使用的
- 中控投屏软件安装使用文档: [中控投屏使用手册](https://ieasyclick.com/docs/zh-cn/centerscreen/openscreen)
- 中控投屏模块的对象前缀是 centerApi，例如 centerApi.getFileData这样调用

## centerApi.getCenterTaskInfo 获取中控任务信息 ​

- 取得中控发过来的任务参数信息
- 中控启动脚本，可以配置参数，在这里使用本函数获取参数，给脚本使用
- 适合版本 EC 安卓 9.29.0+
- 注意：这个需要使用参数配置,读取顺序是 优先读取单个设备配置 ，如果单个设备配置无任何数据，就读取 全局配置，
- 返回参数中 含有 **from_global** 这样的key，代表是来源于全局参数
- @return `{json}` 对象

```
function main() {
    while (true) {
        logd("---> " + new Date())
        sleep(2000);
        let info = centerApi.getCenterTaskInfo()
        logd("info -> " + JSON.stringify(info))
        if (info) {
            logd("test param => " + info['valueJson']['test']);
        }
        sleep(2000);
    }
}

main()
```

## centerApi.getFileData 读取数据文件内容 ​

- 读取数据文件的内容
- 适配EC 9.29.0+
- @param name 文件名称，中控数据功能的数据文件名称
- @return `{json}` JSON对象

```
function main() {
    let data = centerApi.getFileData("testfile")
    logd(JSON.stringify(data))
    if (!data) {
        logd("无数据返回");
    } else {
        if (data["code"] != 0) {
            logd("错误: " + data["msg"]);
        } else {
            logd("数据: " + data["data"]);
        }
    }
}

main();
```

## centerApi.addFileData 新增数据文件 ​

- 新增数据文件
- 适配EC 9.29.0+
- @param name 文件名称，中控数据功能的数据文件名称
- @param content 文件内容
- @param rewrite 是否允许覆盖原有文件， 1 是 2 否，如果参数是2，数据文件存在，将返回错误信息
- @param append 追加模式， 1 代表是追加内容，2 代表不追加
- @return `{json}` JSON对象

```
function main() {
    let data = centerApi.addFileData("testfile", "\n123", "1", "1")
    logd(JSON.stringify(data))
    if (!data) {
        logd("无数据返回");
    } else {
        if (data["code"] != 0) {
            logd("错误: " + data["msg"]);
        } else {
            logd("成功");
        }
    }
}

main();
```

## centerApi.deleteFile 删除数据文件 ​

- 删除数据文件
- 适配EC 9.29.0+
- @param name 文件名称，中控数据功能的数据文件名称
- @return `{json}` JSON对象

```
function main() {
    let data = centerApi.deleteFile("testfile")
    logd(JSON.stringify(data))
    if (!data) {
        logd("无数据返回");
    } else {
        if (data["code"] != 0) {
            logd("错误: " + data["msg"]);
        } else {
            logd("成功");
        }
    }
}

main();
```

## centerApi.insertFileData 插入数据 ​

- 插入数据
- 适配EC 9.29.0+
- @param name 文件名称，中控数据功能的数据文件名称
- @param content 要插入的内容
- @param create 是否创建文件 1 是 2 否，如果参数是2，文件不存在的情况下，将返回错误信息
- @param append 追加模式， 1 代表是追加内容，2 代表不追加
- @return `{json}` JSON对象

```
function main() {
    let data = centerApi.insertFileData("testfile", "123", "1", "2")
    logd(JSON.stringify(data))
    if (!data) {
        logd("无数据返回");
    } else {
        if (data["code"] != 0) {
            logd("错误: " + data["msg"]);
        } else {
            logd("成功");
        }
    }
}

main();
```

## centerApi.popFileData 弹出数据 ​

- 弹出数据
- 适配EC 9.29.0+
- @param name 文件名称，中控数据功能的数据文件名称
- @param popType 获取数据方式，1 头部获取，2 尾部获取，3 随机获取
- @return `{json}` JSON对象

```
function main() {
    let data = centerApi.popFileData("testfile", "3")
    logd(JSON.stringify(data))
    if (!data) {
        logd("无数据返回");
    } else {
        if (data["code"] != 0) {
            logd("错误: " + data["msg"]);
        } else {
            logd(data["data"]);
        }
    }
}

main();
```

## centerApi.removeOneLineData 删除一行数据 ​

- 删除一行数据
- 适配EC 9.29.0+
- @param name 文件名称，中控数据功能的数据文件名称
- @param content 要删除的内容
- @return `{json}` JSON对象

```
function main() {
    let data = centerApi.removeOneLineData("testfile", "2")
    logd(JSON.stringify(data))
    if (!data) {
        logd("无数据返回");
    } else {
        if (data["code"] != 0) {
            logd("错误: " + data["msg"]);
        } else {
            logd("成功");
        }
    }
}

main();
```

## centerApi.appendOneLineData 追加一行数据 ​

- 追加一行数据
- 适配EC 9.29.0+
- @param name 文件名称，中控数据功能的数据文件名称
- @param content 要追加的内容
- @param appendType 追加位置 1 首部 2 尾部
- @return `{json}` JSON对象

```
function main() {
    let data = centerApi.appendOneLineData("testfile", "2", "2")
    logd(JSON.stringify(data))
    if (!data) {
        logd("无数据返回");
    } else {
        if (data["code"] != 0) {
            logd("错误: " + data["msg"]);
        } else {
            logd("成功");
        }
    }
}

main();
```
