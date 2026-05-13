本页总览

## 说明 ​

- 网络验证模块是官方开放的模块，需要到 [http://uc.ieasyclick.com](http://uc.ieasyclick.com) 用户中心管理后台提取卡密
- 低于9.13.0版本的apk需要单独下载网络验证的SDK包，手动集成到脚本中
- 高于9.13.0版本的，可以直接使用函数调用方式，无需集成，简单易用
- 卡密自带心跳验证无需另外调用
- 卡密自动验证脚本的安全性，增加防破解难度，这个有区别市面上的网络验证平台
- 无论是集成版本的还是SDK版本的调用的方法都是一样的，都是**ecNetCard**开头的模块
- 网络验证平台用法说明: [点我查看](https://ieasyclick.com/docs/zh-cn/advance/netcard)

## 卡密相关 ​

### ecNetCard.setDeviceId 自定义设备id ​

- [网络验证]自定义设备id
- 提卡网址 [[http://uc.ieasyclick.com](http://uc.ieasyclick.com)]
- 适配版本 EC 安卓 11.21.0+
- @param deviceId 自定义的设备id, 自己生成的设备id，不得超过32个字符
- @return `{boolean}` true 成功

```
function main() {
    //开始再这里编写代码了！！
    logd("检查自动化环境...")
    
    logd("开始执行脚本...")
    // 这个只是例子 不要 照搬，你可以使用android_id代替或者自己生成
    ecNetCard.setDeviceId("123")
    let appId = "sjfjvkpw"
    let appSecret = "ykjscxcs"
    let cardNo = "cbwolrftnw"

    let inited = ecNetCard.netCardInit(appId, appSecret)
    logd("inited card => " + JSON.stringify(inited));
    let bind = ecNetCard.netCardBind(cardNo)
    logd("bind " + JSON.stringify(bind))
    loge("bind {}", JSON.stringify(bind))
    let bindResult = false;
    if (bind != null && bind != undefined && bind["code"] == 0) {
        loge("卡密绑定成功")
        loge("剩余时间：" + bind['data']['leftDays'] + "天")
        loge("激活时间：" + bind['data']['startTime'])
        loge("过期时间：" + bind['data']['expireTime'])
        bindResult = true;
    } else {
        if (bind == null || bind == undefined) {
            loge("卡密绑定失败,无返回值 ")
        } else {
            loge("卡密绑定失败: " + bind["msg"])
        }
    }

    sleep(5000)
    if (!bindResult) {
        return
    }

    // 云端变量演示
    let user_ageJson = ecNetCard.netCardGetCloudVar("user_age")
    //返回的json数据
    loge("user age=> " + JSON.stringify(user_ageJson))
    //取得对应的值
    loge("user age的字=> " + user_ageJson['data'])

    // 更新user_age的值
    let up = ecNetCard.netCardUpdateCloudVar("user_age", "12222");
    loge("netCardUpdateCloudVar => " + JSON.stringify(up))
    if (up['code'] == 0) {
        loge("netCardUpdateCloudVar 更新成功")
    }


    // 解绑（根据实际情况调用）
    // 也可以在后台解绑
    let unddd = ecNetCard.netCardUnbind(cardNo, "12323")
    loge("netCardUnbind {}", JSON.stringify(unddd))
    sleep(2000)


    while (true) {
        sleep(1000)
    }
}

main();
```

### ecNetCard.netCardInit 初始化卡密 ​

- [网络验证]初始化卡密
- 提卡网址 [[http://uc.ieasyclick.com](http://uc.ieasyclick.com)]
- 适配版本 EC 安卓 9.13.0+
- @param appId 应用的appId，用户中心后台获取
- @param appSecret 应用的密钥，用户中心后台获取
- @return `{json}` null 成功 , JSON 数据代表失败

```
function main() {
    //开始再这里编写代码了！！
    logd("检查自动化环境...")

    logd("开始执行脚本...")

    let appId = "sjfjvkpw"
    let appSecret = "ykjscxcs"
    let cardNo = "cbwolrftnw"

    let inited = ecNetCard.netCardInit(appId, appSecret)
    logd("inited card => " + JSON.stringify(inited));
    let bind = ecNetCard.netCardBind(cardNo)
    logd("bind " + JSON.stringify(bind))
    loge("bind {}", JSON.stringify(bind))
    let bindResult = false;
    if (bind != null && bind != undefined && bind["code"] == 0) {
        loge("卡密绑定成功")
        loge("剩余时间：" + bind['data']['leftDays'] + "天")
        loge("激活时间：" + bind['data']['startTime'])
        loge("过期时间：" + bind['data']['expireTime'])
        bindResult = true;
    } else {
        if (bind == null || bind == undefined) {
            loge("卡密绑定失败,无返回值 ")
        } else {
            loge("卡密绑定失败: " + bind["msg"])
        }
    }

    sleep(5000)
    if (!bindResult) {
        return
    }

    // 云端变量演示
    let user_ageJson = ecNetCard.netCardGetCloudVar("user_age")
    //返回的json数据
    loge("user age=> " + JSON.stringify(user_ageJson))
    //取得对应的值
    loge("user age的字=> " + user_ageJson['data'])

    // 更新user_age的值
    let up = ecNetCard.netCardUpdateCloudVar("user_age", "12222");
    loge("netCardUpdateCloudVar => " + JSON.stringify(up))
    if (up['code'] == 0) {
        loge("netCardUpdateCloudVar 更新成功")
    }


    // 解绑（根据实际情况调用）
    // 也可以在后台解绑
    let unddd = ecNetCard.netCardUnbind(cardNo, "12323")
    loge("netCardUnbind {}", JSON.stringify(unddd))
    sleep(2000)


    while (true) {
        sleep(1000)
    }
}

main();
```

### ecNetCard.netCardBind 绑定卡密 ​

- [网络验证]绑定卡密
- 提卡网址 [[http://uc.ieasyclick.com](http://uc.ieasyclick.com)]
- 适配版本 EC 安卓 9.13.0+
- @param cardNo 卡号，用户中心后台获取
- @return `{null|JSON}` 返回JSON对象, `{"code":0,"msg":""}`

```
function main() {
    //开始再这里编写代码了！！
    logd("检查自动化环境...")

    logd("开始执行脚本...")

    let appId = "sjfjvkpw"
    let appSecret = "ykjscxcs"
    let cardNo = "cbwolrftnw"


    let inited = ecNetCard.netCardInit(appId, appSecret)
    logd("inited card => " + JSON.stringify(inited));
    let bind = ecNetCard.netCardBind(cardNo)
    logd("bind " + JSON.stringify(bind))
    loge("bind {}", JSON.stringify(bind))
    let bindResult = false;
    if (bind != null && bind != undefined && bind["code"] == 0) {
        loge("卡密绑定成功")
        loge("剩余时间：" + bind['data']['leftDays'] + "天")
        loge("激活时间：" + bind['data']['startTime'])
        loge("过期时间：" + bind['data']['expireTime'])
        bindResult = true;
    } else {
        if (bind == null || bind == undefined) {
            loge("卡密绑定失败,无返回值 ")
        } else {
            loge("卡密绑定失败: " + bind["msg"])
        }
    }

    sleep(5000)
    if (!bindResult) {
        return
    }

    // 云端变量演示
    let user_ageJson = ecNetCard.netCardGetCloudVar("user_age")
    //返回的json数据
    loge("user age=> " + JSON.stringify(user_ageJson))
    //取得对应的值
    loge("user age的字=> " + user_ageJson['data'])

    // 更新user_age的值
    let up = ecNetCard.netCardUpdateCloudVar("user_age", "12222");
    loge("netCardUpdateCloudVar => " + JSON.stringify(up))
    if (up['code'] == 0) {
        loge("netCardUpdateCloudVar 更新成功")
    }


    // 解绑（根据实际情况调用）
    // 也可以在后台解绑
    let unddd = ecNetCard.netCardUnbind(cardNo, "12323")
    loge("netCardUnbind {}", JSON.stringify(unddd))
    sleep(2000)


    while (true) {
        sleep(1000)
    }
}

main();
```

### ecNetCard.netCardUnbind 解绑卡密 ​

- [网络验证]解绑卡密
- 提卡网址 [[http://uc.ieasyclick.com](http://uc.ieasyclick.com)]
- 适配版本 EC 安卓 9.13.0+
- @param cardNo 卡号，用户中心后台获取
- @param password 解绑密码 ，如果设置过解绑密码 需要填写
- @return `{null|JSON}` 返回JSON对象,`{"code":0,"msg":""}`

```
function main() {
    //开始再这里编写代码了！！
    logd("检查自动化环境...")

    logd("开始执行脚本...")

    let appId = "sjfjvkpw"
    let appSecret = "ykjscxcs"
    let cardNo = "cbwolrftnw"


    let inited = ecNetCard.netCardInit(appId, appSecret)
    logd("inited card => " + JSON.stringify(inited));
    let bind = ecNetCard.netCardBind(cardNo)
    logd("bind " + JSON.stringify(bind))
    loge("bind {}", JSON.stringify(bind))
    let bindResult = false;
    if (bind != null && bind != undefined && bind["code"] == 0) {
        loge("卡密绑定成功")
        loge("剩余时间：" + bind['data']['leftDays'] + "天")
        loge("激活时间：" + bind['data']['startTime'])
        loge("过期时间：" + bind['data']['expireTime'])
        bindResult = true;
    } else {
        if (bind == null || bind == undefined) {
            loge("卡密绑定失败,无返回值 ")
        } else {
            loge("卡密绑定失败: " + bind["msg"])
        }
    }

    sleep(5000)
    if (!bindResult) {
        return
    }

    // 云端变量演示
    let user_ageJson = ecNetCard.netCardGetCloudVar("user_age")
    //返回的json数据
    loge("user age=> " + JSON.stringify(user_ageJson))
    //取得对应的值
    loge("user age的字=> " + user_ageJson['data'])

    // 更新user_age的值
    let up = ecNetCard.netCardUpdateCloudVar("user_age", "12222");
    loge("netCardUpdateCloudVar => " + JSON.stringify(up))
    if (up['code'] == 0) {
        loge("netCardUpdateCloudVar 更新成功")
    }


    // 解绑（根据实际情况调用）
    // 也可以在后台解绑
    let unddd = ecNetCard.netCardUnbind(cardNo, "12323")
    loge("netCardUnbind {}", JSON.stringify(unddd))
    sleep(2000)


    while (true) {
        sleep(1000)
    }
}

main();
```

### ecNetCard.getCardInfo 获取卡密信息 ​

- [网络验证]获取卡密信息
- 这个可以在UI中调用，将信息显示在界面上
- 提卡网址 [[http://uc.ieasyclick.com](http://uc.ieasyclick.com)]
- 适配版本 EC 安卓 9.13.0+
- @param appId 应用的appId，用户中心后台获取
- @param appSecret 应用的密钥，用户中心后台获取
- @param cardNo 卡号数据
- @return `{null|JSON}` 返回JSON对象,`{"code":0,"msg":""}`

```
function main() {
    logd("开始执行脚本...")
    let appId = "sjfjvkpw"
    let appSecret = "ykjscxcs"
    let cardNo = "cbwolrftnw"

    let card = ecNetCard.getCardInfo(appId, appSecret, cardNo)
    logd("card " + JSON.stringify(card))
}

main();
```

## 云端变量 ​

### ecNetCard.netCardGetCloudVar 获取远程变量 ​

- [网络验证-远程变量]获取远程变量
- 提卡网址 [[http://uc.ieasyclick.com](http://uc.ieasyclick.com)]
- 适配版本 EC 安卓 9.13.0+
- @param key 远程变量名称
- @return `{null|JSON}` 返回JSON对象,`{"code":0,"msg":""}`

```
function main() {
    //开始再这里编写代码了！！
    logd("检查自动化环境...")

    logd("开始执行脚本...")

    let appId = "sjfjvkpw"
    let appSecret = "ykjscxcs"
    let cardNo = "cbwolrftnw"


    let inited = ecNetCard.netCardInit(appId, appSecret)
    logd("inited card => " + JSON.stringify(inited));
    let bind = ecNetCard.netCardBind(cardNo)
    logd("bind " + JSON.stringify(bind))
    loge("bind {}", JSON.stringify(bind))
    let bindResult = false;
    if (bind != null && bind != undefined && bind["code"] == 0) {
        loge("卡密绑定成功")
        loge("剩余时间：" + bind['data']['leftDays'] + "天")
        loge("激活时间：" + bind['data']['startTime'])
        loge("过期时间：" + bind['data']['expireTime'])
        bindResult = true;
    } else {
        if (bind == null || bind == undefined) {
            loge("卡密绑定失败,无返回值 ")
        } else {
            loge("卡密绑定失败: " + bind["msg"])
        }
    }

    sleep(5000)
    if (!bindResult) {
        return
    }

    // 云端变量演示
    let user_ageJson = ecNetCard.netCardGetCloudVar("user_age")
    //返回的json数据
    loge("user age=> " + JSON.stringify(user_ageJson))
    //取得对应的值
    loge("user age的字=> " + user_ageJson['data'])

    // 更新user_age的值
    let up = ecNetCard.netCardUpdateCloudVar("user_age", "12222");
    loge("netCardUpdateCloudVar => " + JSON.stringify(up))
    if (up['code'] == 0) {
        loge("netCardUpdateCloudVar 更新成功")
    }


    // 解绑（根据实际情况调用）
    // 也可以在后台解绑
    let unddd = ecNetCard.netCardUnbind(cardNo, "12323")
    loge("netCardUnbind {}", JSON.stringify(unddd))
    sleep(2000)


    while (true) {
        sleep(1000)
    }
}

main();
```

### ecNetCard.netCardUpdateCloudVar 更新远程变量 ​

- [网络验证-远程变量]更新远程变量
- 提卡网址 [[http://uc.ieasyclick.com](http://uc.ieasyclick.com)]
- 适配版本 EC 安卓 9.13.0+
- @param key 远程变量名称
- @param value 远程变量内容
- @return `{null|JSON}` 返回JSON对象,`{"code":0,"msg":""}`

```
function main() {
    //开始再这里编写代码了！！
    logd("检查自动化环境...")

    logd("开始执行脚本...")

    let appId = "sjfjvkpw"
    let appSecret = "ykjscxcs"
    let cardNo = "cbwolrftnw"


    let inited = ecNetCard.netCardInit(appId, appSecret)
    logd("inited card => " + JSON.stringify(inited));
    let bind = ecNetCard.netCardBind(cardNo)
    logd("bind " + JSON.stringify(bind))
    loge("bind {}", JSON.stringify(bind))
    let bindResult = false;
    if (bind != null && bind != undefined && bind["code"] == 0) {
        loge("卡密绑定成功")
        loge("剩余时间：" + bind['data']['leftDays'] + "天")
        loge("激活时间：" + bind['data']['startTime'])
        loge("过期时间：" + bind['data']['expireTime'])
        bindResult = true;
    } else {
        if (bind == null || bind == undefined) {
            loge("卡密绑定失败,无返回值 ")
        } else {
            loge("卡密绑定失败: " + bind["msg"])
        }
    }

    sleep(5000)
    if (!bindResult) {
        return
    }

    // 云端变量演示
    let user_ageJson = ecNetCard.netCardGetCloudVar("user_age")
    //返回的json数据
    loge("user age=> " + JSON.stringify(user_ageJson))
    //取得对应的值
    loge("user age的字=> " + user_ageJson['data'])

    // 更新user_age的值
    let up = ecNetCard.netCardUpdateCloudVar("user_age", "12222");
    loge("netCardUpdateCloudVar => " + JSON.stringify(up))
    if (up['code'] == 0) {
        loge("netCardUpdateCloudVar 更新成功")
    }


    // 解绑（根据实际情况调用）
    // 也可以在后台解绑
    let unddd = ecNetCard.netCardUnbind(cardNo, "12323")
    loge("netCardUnbind {}", JSON.stringify(unddd))
    sleep(2000)


    while (true) {
        sleep(1000)
    }
}

main();
```
