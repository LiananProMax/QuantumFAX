本页总览

## 说明 ​

- 截图函数需要Android 5.0 以上版本才能使用
- 无障碍模式下截图是需要权限的，如果弹出了运行截图，请授权
- 代理模式下的截图不需要权限，建议长期运行使用代理模式
- 图色模块的对象前缀是image，例如 image.requestScreenCapture()这样调用
- 图色模块需要对颜色进行查找，开发工具自带找色功能

## 设置 ​

### image.useOpencvMat 切换图片存储 ​

- 切换图片存储模式为opencv的mat格式
- 这个函数调用会初始化OPENCV，所以打包的时候组件要包含opencv组件(找图组件)
- 适合 EC 10.18.0+
- 切换后抓图、读取图片、找图、找色等都会切换到mat格式，速度更快内存更少
- 如果让图片格式切换请参考 imageToMatFormat和matToImageFormat两个函数
- @param use 1 是 0 否
- @return `{boolean|*}` true 成功 false 失败

```
function main() {
  let r = image.useOpencvMat(1);
  logd(r)
  //剩下的代码和之前一样 找色 找图等操作
}

main();
```

### image.setInitParam 初始化参数 ​

- 设置图色模块初始化参数,设置找图超时时间
- @param action_timeout 找图找色动作的最大时间，超时后会自动返回避免阻塞，单位是毫秒
- @param auto_click_request_dialog 是否自动点击截屏授权对话框，默认是true，自动点击

```
function main() {
  //action_timeout 找图找色动作的最大时间，超时后会自动返回避免阻塞
  // auto_click_request_dialog 是否自动点击截屏授权对话框，默认是true，自动点击
  // image.setInitParam({"action_timeout":1000});
  image.setInitParam(
    {
      "action_timeout": 20000,
      "auto_click_request_dialog": false
    }
  );
}

main();
```

### image.setFindColorImageMode 设置找色找图的算法模式 ​

- 设置找色找图的算法模式
- 适合EC 9.10.0+
- @param type 1 代表老的查找算法，2代表新的查找算法
- @return `{boolean}`

```
function main() {

  image.setFindColorImageMode(2);

}

main();
```

## 申请截图 ​

### image.requestScreenCapture 申请截图权限 ​

- 向系统申请屏幕截图权限，返回是否请求成功。
- 第一次使用该函数会弹出截图权限请求，建议选择“总是允许”。
- 这个函数只是申请截图权限，并不会真正执行截图，真正的截图函数是captureScreen()。
- 该函数在截图脚本中只需执行一次，而无需每次调用captureScreen()都调用一次。
- @param timeout 超时时间，单位是毫秒
- @param type 截屏的类型，0 自动选择，1 代表授权模式，2 代表无需权限模式（该模式前提条件：运行模式为代理模式）
- @return true 代表成功 false代表失败

```
function main() {
  logd("isServiceOk " + isServiceOk());
  startEnv()
  logd("isServiceOk " + isServiceOk());
  let request = image.requestScreenCapture(10000, 0);
  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  if (!request) {
    loge("申请截图权限失败,检查是否开启后台弹出,悬浮框等权限")
    exit()
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
}

main();
```

### image.releaseScreenCapture 释放截屏请求 ​

- 释放截屏请求

```
function main() {
  image.releaseScreenCapture();
}

main();
```

## 截图 ​

### image.captureScreen 截取屏幕Image对象 ​

- 截取当前屏幕并返回一个Image对象。
- 没有截图权限时执行该函数会返回null
- 两次调用可能返回相同的Image对象。这是因为设备截图的更新需要一定的时间，短时间内（一般来说是16ms）连续调用则会返回同一张截图。
- 截图需要转换为Bitmap格式，从而该函数执行需要一定的时间(0~20ms)。
- 另外在requestScreenCapture()执行成功后需要一定时间后才有截图可用，因此如果立即调用captureScreen()，会等待一定时间后( 一般为几百ms)才返回截图。
- 如果区域空或则有负数的，就会是全屏
- @param retryNumber 重试次数，直到能截到图为止，默认是3
- @param x 截图的起始X坐标
- @param y 截图的起始Y坐标
- @param ex 终点X坐标
- @param ey 终点Y坐标
- @return AutoImage对象或者null

```
function main() {
  logd("isServiceOk " + isServiceOk());
  startEnv()
  logd("isServiceOk " + isServiceOk());

  let request = image.requestScreenCapture(10000, 0);
  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  if (!request) {
    loge("申请截图权限失败,检查是否开启后台弹出,悬浮框等权限")
    exit()
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  for (let i = 0; i < 10; i++) {
    let cap = image.captureScreen(3, 0, 0, 300, 400)
    logd("截图数据: " + cap)
    sleep(1000)
    //图片要回收
    image.recycle(cap)
  }
}

main();
```

### image.captureFullScreen 截取全屏Image对象 ​

- 截取当前屏幕并返回一个Image对象。
- @return AutoImage对象或者null

```
function main() {
  logd("isServiceOk " + isServiceOk());
  startEnv()
  logd("isServiceOk " + isServiceOk());

  let request = image.requestScreenCapture(10000, 0);

  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  if (!request) {
    loge("申请截图权限失败,检查是否开启后台弹出,悬浮框等权限")
    exit()
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  for (let i = 0; i < 10; i++) {
    let cap = image.captureFullScreen()
    logd("截图数据: " + cap)
    sleep(1000)
    //图片要回收
    image.recycle(cap)
  }
}

main();
```

### image.captureFullScreenEx 截取全屏屏Image对象扩展 ​

- 抓取全屏函数，代理模式下并且requestScreenCapture函数的type为0的时候，会使用截屏函数，尽力消除色差问题。
- @return AutoImage对象或者null

```
function main() {
  logd("isServiceOk " + isServiceOk());
  startEnv()
  logd("isServiceOk " + isServiceOk());

  let request = image.requestScreenCapture(10000, 0);

  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  if (!request) {
    loge("申请截图权限失败,检查是否开启后台弹出,悬浮框等权限")
    exit()
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  for (let i = 0; i < 10; i++) {
    let cap = image.captureFullScreenEx()
    logd("截图数据: " + cap)
    sleep(1000)
    //图片要回收
    image.recycle(cap)
  }
}

main();
```

### image.captureScreenBitmap 截取屏幕Bitmap对象 ​

- 将屏幕抓取为Bitmap对象，如果中间有-1或者宽度、宽度为-1，将会是全屏
- @param format jpg或者png，代理模式下有用
- @param x 开始X坐标
- @param y 开始Y坐标
- @param ex 终点X坐标
- @param ey 终点Y坐标
- @param q 图片质量，1 - 100，越高越好，代理模式下有用
- @return Bitmap null或者bitmap对象

```
function main() {
  logd("isServiceOk " + isServiceOk());
  startEnv()
  logd("isServiceOk " + isServiceOk());

  let request = image.requestScreenCapture(10000, 0);

  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  if (!request) {
    loge("申请截图权限失败,检查是否开启后台弹出,悬浮框等权限")
    exit()
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  for (let i = 0; i < 10; i++) {
    let cap = image.captureScreenBitmap("jpg", 100, 100, 200, 300, 100);
    logd("截图数据: " + cap)
    sleep(1000)
    //图片要回收
    image.recycle(cap)
  }
}

main();
```

### image.captureScreenBitmapEx 截取Bitmap对象扩展 ​

- 将屏幕抓取为Bitmap对象，在代理模式下和captureScreenBitmap实现不一样，速度比captureScreenBitmap快
- 适合版本 EC 8.3.+
- @return Bitmap null或者bitmap对象

```
function main() {
  logd("isServiceOk " + isServiceOk());
  startEnv()
  logd("isServiceOk " + isServiceOk());

  let request = image.requestScreenCapture(10000, 0);

  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  if (!request) {
    loge("申请截图权限失败,检查是否开启后台弹出,悬浮框等权限")
    exit()
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  for (let i = 0; i < 10; i++) {
    let cap = image.captureScreenBitmapEx();
    logd("截图数据: " + cap)
    sleep(1000)
    //图片要回收
    image.recycle(cap)
  }
}

main();
```

### image.captureToFile 截取屏幕到文件 ​

- 截取当前屏幕并以PNG格式保存到path中。如果文件不存在会被创建；文件存在会被覆盖。
- 如果区域空或则有负数的，就会是全屏
- @param retryNumber 重试次数，直到能截到图为止，默认是3
- @param x 截图的起始X坐标
- @param y 截图的起始Y坐标
- @param ex 终点X坐标
- @param ey 终点Y坐标
- @param path 截图保存路径
- @return true 截图成功 false 代表不成功

```
function main() {
  logd("isServiceOk " + isServiceOk());
  startEnv()
  logd("isServiceOk " + isServiceOk());

  let request = image.requestScreenCapture(10000, 0);

  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  if (!request) {
    loge("申请截图权限失败,检查是否开启后台弹出,悬浮框等权限")
    exit()
  }
  home();
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  for (let i = 0; i < 10; i++) {
    let cap = image.captureToFile(3, 0, 0, 300, 400, "/sdcard/a" + i + ".png");
    logd("是否成功: " + cap)
    sleep(1000)
  }
}

main();
```

### image.screencapImage screencap命令截图 ​

- 使用系统的screencap命令截图AutoImage，适合root或者代理模式, 有root权限或者开启了代理服务
- 适合版本 EC 6.8.0+
- @param root 是否优先使用root方式截图
- @return AutoImage 对象或者null

```
function main() {
  startEnv()
  for (let i = 0; i < 10; i++) {
    sleep(1000);
    let d = image.screencapImage(false);
    logd(d);
    if (d) {
      let r = image.saveTo(d, "/sdcard/data/a" + i + ".png");
      logd(r);
      image.recycle(d)

      logd("isRecycled " + image.isRecycled(d));
    }

  }

}

main()
```

### image.screencapBitmap screencap命令截图Bitmap ​

- 使用系统的screencap命令截图为bitmap，适合root或者代理模式, 有root权限或者开启了代理服务
- 适合版本 EC 6.8.0+
- @param root 是否优先使用root方式截图
- @return `{Bitmap}` 对象

```
function main() {
  startEnv()
  for (let i = 0; i < 10; i++) {
    sleep(1000);
    let d = image.screencapBitmap(false);
    logd(d);
    if (d) {
      let r = image.saveBitmap(d, "png", 100, "/sdcard/data/b" + i + ".png");
      logd(r);

      image.recycle(d)

      logd("isRecycled " + image.isRecycled(d));

    }
  }
}

main()
```

## 比色 ​

### image.cmpColor 多点比色 ​

- 单点或者多点比色，找到所有符合标准的点，如果都符合返回true，否则是false
- @param image1 图片
- @param points 字符串类似这样 6|1|0x969696-0x000010,1|12|0x969696,-4|0|0x969696
- @param threshold 找色时颜色相似度取值为 0.0 ~ 1.0
- @param x 区域的X起始坐标，默认填写0全屏查找
- @param y 区域的Y起始坐标，默认填写0全屏查找
- @param ex 终点X坐标，默认填写0全屏查找
- @param ey 终点Y坐标，默认填写0全屏查找
- @return 布尔型，true代表找到了 false代表未找到

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let aimage = image.captureFullScreen();
  if (aimage != null) {
    let points3 = "205|1130|0xff944b-0x101010,211|1158|0xff8e42,191|1175|0xfcfbf7";
    let points = image.cmpColor(aimage, points3, 0.9, 0, 0, 0, 0);
    logd("points " + points);
    //图片要回收
    image.recycle(aimage)
  }

}

main();
```

### image.cmpColorJ 多点比色(JSON) ​

- 单点或者多点比色，找到所有符合标准的点，如果都符合返回true，否则是false
- 运行环境: 无限制
- 兼容版本: Android 5.0 以上
- @param image1 图片
- @param jsonFileName 使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json
- @return `{boolean}` true代表找到了 false代表未找到

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let aimage = image.captureFullScreen();
  if (aimage != null) {
    let points = image.cmpColorJ(aimage, "a.json");
    logd("points " + points);
    //图片要回收
    image.recycle(aimage)
  }
}

main();
```

### image.cmpColorEx 多点比色扩展 ​

- 单点或者多点比色，找到所有符合标准的点，自动截图，如果都符合返回true，否则是false
- @param points 字符串类似这样 6|1|0x969696-0x000010,1|12|0x969696,-4|0|0x969696
- @param threshold 找色时颜色相似度取值为 0.0 ~ 1.0
- @param x 区域的X起始坐标，默认填写0全屏查找
- @param y 区域的Y起始坐标，默认填写0全屏查找
- @param ex 终点X坐标，默认填写0全屏查找
- @param ey 终点Y坐标，默认填写0全屏查找
- @return 布尔型，true代表找到了 false代表未找到

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let points3 = "205|1130|0xff944b-0x101010,211|1158|0xff8e42,191|1175|0xfcfbf7";
  let points = image.cmpColorEx(points3, 0.9, 0, 0, 0, 0);
  logd("points " + points);

}

main();
```

### image.cmpMultiColor 多组比色 ​

- 多点或者多点数组比色，找到所有符合标准的点，依次查找，如果找到就返回当前points的索引值，如果返回-1，说明都没有找到
- @param image1 图片
- @param points 数组类似这样 ["6|1|0x969696-0x000010,1|12|0x969696,-4|0|0x969696","6|1|0x969696"]
- @param threshold 找色时颜色相似度取值为 0.0 ~ 1.0
- @param x 区域的X起始坐标，默认填写0全屏查找
- @param y 区域的Y起始坐标，默认填写0全屏查找
- @param ex 终点X坐标，默认填写0全屏查找
- @param ey 终点Y坐标，默认填写0全屏查找
- @return 整型，如果找到就返回当前points的索引值，如果返回-1，说明都没有找到

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let aimage = image.captureFullScreen();
  if (aimage != null) {
    let points1 = "205|112230|0xff944b,211|1158|0xff8e42,191|1175|0xfcfbf7";
    let points2 = "205|113022|0xff944b,211|1158|0xff8e42,191|1175|0xfcfbf7";
    let points3 = "205|1130|0xff944b,211|1158|0xff8e42,191|1175|0xfcfbf7";
    let points = image.cmpMultiColor(aimage, [points1, points2, points3], 0.9, 0, 0, 0, 0);
    logd("points " + points);
    //图片要回收
    image.recycle(aimage)
  }
}

main();
```

### image.cmpMultiColorJ 多组比色(JSON) ​

- 多点或者多点数组比色，找到所有符合标准的点，依次查找，如果找到就返回当前points的索引值，如果返回-1，说明都没有找到
- 运行环境: 无限制
- 兼容版本: Android 5.0 以上
- @param image1 图片
- @param jsonFileName 使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json
- @return `{boolean}` true代表找到了 false代表未找到

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let aimage = image.captureFullScreen();
  if (aimage != null) {
    let points = image.cmpMultiColorJ(aimage, "a.json");
    logd("points " + points);
    //图片要回收
    image.recycle(aimage)
  }
}

main();
```

### image.cmpMultiColorEx 多组比色扩展 ​

- 多点或者多点数组比色，找到所有符合标准的点，自动截屏，依次查找，如果找到就返回当前points的索引值，如果返回-1，说明都没有找到
- @param points 数组类似这样 ["6|1|0x969696-0x000010,1|12|0x969696,-4|0|0x969696","6|1|0x969696"]
- @param threshold 找色时颜色相似度取值为 0.0 ~ 1.0
- @param x 区域的X起始坐标，默认填写0全屏查找
- @param y 区域的Y起始坐标，默认填写0全屏查找
- @param ex 终点X坐标，默认填写0全屏查找
- @param ey 终点Y坐标，默认填写0全屏查找
- @return 整型，如果找到就返回当前points的索引值，如果返回-1，说明都没有找到

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let points1 = "205|112230|0xff944b,211|1158|0xff8e42,191|1175|0xfcfbf7";
  let points2 = "205|113022|0xff944b,211|1158|0xff8e42,191|1175|0xfcfbf7";
  let points3 = "205|1130|0xff944b,211|1158|0xff8e42,191|1175|0xfcfbf7";
  let points = image.cmpMultiColorEx([points1, points2, points3], 0.9, 0, 0, 0, 0);
  logd("points " + points);
}

main();
```

## 找色 ​

### image.findColor 单点找色 ​

- 在图片中找到颜色和color完全相等的某个点，并返回该点的坐标；如果没有找到，则返回null。
- @param image 图片
- @param color 要寻找的颜色类似， 0xCDD7E9-0x101010,0xCDD7E9-0x101010
- @param threshold 找色时颜色相似度取值为 0.0 ~ 1.0
- @param x 区域的X起始坐标
- @param y 区域的Y起始坐标
- @param ex 终点X坐标
- @param ey 终点Y坐标
- @param limit 限制个数
- @param orz 方向，分别从1-8
- @return 多个 PointIndex 坐标点数组或者null

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let aimage = image.captureFullScreen();
  if (aimage != null) {
    let points = image.findColor(aimage, "0xCDD7E9-0x101010,0xCDD7E9-0x101010", 0.9, 0, 0, 0, 0, 10, 1);
    logd("points " + JSON.stringify(points));
    //这玩意是个数组
    if (points) {
      for (let i = 0; i < points.length; i++) {
        logd(JSON.stringify(points[i]), points[i].x, points[i].y)
        //点击坐标
        clickPoint(points[i].x, points[i].y)
      }
    }
    //图片要回收
    image.recycle(aimage)
  }

}

main();
```

### image.findColorJ 单点找色(JSON) ​

- 在图片中找到颜色和color完全相等的点，参数从JSON中获取如果没有找到，则返回null。
- 运行环境: 无限制
- 兼容版本: Android 5.0 以上
- @param image 图片
- @param jsonFileName 使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json
- @return `{null|PointIndex[]}` 坐标点数组或者null

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let aimage = image.captureFullScreen();
  if (aimage != null) {
    let points = image.findColorJ(aimage, "金币.json");
    logd("points " + JSON.stringify(points));
    //这玩意是个数组
    if (points && points.length > 0) {
      for (let i = 0; i < points.length; i++) {
        logd(JSON.stringify(points[i]), points[i].x, points[i].y)
        //点击坐标
        clickPoint(points[i].x, points[i].y)
      }
    }
    //图片要回收
    image.recycle(aimage)
  }

}

main();
```

### image.findColorEx 自动截屏单点找色 ​

- 在当前屏幕中找到颜色和color完全相等的点，并返回该点的坐标；如果没有找到，则返回null。
- @param color 要寻找的颜色
- @param threshold 找色时颜色相似度取值为 0.0 ~ 1.0
- @param x 区域的X起始坐标
- @param y 区域的Y起始坐标
- @param ex 终点X坐标
- @param ey 终点Y坐标
- @param limit 限制个数
- @param orz 方向，分别从1-8
- @return 多个 PointIndex 坐标点数组或者null

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let points = image.findColorEx("0xCDD7E9-0x101010,0xCDD7E9-0x101010", 0.9, 0, 0, 0, 0, 10, 1);
  logd("points " + JSON.stringify(points));
  //这玩意是个数组
  if (points && points.length > 0) {
    for (let i = 0; i < points.length; i++) {
      logd(JSON.stringify(points[i]), points[i].x, points[i].y)
      //点击坐标
      clickPoint(points[i].x, points[i].y)
    }
  }

}

main();
```

### image.findColorExJ 自动截屏单点找色(JSON) ​

- 当前屏幕中找到颜色和color完全相等的点，参数从JSON中获取如果没有找到，则返回null。
- @param jsonFileName 使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json
- @return 多个 PointIndex 坐标点数组或者null

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let points = image.findColorExJ("金币.json");
  logd("points " + JSON.stringify(points));
  //这玩意是个数组
  if (points && points.length > 0) {
    for (let i = 0; i < points.length; i++) {
      logd(points[i], points[i].x, points[i].y)
      //点击坐标
      clickPoint(points[i].x, points[i].y)
    }
  }

}

main();
```

### image.findMultiColor 多点找色 ​

- 多点找色，找到所有符合标准的点，类似于按键精灵的多点找色。
- @param image 要找色的图片
- @param firstColor 第一个点的颜色
- @param threshold 找色时颜色相似度取值为 0.0 ~ 1.0
- @param points 字符串类似这样 6|1|0x969696-0x000010,1|12|0x969696,-4|0|0x969696
- @param x 区域的X起始坐标
- @param y 区域的Y起始坐标
- @param ex 终点X坐标
- @param ey 终点Y坐标
- @param limit 限制个数
- @param orz 方向，分别从1-8
- @return 多个Point 坐标点数组或者null

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let aimage = image.captureFullScreen();
  if (aimage != null) {
    let points = image.findMultiColor(aimage, "0xDD7A5F-0x101010", "29|25|0xBB454B-0x101010,58|44|0xA6363A-0x101010", 0.9, 0, 0, 0, 0, 10, 1);
    logd("points " + JSON.stringify(points));
    //这玩意是个数组
    if (points && points.length > 0) {
      for (let i = 0; i < points.length; i++) {
        logd(points[i], points[i].x, points[i].y)
        //点击坐标
        clickPoint(points[i].x, points[i].y)
      }
    }
    //图片要回收
    image.recycle(aimage)
  }

}

main();
```

### image.findMultiColorJ 多点找色(JSON) ​

- 多点找色，找到所有符合标准的点，参数从JSON文件中读取，类似于按键精灵的多点找色
- 整张图片都找不到时返回null
- 运行环境: 无限制
- 兼容版本: Android 5.0 以上
- @param image1 要找色的图片
- @param jsonFileName 使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json
- @return `{null|Point[]}` 坐标点数组或者null

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let aimage = image.captureFullScreen();
  if (aimage != null) {
    let points = image.findMultiColorJ(aimage, "金币.json");
    logd("points " + JSON.stringify(points));
    //这玩意是个数组
    if (points && points.length > 0) {
      for (let i = 0; i < points.length; i++) {
        logd(points[i], points[i].x, points[i].y)
        //点击坐标
        clickPoint(points[i].x, points[i].y)
      }
    }
    //图片要回收
    image.recycle(aimage)
  }

}

main();
```

### image.findMultiColorEx 自动截屏多点找色 ​

- 多点找色，找到所有符合标准的点，类似于按键精灵的多点找色。
- @param firstColor 第一个点的颜色
- @param threshold 找色时颜色相似度取值为 0.0 ~ 1.0
- @param points 字符串类似这样 6|1|0x969696-0x000010,1|12|0x969696,-4|0|0x969696
- @param x 区域的X起始坐标
- @param y 区域的Y起始坐标
- @param ex 终点X坐标
- @param ey 终点Y坐标
- @param limit 限制个数
- @param orz 方向，分别从1-8
- @return 多个Point 坐标点数组或者null

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }

  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let points = image.findMultiColorEx("0xDD7A5F-0x101010", "29|25|0xBB454B-0x101010,58|44|0xA6363A-0x101010", 0.9, 0, 0, 0, 0, 10, 1);
  logd("points " + JSON.stringify(points));
  //这玩意是个数组
  if (points && points.length > 0) {
    for (let i = 0; i < points.length; i++) {
      logd(points[i], points[i].x, points[i].y)
      //点击坐标
      clickPoint(points[i].x, points[i].y)
    }
  }


}

main();
```

### image.findMultiColorExJ 自动截屏多点找色(JSON) ​

- 多点找色，找到所有符合标准的点，自动抓取当前屏幕的图片,参数从JSON文件中读取，类似于按键精灵的多点找色
- 整张图片都找不到时返回null
- @param jsonFileName 使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json
- @return `{null|Point[]}` 坐标点数组或者null

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let points = image.findMultiColorExJ("金币.json");
  logd("points " + JSON.stringify(points));
  //这玩意是个数组
  if (points && points.length > 0) {
    for (let i = 0; i < points.length; i++) {
      logd(points[i], points[i].x, points[i].y)
      //点击坐标
      clickPoint(points[i].x, points[i].y)
    }
  }
}

main();
```

## 找非色 ​

### image.findNotColor 找非色 ​

- 在图片中找到颜色和color完全不相等的点，如果没有找到，则返回null。
- @param image 图片
- @param color 要寻找的颜色类似， 0xCDD7E9-0x101010,0xCDD7E9-0x101010
- @param threshold 找色时颜色相似度取值为 0.0 ~ 1.0
- @param x 区域的X起始坐标
- @param y 区域的Y起始坐标
- @param ex 终点X坐标
- @param ey 终点Y坐标
- @param limit 限制个数
- @param orz 方向，分别从1-8
- @return 多个 PointIndex 坐标点数组或者null

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let aimage = image.captureFullScreen();
  if (aimage != null) {
    let points = image.findNotColor(aimage, "0xCDD7E9-0x101010,0xCDD7E9-0x101010", 0.9, 0, 0, 0, 0, 10, 1);
    logd("points " + JSON.stringify(points));
    //这玩意是个数组
    if (points) {
      for (let i = 0; i < points.length; i++) {
        logd(JSON.stringify(points[i]), points[i].x, points[i].y)
        //点击坐标
        clickPoint(points[i].x, points[i].y)
      }
    }
    //图片要回收
    image.recycle(aimage)
  }

}

main();
```

### image.findNotColorJ 找非色(JSON) ​

- 在图片中找到颜色和color完全不相等的点，如果没有找到，则返回null。
- @param image1 图片
- @param jsonFileName 使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json
- @return `{null|PointIndex[]}` 多个 PointIndex 坐标点数组或者null

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let aimage = image.captureFullScreen();
  if (aimage != null) {
    let points = image.findNotColorJ(aimage, "a.json");
    logd("points " + JSON.stringify(points));
    //这玩意是个数组
    if (points) {
      for (let i = 0; i < points.length; i++) {
        logd(JSON.stringify(points[i]), points[i].x, points[i].y)
        //点击坐标
        clickPoint(points[i].x, points[i].y)
      }
    }
    //图片要回收
    image.recycle(aimage)
  }

}

main();
```

## 找图 ​

### image.initOpenCV 初始化OpenCV ​

- 初始化OPENCV 类库
- 如果使用找图请先调用这个函数，第一次初始化需要复制类库，时间可能较长，以后再次执行就很快
- @return 布尔型 true 代表成功 false代表失败

```
function main() {
  let req = startEnv();
  if (!req) {
    toast("申请权限失败");
    return;
  }
  sleep(1000)
  let d = image.initOpenCV();
  logd(d)
}

main();
```

### image.findImageByColor 透明找图 ​

- 透明找图（这个函数不需要初始化Opencv）
- 支持版本: EC 7.15.+
- @param image 大图片
- @param template 小图片（模板）
- @param x 找图区域 x 起始坐标
- @param y 找图区域 y 起始坐标
- @param ex 终点X坐标
- @param ey 终点Y坐标
- @param threshold 图片相似度。取值范围为0~1的浮点数。默认值为0.9。
- @param limit 限制结果的数量，如果要找到1个，就填写1，如果是多个请填写多个
- @return 多个Point 坐标点数组或者null

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (request) {
    toast("申请成功");
  } else {
    toast("申请失败");
    exit();
  }


  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  //从工程目录下res文件夹下读取sms.png文件
  let sms = readResAutoImage("sms.png");
  //抓取屏幕
  let aimage = image.captureFullScreen();
  logd("aimage " + aimage);
  if (aimage != null) {
    //在图片中查找
    let points = image.findImageByColor(aimage, sms, 0, 0, 0, 0, 0.8, 5);
    logd("points " + JSON.stringify(points));
    //这玩意是个数组
    if (points && points.length > 0) {
      for (let i = 0; i < points.length; i++) {
        logd(points[i])
        let x = points[i].x
        let y = points[i].y
        //点击坐标
        clickPoint(x, y)
      }
    }
    //图片要回收
    image.recycle(aimage)
  }
//图片要回收
  image.recycle(sms)
}

main();
```

### image.findImageByColorJ 透明找图(JSON) ​

- 通过颜色找图，支持透明图，这个不需要处理话opencv
- 整张图片都找不到时返回null
- @param image1 大图片
- @param jsonFileName 使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json, 小图路径请到json文件配置
- @return `{null|Point[]}` 坐标点数组或者null

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (request) {
    toast("申请成功");
  } else {
    toast("申请失败");
    exit();
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  //抓取屏幕
  let aimage = image.captureFullScreen();
  logd("aimage " + aimage);
  if (aimage != null) {
    //在图片中查找
    let points = image.findImageByColorJ(aimage, "a.json");
    logd("points " + JSON.stringify(points));
    //这玩意是个数组
    if (points && points.length > 0) {
      for (let i = 0; i < points.length; i++) {
        logd(points[i])
        let x = points[i].x
        let y = points[i].y
        //点击坐标
        clickPoint(x, y)
      }
    }
    image.recycle(aimage)
  }
}

main();
```

### image.findImageByColorEx 透明找图扩展 ​

- 通过颜色找图，支持透明图，这个不需要处理话opencv
- 整张图片都找不到时返回null
- 支持版本: EC 8.3.+
- @param image1 大图片
- @param template 小图片（模板）
- @param x 找图区域 x 起始坐标
- @param y 找图区域 y 起始坐标
- @param ex 终点X坐标
- @param ey 终点Y坐标
- @param limit 限制结果的数量，如果要找到1个，就填写1，如果是多个请填写多个
- @param extra 扩展函数，map结构例如 * `{"firstColorOffset":"#101010","firstColorThreshold":1.0,"otherColorOffset":"#101010","otherColorThreshold":0.9,"cmpColorSucThreshold":1.0}`
- firstColorOffset: 第一个匹配到的颜色偏色,例如 #101010
- firstColorThreshold: 第一个匹配到的颜色偏色系数，例如 0.9
- otherColorOffset: 剩下需要找的颜色 偏色,例如 #101010
- otherColorThreshold: 剩下需要找的颜色 偏色系数，例如 0.9
- cmpColorSucThreshold: 成功匹配多少个颜色系数 就认为是成功的，例如 0.9 = 90%个点
- startX: 第一个点从哪里开始找的X坐标
- startY: 第一个点从哪里开始找的Y坐标
- @return 多个Point 坐标点数组或者null

```
function main() {
  let d = startEnv();
  logd("启动服务--{}", d)
  let smallTmplate = readResAutoImage("tmp4.png");

  for (let i = 0; i < 100; i++) {
    sleep(1000)
    let img = image.captureFullScreen();
    logd("img = {}", img)
    if (img == null) {
      continue
    }
    console.time(1)
    let extra = {
      "firstColorOffset": "#202020",
      "otherColorOffset": "#000000",
      "cmpColorSucThreshold": 1,
      "firstColorThreshold": "1",
      "otherColorThreshold": "1",
      "startX": 0,
      "startY": 0
    }
    let points = image.findImageByColorEx(img, smallTmplate, 0, 0, 0, 0, 100, extra);
    logd("time-{}", console.timeEnd(1))
    //这玩意是个数组
    if (points) {
      logd("points " + JSON.stringify(points));
    }

    image.recycle(img)

  }

  image.recycle(smallTmplate)
}

main()
```

### image.findImageByColorExJ 透明找图扩展(JSON) ​

- 通过颜色找图，支持透明图，这个不需要处理话opencv
- 整张图片都找不到时返回null
- @param image1 大图片
- @param jsonFileName 使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json, 小图路径请到json文件配置
- @return `{null|Point[]}` 坐标点数组或者null

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (request) {
    toast("申请成功");
  } else {
    toast("申请失败");
    exit();
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  //抓取屏幕
  let aimage = image.captureFullScreen();
  logd("aimage " + aimage);
  if (aimage != null) {
    //在图片中查找
    let points = image.findImageByColorExJ(aimage, "a.json");
    logd("points " + JSON.stringify(points));
    //这玩意是个数组
    if (points && points.length > 0) {
      for (let i = 0; i < points.length; i++) {
        logd(points[i])
        let x = points[i].x
        let y = points[i].y
        //点击坐标
        clickPoint(x, y)
      }
    }
    image.recycle(aimage)
  }
}

main();
```

### image.findImage 找图 ​

- 找图。在大图片image中查找小图片template的位置（模块匹配），找到时返回位置坐标区域(Rect)，找不到时返回null。
- @param image 大图片
- @param template 小图片（模板）
- @param x 找图区域 x 起始坐标
- @param y 找图区域 y 起始坐标
- @param ex 终点X坐标
- @param ey 终点Y坐标
- @param weakThreshold 弱阈值。该值用于在每一轮模板匹配中检验是否继续匹配。如果相似度小于该值，则不再继续匹配。取值范围为0~ 1的浮点数。默认值为0.7。
- @param threshold 图片相似度。取值范围为0~1的浮点数。默认值为0.9。
- @param limit 限制结果的数量，如果要找到1个，就填写1，如果是多个请填写多个
- @param method 0: TM_SQDIFF平方差匹配法,1: TM_SQDIFF_NORMED归一化平方差匹配方法,2: TM_CCORR相关匹配法,3: TM_CCORR_NORMED归一化相关匹配法,4: TM_CCOEFF系数匹配法,5: TM_CCOEFF_NORMED归一化系数匹配法
- @return `{Rect}` 区域坐标对象数组或者null

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (request) {
    toast("申请成功");
  } else {
    toast("申请失败");
    exit();
  }
  let d = image.initOpenCV();
  logd(d)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  //从工程目录下res文件夹下读取sms.png文件
  let sms = readResAutoImage("sms.png");
  //抓取屏幕
  let aimage = image.captureFullScreen();
  logd("aimage " + aimage);
  if (aimage != null) {
    //在图片中查找
    let points = image.findImage(aimage, sms, 0, 0, 0, 0, 0.7, 0.9, 21, 5);
    logd("points " + JSON.stringify(points));
    //这玩意是个数组
    if (points && points.length > 0) {
      for (let i = 0; i < points.length; i++) {
        logd(points[i])
        logd("相似度: " + points[i]['similarity'])
        let x = parseInt((points[i].left + points[i].right) / 2)
        let y = parseInt((points[i].top + points[i].bottom) / 2)
        //点击坐标
        clickPoint(x, y)
      }
    }
    //图片要回收
    image.recycle(aimage)
  }
  //图片要回收
  image.recycle(sms)
}

main();
```

### image.findImageJ 找图(JSON) ​

- 找图。在大图片image中查找小图片template的位置（模块匹配），找到时返回位置坐标区域(Rect)，找不到时返回null。
- @param image1 大图片
- @param jsonFileName 使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json, 小图路径请到json文件配置
- @return `{null|Rect[]}` 区域坐标对象数组或者null

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (request) {
    toast("申请成功");
  } else {
    toast("申请失败");
    exit();
  }
  let d = image.initOpenCV();
  logd(d)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  //抓取屏幕
  let aimage = image.captureFullScreen();
  logd("aimage " + aimage);
  if (aimage != null) {
    //在图片中查找
    let points = image.findImageJ(aimage, "a.json");
    logd("points " + JSON.stringify(points));
    //这玩意是个数组
    if (points && points.length > 0) {
      for (let i = 0; i < points.length; i++) {
        logd(points[i])
        logd("相似度: " + points[i]['similarity'])
        let x = parseInt((points[i].left + points[i].right) / 2)
        let y = parseInt((points[i].top + points[i].bottom) / 2)
        //点击坐标
        clickPoint(x, y)
      }
    }
    //图片要回收
    image.recycle(aimage)
  }
}

main();
```

### image.findImage2 找图(含缩放) ​

- 找图。在大图片image中查找小图片template的位置（模块匹配），找到时返回位置坐标区域(Rect)，找不到时返回null。
- 找图函数缩放找图，比findImage更精准
- 适合版本 EC 9.41.0+
- @param image 大图片
- @param template 小图片（模板）
- @param x 找图区域 x 起始坐标
- @param y 找图区域 y 起始坐标
- @param ex 终点X坐标
- @param ey 终点Y坐标
- @param weakThreshold 弱阈值。该值用于在每一轮模板匹配中检验是否继续匹配。如果相似度小于该值，则不再继续匹配。取值范围为0~ 1的浮点数。默认值为0.7。
- @param threshold 图片相似度。取值范围为0~1的浮点数。默认值为0.9。
- @param limit 限制结果的数量，如果要找到1个，就填写1，如果是多个请填写多个
- @param method 0: TM_SQDIFF平方差匹配法,1: TM_SQDIFF_NORMED归一化平方差匹配方法,2: TM_CCORR相关匹配法,3: TM_CCORR_NORMED归一化相关匹配法,4: TM_CCOEFF系数匹配法,5: TM_CCOEFF_NORMED归一化系数匹配法
- @return `{Rect}` 区域坐标对象数组或者null

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (request) {
    toast("申请成功");
  } else {
    toast("申请失败");
    exit();
  }
  let d = image.initOpenCV();
  logd(d)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  //从工程目录下res文件夹下读取sms.png文件
  let sms = readResAutoImage("sms.png");
  //抓取屏幕
  let aimage = image.captureFullScreen();
  logd("aimage " + aimage);
  if (aimage != null) {
    //在图片中查找
    let points = image.findImage2(aimage, sms, 0, 0, 0, 0, 0.7, 0.9, 21, 5);
    logd("points " + JSON.stringify(points));
    //这玩意是个数组
    if (points && points.length > 0) {
      for (let i = 0; i < points.length; i++) {
        logd(points[i])
        logd("相似度: " + points[i]['similarity'])
        let x = parseInt((points[i].left + points[i].right) / 2)
        let y = parseInt((points[i].top + points[i].bottom) / 2)
        //点击坐标
        clickPoint(x, y)
      }
    }
    //图片要回收
    image.recycle(aimage)
  }
  //图片要回收
  image.recycle(sms)
}

main();
```

### image.findImage2J 找图(JSON) ​

- 找图。在大图片image中查找小图片template的位置（模块匹配），找到时返回位置坐标区域(Rect)，找不到时返回null。
- @param image1 大图片
- @param jsonFileName 使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json, 小图路径请到json文件配置
- @return `{null|Rect[]}` 区域坐标对象数组或者null

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (request) {
    toast("申请成功");
  } else {
    toast("申请失败");
    exit();
  }
  let d = image.initOpenCV();
  logd(d)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  //抓取屏幕
  let aimage = image.captureFullScreen();
  logd("aimage " + aimage);
  if (aimage != null) {
    //在图片中查找
    let points = image.findImage2J(aimage, "a.json");
    logd("points " + JSON.stringify(points));
    //这玩意是个数组
    if (points && points.length > 0) {
      for (let i = 0; i < points.length; i++) {
        logd(points[i])
        logd("相似度: " + points[i]['similarity'])
        let x = parseInt((points[i].left + points[i].right) / 2)
        let y = parseInt((points[i].top + points[i].bottom) / 2)
        //点击坐标
        clickPoint(x, y)
      }
    }
    image.recycle(aimage)
  }
}

main();
```

### image.findImageEx 自动截屏找图 ​

- 找图。在当前屏幕中查找小图片template的位置（模块匹配），找到时返回位置坐标区域(Rect)，找不到时返回null。
- @param template 小图片（模板）
- @param x 找图区域 x 起始坐标
- @param y 找图区域 y 起始坐标
- @param ex 终点X坐标
- @param ey 终点Y坐标
- @param weakThreshold 弱阈值。该值用于在每一轮模板匹配中检验是否继续匹配。如果相似度小于该值，则不再继续匹配。取值范围为0~ 1的浮点数。默认值为0.7。
- @param threshold 图片相似度。取值范围为0~1的浮点数。默认值为0.9。
- @param limit 限制结果的数量，如果要找到1个，就填写1，如果是多个请填写多个
- @param method 0: TM_SQDIFF平方差匹配法,1: TM_SQDIFF_NORMED归一化平方差匹配方法,2: TM_CCORR相关匹配法,3: TM_CCORR_NORMED归一化相关匹配法,4: TM_CCOEFF系数匹配法,5: TM_CCOEFF_NORMED归一化系数匹配法
- @return `{Rect}` 区域坐标对象数组或者null

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (request) {
    toast("申请成功");
  } else {
    toast("申请失败");
    exit();
  }
  let d = image.initOpenCV();
  logd(d)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  //从工程目录下res文件夹下读取sms.png文件
  let sms = readResAutoImage("sms.png");
  //在当前屏幕中查找，并且限制只查找一个
  let points = image.findImageEx(sms, 0, 0, 0, 0, 0.7, 0.9, 21, 5);
  logd("points " + JSON.stringify(points));
  //这玩意是个数组
  if (points && points.length > 0) {
    for (let i = 0; i < points.length; i++) {
      logd(points[i])
      let x = parseInt((points[i].left + points[i].right) / 2)
      let y = parseInt((points[i].top + points[i].bottom) / 2)
      //点击坐标
      clickPoint(x, y)
    }
  }
  //图片要回收
  image.recycle(sms)
}

main();
```

### image.matchTemplate 图片模板匹配 ​

- OpenCV模板匹配封装
- @param image 大图片
- @param template 小图片（模板）
- @param weakThreshold 弱阈值。该值用于在每一轮模板匹配中检验是否继续匹配。如果相似度小于该值，则不再继续匹配。取值范围为0~ 1的浮点数。默认值为0.9。
- @param threshold 强阈值。该值用于检验最终匹配结果，以及在每一轮匹配中如果相似度大于该值则直接返回匹配结果。。取值范围为0~ 1的浮点数。默认值为0.9。
- @param rect 找图区域。参见findColor函数关于 rect 的说明。
- @param maxLevel 默认为-1，一般而言不必修改此参数。不加此参数时该参数会根据图片大小自动调整。找图算法是采用图像金字塔进行的, level参数表示金字塔的层次, level越大可能带来越高的找图效率，但也可能造成找图失败（图片因过度缩小而无法分辨）或返回错误位置。因此，除非您清楚该参数的意义并需要进行性能调优，否则不需要用到该参数。
- @param limit 限制结果的数量，如果要找到1个，就填写1，如果是多个请填写多个
- @param method 0: TM_SQDIFF平方差匹配法,1: TM_SQDIFF_NORMED归一化平方差匹配方法,2: TM_CCORR相关匹配法,3: TM_CCORR_NORMED归一化相关匹配法,4: TM_CCOEFF系数匹配法,5: TM_CCOEFF_NORMED归一化系数匹配法
- @return `{Match}` 集合 或者null

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  let d = image.initOpenCV();
  logd(d)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let aimage = image.captureFullScreen();
  if (aimage != null) {
    let temp = readResAutoImage("tmp.png");
    let rectp = new Rect();
    rectp.left = 0;
    rectp.top = 0;
    rectp.right = device.getScreenWidth();
    rectp.bottom = device.getScreenHeight();
    let matchs = image.matchTemplate(aimage, temp, 0.7, 0.9, rectp, -1, 10, 5);
    //这玩意是个数组
    logd(JSON.stringify(matchs));
    //这玩意是个数组
    if (matchs && matchs.length > 0) {
      for (let i = 0; i < matchs.length; i++) {
        logd(JSON.stringify(matchs[i]));
        clickPoint(matchs[i].point.x, matchs[i].point.y)
      }
    }
    //图片要回收
    image.recycle(aimage)
    //图片要回收
    image.recycle(temp)
  }
}

main();
```

### image.matchTemplateJ 图片模板匹配(JSON) ​

- OpenCV模板匹配封装
- @param image1 大图片
- @param jsonFileName 使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json, 小图路径请到json文件配置
- @return `{null|Match[]}` 匹配到的集合

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  let d = image.initOpenCV();
  logd(d)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let aimage = image.captureFullScreen();
  if (aimage != null) {
    let matchs = image.matchTemplateJ(aimage, "a.json");
    //这玩意是个数组
    logd(JSON.stringify(matchs));
    //这玩意是个数组
    if (matchs && matchs.length > 0) {
      for (let i = 0; i < matchs.length; i++) {
        logd(JSON.stringify(matchs[i]));
        clickPoint(matchs[i].point.x, matchs[i].point.y)
      }
    }
    //图片要回收
    image.recycle(aimage)
  }
}

main();
```

### image.matchTemplate2 图片模板匹配(函数缩放) ​

- OpenCV模板匹配封装
- 包含缩放找图功能
- 适配版本 EC 9.41.0+
- @param template 小图片（模板）
- @param weakThreshold 弱阈值。该值用于在每一轮模板匹配中检验是否继续匹配。如果相似度小于该值，则不再继续匹配。取值范围为0~ 1的浮点数。默认值为0.9。
- @param threshold 强阈值。该值用于检验最终匹配结果，以及在每一轮匹配中如果相似度大于该值则直接返回匹配结果。。取值范围为0~ 1的浮点数。默认值为0.9。
- @param rect 找图区域。参见findColor函数关于 rect 的说明。
- @param maxLevel 默认为-1，一般而言不必修改此参数。不加此参数时该参数会根据图片大小自动调整。找图算法是采用图像金字塔进行的, level参数表示金字塔的层次, level越大可能带来越高的找图效率，但也可能造成找图失败（图片因过度缩小而无法分辨）或返回错误位置。因此，除非您清楚该参数的意义并需要进行性能调优，否则不需要用到该参数。
- @param limit 限制结果的数量，如果要找到1个，就填写1，如果是多个请填写多个
- @param method 0: TM_SQDIFF平方差匹配法,1: TM_SQDIFF_NORMED归一化平方差匹配方法,2: TM_CCORR相关匹配法,3: TM_CCORR_NORMED归一化相关匹配法,4: TM_CCOEFF系数匹配法,5: TM_CCOEFF_NORMED归一化系数匹配法
- @return `{Match}` 集合 或者null

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  let d = image.initOpenCV();
  logd(d)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let aimage = image.captureFullScreen();
  if (aimage != null) {
    let temp = readResAutoImage("tmp.png");
    let rectp = new Rect();
    rectp.left = 0;
    rectp.top = 0;
    rectp.right = device.getScreenWidth();
    rectp.bottom = device.getScreenHeight();
    let matchs = image.matchTemplate2(aimage, temp, 0.7, 0.9, rectp, -1, 10, 5);
    //这玩意是个数组
    logd(JSON.stringify(matchs));
    //这玩意是个数组
    if (matchs && matchs.length > 0) {
      for (let i = 0; i < matchs.length; i++) {
        logd(JSON.stringify(matchs[i]));
        clickPoint(matchs[i].point.x, matchs[i].point.y)
      }
    }
    //图片要回收
    image.recycle(aimage)
    //图片要回收
    image.recycle(temp)
  }
}

main();
```

### image.matchTemplate2J 图片模板匹配(JSON) ​

- OpenCV模板匹配封装
- @param image1 大图片
- @param jsonFileName 使用图色工具生成JSON文件,存储到res文件夹中,例如 a.json, 小图路径请到json文件配置
- @return `{null|Match[]}` 匹配到的集合

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  let d = image.initOpenCV();
  logd(d)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let aimage = image.captureFullScreen();
  if (aimage != null) {
    let matchs = image.matchTemplate2J(aimage, "a.json");
    //这玩意是个数组
    logd(JSON.stringify(matchs));
    //这玩意是个数组
    if (matchs && matchs.length > 0) {
      for (let i = 0; i < matchs.length; i++) {
        logd(JSON.stringify(matchs[i]));
        clickPoint(matchs[i].point.x, matchs[i].point.y)
      }
    }
    //图片要回收
    image.recycle(aimage)
  }
}

main();
```

### image.matchTemplateEx 图片模板匹配 ​

- OpenCV模板匹配封装，在当前屏幕截图中进行匹配
- @param template 小图片（模板）
- @param weakThreshold 弱阈值。该值用于在每一轮模板匹配中检验是否继续匹配。如果相似度小于该值，则不再继续匹配。取值范围为0~ 1的浮点数。默认值为0.9。
- @param threshold 强阈值。该值用于检验最终匹配结果，以及在每一轮匹配中如果相似度大于该值则直接返回匹配结果。。取值范围为0~ 1的浮点数。默认值为0.9。
- @param rect 找图区域。参见findColor函数关于 rect 的说明。
- @param maxLevel 默认为-1，一般而言不必修改此参数。不加此参数时该参数会根据图片大小自动调整。找图算法是采用图像金字塔进行的, level参数表示金字塔的层次, level越大可能带来越高的找图效率，但也可能造成找图失败（图片因过度缩小而无法分辨）或返回错误位置。因此，除非您清楚该参数的意义并需要进行性能调优，否则不需要用到该参数。
- @param limit 限制结果的数量，如果要找到1个，就填写1，如果是多个请填写多个
- @param method 0: TM_SQDIFF平方差匹配法,1: TM_SQDIFF_NORMED归一化平方差匹配方法,2: TM_CCORR相关匹配法,3: TM_CCORR_NORMED归一化相关匹配法,4: TM_CCOEFF系数匹配法,5: TM_CCOEFF_NORMED归一化系数匹配法
- @return `{Match}` 集合 或者null

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  let d = image.initOpenCV();
  logd(d)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let temp = readResAutoImage("tmp.png");
  let rectp = new Rect();
  rectp.left = 0;
  rectp.top = 0;
  rectp.right = device.getScreenWidth();
  rectp.bottom = device.getScreenHeight();
  let matchs = image.matchTemplateEx(temp, 0.7, 0.9, rectp, -1, 1, 5);
  logd(JSON.stringify(matchs));
  //这玩意是个数组
  if (matchs && matchs.length > 0) {
    for (let i = 0; i < matchs.length; i++) {
      logd(JSON.stringify(matchs[i]));
      clickPoint(matchs[i].point.x, matchs[i].point.y)
    }
  }
  //图片要回收
  image.recycle(aimage)
  //图片要回收
  image.recycle(temp)
}

main();
```

## 灰度 ​

### image.gray 灰度Image ​

- 灰度图像，使用了opencv的处理
- 适合版本 EC 11.16.0+
- @param img AutoImage图片对象
- @return `{null|AutoImage}` 对象或者null

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  let d = image.initOpenCV();
  logd(d)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  for (let i = 0; i < 1; i++) {
    sleep(1000);
    let d = image.captureFullScreenEx();
    if (d) {
      let s = new Date().getTime();
      let bd = image.gray(d);
      logd("time " + (new Date().getTime() - s))
      logd(bd.uuid);
      if (bd) {
        let saved = image.saveTo(bd, "/sdcard/testb2.png");
        logd("saved " + saved)
        exit()
      }
      image.recycle(bd)
      //图片要回收
      image.recycle(d)
    }
  }

}

main();
```

### image.grayBitmap 灰度Bitmap ​

- 对安卓的 Bitmap 图片灰度
- 适合版本 EC 11.16.0+
- @param bitmap Bitmap 图片对象
- @return `{null|Bitmap}` 对象或者null

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  let d = image.initOpenCV();
  logd(d)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  for (let i = 0; i < 1; i++) {
    sleep(1000);
    let s = new Date().getTime();
    let d = image.captureScreenBitmap("jpg", 100, 100, 200, 300, 100);
    if (d) {
      let s = new Date().getTime();
      let bd = image.grayBitmap(d);
      logd("time " + (new Date().getTime() - s))
      logd(bd);
      if (bd) {
        exit()
      }
      //图片要回收
      image.recycle(d)
    }
  }

}

main();
```

## 二值化 ​

### image.binaryzation 二值化Image ​

- 对AutoImage图片进行二值化
- @param img AutoImage图片对象
- @param type 二值化类型，一般写1即可
- 0 灰度值大于阈值为最大值，其他值为0
- 1 灰度值大于阈值为0，其他值为最大值
- 2 灰度值大于阈值的为阈值，其他值不变
- 3 灰度值大于阈值的不变，其他值为0
- 4 灰度值大于阈值的为零，其他值不变
- 7 暂不支持
- 8 大津法自动寻求全局阈值
- 16 三角形法自动寻求全局阈值
- @param threshold 二值化系数，0 ~ 255
- @return `{AutoImage}` 对象或者null

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  let d = image.initOpenCV();
  logd(d)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  for (let i = 0; i < 1000; i++) {
    sleep(1000);
    let d = image.captureFullScreenEx();
    if (d) {
      let s = new Date().getTime();
      let bd = image.binaryzation(d, 1, 200);
      logd("time " + (new Date().getTime() - s))
      logd(bd.uuid);
      if (bd) {
        let saved = image.saveTo(bd, "/sdcard/testb2.png");
        logd("saved " + saved)
        exit()
      }
      //图片要回收
      image.recycle(d)
    }
  }

}

main();
```

### image.binaryzationBitmap 二值化Bitmap ​

- 对安卓的 Bitmap 图片进行二值化
- @param bitmap Bitmap 图片对象
- @param type 二值化类型，一般写1即可
- 0 灰度值大于阈值为最大值，其他值为0
- 1 灰度值大于阈值为0，其他值为最大值
- 2 灰度值大于阈值的为阈值，其他值不变
- 3 灰度值大于阈值的不变，其他值为0
- 4 灰度值大于阈值的为零，其他值不变
- 7 暂不支持
- 8 大津法自动寻求全局阈值
- 16 三角形法自动寻求全局阈值
- @param threshold 二值化系数，0 ~ 255
- @return `{Bitmap}` 对象或者null

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
    return;
  }
  let d = image.initOpenCV();
  logd(d)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  for (let i = 0; i < 1000; i++) {
    sleep(1000);
    let s = new Date().getTime();
    let d = image.captureScreenBitmap("jpg", 100, 100, 200, 300, 100);
    if (d) {
      let s = new Date().getTime();
      let bd = image.binaryzationBitmap(d, 1, 200);
      logd("time " + (new Date().getTime() - s))
      logd(bd);
      if (bd) {
        exit()
      }
      //图片要回收
      image.recycle(d)
    }
  }

}

main();
```

### image.binaryzationBitmapEx 二值化 Bitmap ​

- 自适应二值化，使用了opencv的adaptiveThreshold函数实现
- 适合版本 EC 8.3.0+
- @param bitmap Bitmap 图片对象
- @param map MAP 参数 diameter : 去噪直径 参考opencv的bilateralFilter函数 adaptiveMethod：自适应二值化方式分别是0和1 ，ADAPTIVE_THRESH_MEAN_C=0，ADAPTIVE_THRESH_GAUSSIAN_C = 1 blockSize：计算单位是像素的邻域块，邻域块取多大，就由这个值作决定，3，5，7这样的奇数 c: 偏移值调整量， `{"diameter":20,"adaptiveMethod":1,"c":9,"blockSize":51}`
- @return `{Bitmap}` 对象或者null

```
function main() {
 let req = startEnv();
 if (!req) {
   logd("申请权限失败");
   return;
 }
 //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
 sleep(1000)
 for (let i = 0; i < 1000; i++) {
   sleep(1000);
   let d = image.captureScreenBitmapEx();
   if (d) {
     let s = new Date().getTime();
     let bd = image.binaryzationBitmapEx(d,
       {
         "diameter": 20,
         "adaptiveMethod": 1,
         "c": 9, "blockSize": 51
       });
     logd("time " + (new Date().getTime() - s))
     logd(bd);
     if (bd) {
       exit()
     }
     //图片要回收
     image.recycle(d)
   }
 }
}

main();
```

### image.binaryzationEx 二值化 ​

- 自适应二值化，使用了opencv的adaptiveThreshold函数实现
- 适合版本 EC 8.3.0+
- @param img AutoImage图片对象
- @param map MAP 参数 diameter : 去噪直径 参考opencv的bilateralFilter函数 adaptiveMethod：自适应二值化方式分别是0和1 ，ADAPTIVE_THRESH_MEAN_C=0，ADAPTIVE_THRESH_GAUSSIAN_C = 1 blockSize：计算单位是像素的邻域块，邻域块取多大，就由这个值作决定，3，5，7这样的奇数 c: 偏移值调整量， `{"diameter":20,"adaptiveMethod":1,"c":9,"blockSize":51}`
- @return `{null|AutoImage}`

```
function main() {
  let req = startEnv();
  if (!req) {
    logd("申请权限失败");
    return;
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  for (let i = 0; i < 1000; i++) {
    sleep(1000);
    let d = image.captureFullScreenEx();
    if (d) {
      let s = new Date().getTime();
      let bd = image.binaryzationEx(d, {
        "diameter": 20,
        "adaptiveMethod": 1,
        "c": 9,
        "blockSize": 51
      });
      logd("time " + (new Date().getTime() - s))
      logd(bd.uuid);
      if (bd) {
        let saved = image.saveTo(bd, "/sdcard/testb2.png");
        logd("saved " + saved)
        exit()
      }
      //图片要回收
      image.recycle(d)
    }
  }

}

main();
```

## 其他 ​

### image.getWidth 获取宽度 ​

- 取得宽度
- @param img 图片对象
- @return int

```
function main() {
  let img = image.captureFullScreen()
  logd(" img width " + image.getWidth(img))
  image.recycle(img)
}

main();
```

### image.getHeight 取得高度 ​

- 取得高度
- @param img 图片对象
- @return int

```
function main() {
  let img = image.captureFullScreen()
  logd(" img getHeight " + image.getHeight(img))
  image.recycle(img)
}

main();
```

### image.rotateImage 旋转图片 ​

- 旋转图片
- 支持EC 10.11.0+
- @param img 图片对象
- @param degree 度数，-90代表逆时针旋转90度，home键在右，90度代表顺时针旋转90度，home键在左
- @return AutoImage 对象或者null

```
function main() {
  let img = image.captureFullScreen()
  logd(" img width " + image.getWidth(img))
  let img2 = image.rotateImage(img, -90);
  image.recycle(img)
  logd(" img2 width " + image.getWidth(img2))
  image.recycle(img2)
}

main();
```

### image.rotateBitmap 旋转Bitmap ​

- 旋转Bitmap
- 支持EC 10.11.0+
- @param bitmap 安卓的bitmap对象
- @param degree 度数，-90代表逆时针旋转90度，home键在右，90度代表顺时针旋转90度，home键在左
- @return Bitmap 对象或者null

```
function main() {
  let img = readResBitmap("a.jpg");
  logd(" img width " + image.getWidth(img))
  let img2 = image.rotateBitmap(img, -90);
  image.recycle(img)
  logd(" img2 width " + image.getWidth(img2))
  image.recycle(img2)
}

main();
```

### image.readImage 读取文件为Image ​

- 读取在路径path的图片文件并返回一个`{@link AutoImage}`对象。如果文件不存在或者文件无法解码则返回null。
- @param path 图片路径
- @return `{AutoImage}` 对象或者null

```
function main() {
  let autoimg = image.readImage("/sdcard/a.png");
  //图片要回收
  image.recycle(autoimg)
}

main();
```

### image.readBitmap 读取文件为Bitmap ​

- 读取在路径path的图片文件并返回一个`{@link AutoImage}`对象。如果文件不存在或者文件无法解码则返回null。
- @param path 图片路径
- @return android的bitmap对象或者null

```
function main() {
  let autoimg = image.readBitmap("/sdcard/a.png");
  //图片要回收
  image.recycle(autoimg)
}

main();
```

### image.pixelInImage 图像坐标点颜色 ​

- 返回图片image在点(x, y)处的像素的ARGB值。
- 该值的格式为0xAARRGGBB，是一个"32位整数"
- 坐标系以图片左上角为原点。以图片左侧边为y轴，上侧边为x轴。
- @param image 图片
- @param x 要获取的像素的横坐标。
- @param y 要获取的像素的纵坐标。
- @return 整型

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let imageX = image.captureFullScreen();
  let color = image.pixelInImage(imageX, 100, 100);
  //图片要回收
  image.recycle(imageX)
}

main();
```

### image.argb 颜色转16进制字符串 ​

- 将整型的颜色值转成16进制RGB字符串
- @param color 整型值
- @return `{string}` 颜色字符串

```
function main() {
  let req = image.requestScreenCapture(10000, 0);
  if (!req) {
    req = image.requestScreenCapture(10000, 0);
  }
  if (!req) {
    toast("申请权限失败");
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let aimage = image.captureFullScreen();
  if (aimage != null) {
    let points3 = "765|22|0x1296DB";
    logd("==" + image.argb(image.pixel(aimage, 765, 22)));
    let points = image.cmpColor(aimage, points3, 0.5, 0, 0, 0, 0);
    logd("points " + points);
    //图片要回收
    image.recycle(aimage)
  }
}

main();
```

### image.argb RGB字符串 ​

- 将整型的颜色值转成16进制RGB字符串
- @param color 整型值
- @return `{string}` 颜色字符串

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let imageX = image.captureFullScreen();
  let color = image.pixel(imageX, 100, 100);
  logd(image.argb(color))
  //图片要回收
  image.recycle(imageX)
}

main();
```

### image.getPixelBitmap 取得Bitmap单点颜色 ​

- 取得Bitmap图片的某个点的颜色值
- @param bitmap 图片对象
- @param x x坐标点
- @param y y坐标点
- @return int 颜色值

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  ///申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let bitmap = image.captureScreenBitmap("jpg", 800, 800, 100, 100, 100);
  let color = image.getPixelBitmap(bitmap, 100, 100);
  //图片要回收
  image.recycle(bitmap)
}

main();
```

### image.getPixelsBitmap 取得Bitmap区域颜色 ​

- 取得Bitmap图片的某个区域点的颜色值，等同于 Bitmap.getPixels
- @param bitmap 图片对象
- @param arraySize 要返回的区域数组的大小
- @param offset 写入到pixels[]中的第一个像素索引值
- @param stride pixels[]中的行间距个数值(必须大于等于位图宽度)。可以为负数
- @param x 从位图中读取的第一个像素的x坐标值。
- @param y 从位图中读取的第一个像素的y坐标值
- @param width 从每一行中读取的像素宽度
- @param height 读取的行数
- @return int 颜色值数组

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let bitmap = image.captureScreenBitmap("jpg", 800, 800, 100, 100, 100);
  let w = bitmap.getWidth();
  let h = bitmap.getHeight();
  let mPixels = image.getPixelsBitmap(bitmap, w * h, 0, w, 0, 0, w, h);
  //图片要回收
  image.recycle(bitmap)
}

main();
```

### image.readImageNotAgent 读取文件为Image ​

- 读取在路径path的图片文件并返回一个`{@link AutoImage}`对象。
- 如果文件不存在或者文件无法解码则返回null。
- **注意: 这个函数是将图片读取到app进程中，如果你使用的是代理模式并且已经打开了代理服务，请使用readImage函数**
- 适合版本: EC 9.41.0+
- @param path 图片路径
- @return `{AutoImage}` AutoImage对象或者null

```
function main() {
  let autoimg = image.readImageNotAgent("/sdcard/a.png");
  //图片要回收
  image.recycle(autoimg)
}

main();
```

### image.bitmapToImageNotAgent (Bitmap转AutoImage) ​

- 将安卓原生的Bitmap对象转换为AutoImage
- 适合版本: EC 9.41.0+
- **注意: 这个函数是将图片读取到app进程中，如果你使用的是代理模式并且已经打开了代理服务，请使用 bitmapToImage 函数**
- @param bitmap `{Bitmap}`对象
- @return `{AutoImage}` 对象

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }

  logd("申请截图结果... " + request)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  for (let i = 0; i < 100; i++) {
    let d = image.captureFullScreenEx("jpg", 0, 0, 0, 0, 100);
    logd(d)
    sleep(1000);
    if (d) {
      let ds = image.imageToBitmap(d);
      logd(ds)
      //再次转换为autoimage对象
      let sy = image.bitmapToImageNotAgent(ds);
      logd(sy)
      ds.recycle();
      image.recyle(d);
    }

  }

}

main();
```

### image.readResAutoImageNotAgent 读取Image资源 ​

- 将res文件夹的文件转换为AutoImage
- 适合版本: EC 9.41.0+
- **注意: 这个函数是将图片读取到app进程中，如果你使用的是代理模式并且已经打开了代理服务，请使用 readResAutoImage 函数**
- @param res `{string}` res文件夹下的文件路径
- @return `{AutoImage}` 对象 注意

- 不要用`运行选中`功能执行,此功能不会带着附件文件执行,必须运行整个项目 :::

```
function main() {
  var b = image.readResAutoImageNotAgent("img/a.png");
  logd("b " + b)
}

main();
```

## 图片转换 ​

### image.saveTo 保存到文件 ​

- 保存到文件中
- @param img 图片对象
- @param path 路径
- @return `{bool}` true代表成功，false 代表失败

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let imageX = image.captureFullScreen();
  let r = image.saveTo(imageX, "/sdcard/a.png");
  toast("result " + r);
  //图片要回收
  image.recycle(imageX)
}

main();
```

### image.saveBitmap 保存bitmap图像 ​

- 保存bitmap图像
- 适用版本(EC 5.15.0+)
- @param bitmap 图片
- @param format 要保存图像格式，有 png，jpg，webp
- @param q 要保存图像质量，1-100,png格式无效
- @param path 要保存图像路径
- @return `{bool}` true 成功 false 失败

```
function main() {

  //生成一个二维码bitmap 带logo的
  let bot = utils.createQRCode("我是大佬的弟弟", 1000, 1000, image.readBitmap("/sdcard/yyb2.png"));
  logd("bot " + bot);
  //保存的到文件
  let saved = image.saveBitmap(bot, "png", 100, "/sdcard/tmp.png");
  logd("saved " + saved);
  //回收掉防止内存暴涨
  if (bot) {
    bot.recycle()
  }
  //扫描二维码
  let bitmap = image.readBitmap("/sdcard/tmp.png")
  let data = utils.decodeQRCode(bitmap);
  logd("data " + data);
  //回收掉防止内存暴涨
  if (bitmap) {
    bitmap.recycle()
  }
}

main();
```

### image.toBase64Format Image转base64 ​

- 转成base64的字符串, jpg格式较小，可以减少内存
- @param img 图片对象
- @param format 格式 jpg或者 png
- @param q 质量 1-100，质量越大 越清晰,png格式无效
- @return 字符串

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let imageX = image.captureFullScreen();
  let r = image.toBase64Format(imageX, "jpg", 50);
  toast("result " + r);
  //图片要回收
  image.recycle(imageX)
}

main();
```

### image.clip 剪切图片 ​

- 剪切图片
- @param img 图片对象
- @param x x起始坐标
- @param y y起始坐标
- @param ex 终点X坐标
- @param ey 终点Y坐标
- @return `AutoImage 对象或者null`

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let imageX = image.captureFullScreen();
  let r = image.clip(imageX, 100, 100, 300, 400);
  toast("result " + r);
  //图片要回收
  image.recycle(imageX)
  image.recycle(r)
}

main();
```

### image.scaleImage 缩放图片 ​

- 缩放图片
- 适合EC 10.0.0+
- @param img 图片对象
- @param w 目标宽度
- @param h 目标高度
- @return `AutoImage 对象或者null`

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let imageX = image.captureFullScreen();
  let r = image.scaleImage(imageX, 300, 400);
  toast("result " + r);
  //图片要回收
  image.recycle(imageX)
  image.recycle(r)
}

main();
```

### image.pixel 图片某点颜色值 ​

- 取得图片的某个点的颜色值
- @param img 图片对象
- @param x x坐标点
- @param y y坐标点
- @return int 颜色值

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  let imageX = image.captureFullScreen();
  let r = image.pixel(imageX, 100, 100);
  toast("result " + r);
  //图片要回收
  image.recycle(imageX)
}

main();
```

### image.isRecycled 图片回收判断 ​

- 是否被回收了
- @param img 图片对象
- @return bool true代表已经被回收了

```
function main() {
  let imageX = image.captureFullScreen();
  let r = image.isRecycled(imageX);
  toast("result " + r);
  //图片要回收
  image.recycle(imageX)
}

main();
```

### image.recycle 回收图片 ​

- 回收图片
- @param img 图片对象

```
function main() {
  let imageX = image.captureFullScreen();
  //图片要回收
  image.recycle(imageX)

}

main();
```

### image.recycleAllImage 回收所有图片 ​

- 回收所有图片
- 适合 EC 10.20.0+
- @return `boolean` true代表成功

```
function main() {
  let imageX = image.captureFullScreen();
  //图片要回收
  image.recycleAllImage()

}

main();
```

### image.clipBitmap (剪裁bitmap) ​

- 剪裁图片，请自行判断参数，正确性
- @param bitmap 图片
- @param x 开始X坐标
- @param y 开始Y坐标
- @param w 剪裁宽度
- @param h 剪裁高度
- @return `{Bitmap}` 安卓的Bitmap对象

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  for (let i = 0; i < 100; i++) {
    let d = image.captureScreenBitmap("jpg", 0, 0, 0, 0, 100);
    logd(d)
    sleep(1000);
    if (d) {
      d = image.clipBitmap(d, 100, 100, 200, 200);
      let ds = image.bitmapBase64(d, "jpg", 100);
      logd(ds)
      loge(image.base64Bitmap(ds, 0))
      //图片要回收
      image.recycle(d)
    }
  }

}

main();
```

### image.scaleBitmap (缩放bitmap) ​

- 缩放bitmap
- 适合EC 10.0.0+
- @param bitmap 图片
- @param w 目标宽度
- @param h 目标高度
- @return `{Bitmap}` 安卓的Bitmap对象

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  for (let i = 0; i < 100; i++) {
    let d = image.captureScreenBitmap("jpg", 0, 0, 0, 0, 100);
    logd(d)
    sleep(1000);
    if (d) {
      d = image.scaleBitmap(d, 200, 200);
      let ds = image.bitmapBase64(d, "jpg", 100);
      logd(ds)
      loge(image.base64Bitmap(ds, 0))
      //图片要回收
      image.recycle(d)
    }
  }

}

main();
```

### image.base64Bitmap (base64转bitmap) ​

- base64字符串转为Bitmap图片
- @param data base64 数据
- @param flag base64格式的标示，一般为0，
- 可选参数为 ：0 默认， 1 无填充模式，2 无换行模式，4 换行模式
- @return `{Bitmap}` 安卓的Bitmap对象

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  for (let i = 0; i < 100; i++) {
    let d = image.captureScreenBitmap("jpg", 0, 0, 0, 0, 100);
    logd(d)
    sleep(1000);
    if (d) {
      d = image.clipBitmap(d, 100, 100, 200, 200);
      let ds = image.bitmapBase64(d, "jpg", 100);
      logd(ds)
      loge(image.base64Bitmap(ds, 0))
      //图片要回收
      image.recycle(d)
    }
  }

}

main();
```

### image.bitmapBase64 (bitmap转base64) ​

- bitmap转为base64
- @param bitmap 图片
- @param format 格式，jpg或者png
- @param q 质量 1 - 100,png格式无效
- @return `{string}` base64字符串

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  for (let i = 0; i < 100; i++) {
    let d = image.captureScreenBitmap("jpg", 0, 0, 0, 0, 100);
    logd(d)
    sleep(1000);
    if (d) {
      d = image.clipBitmap(d, 100, 100, 200, 200);
      let ds = image.bitmapBase64(d, "jpg", 100);
      logd(ds)
      loge(image.base64Bitmap(ds, 0))
      //图片要回收
      image.recycle(d)
    }
  }
}

main();
```

### image.imageToBitmap (AutoImage转Bitmap) ​

- 将AutoImage转换为安卓原生的Bitmap对象
- @param img `{AutoImage}`
- @return `{Bitmap}` 对象

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }
  logd("申请截图结果... " + request)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  for (let i = 0; i < 100; i++) {
    let d = image.captureFullScreenEx("jpg", 0, 0, 0, 0, 100);
    logd(d)
    sleep(1000);
    if (d) {
      let ds = image.imageToBitmap(d);
      logd(ds)
      ds.recycle();
      image.recycle(d);
    }
  }

}

main();
```

### image.bitmapToImage (Bitmap转AutoImage) ​

- 将安卓原生的Bitmap对象转换为AutoImage
- 适合EC 6.15.0+版本
- @param img `{Bitmap}`对象
- @return `{AutoImage}` 对象

```
function main() {
  let request = image.requestScreenCapture(10000, 0);
  if (!request) {
    request = image.requestScreenCapture(10000, 0);
  }

  logd("申请截图结果... " + request)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  for (let i = 0; i < 100; i++) {
    let d = image.captureFullScreen();
    logd(d)
    sleep(1000);
    if (d) {
      let ds = image.imageToBitmap(d);
      logd(ds)
      //再次转换为autoimage对象
      let sy = image.bitmapToImage(ds);
      logd(sy)
      ds.recycle();
      image.recyle(d);
    }
  }
}

main();
```

### image.imageToMatFormat ( Bitmap 转Mat AutoImage) ​

- 转换Mat存储格式
- 适合 EC 10.18.0+
- @param img `{AutoImage}` 图片对象
- @return `MAT存储格式的AutoImage` 对象或者null

```
function main() {
  let req = startEnv();
  if (!req) {
    logd("申请权限失败");
    return;
  }
  logd("申请截图结果... " + request)
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
  image.useOpencvMat(0)
  for (let i = 0; i < 100; i++) {
    let d = image.captureFullScreen();
    logd(d)
    sleep(1000);
    if (d) {
      let ds = image.imageToMatFormat(d);
      logd(ds)
      image.recyle(d);
    }

  }
}

main();
```

### image.matToImageFormat (Mat AutoImage 转 Bitmap AutoImage) ​

- 转换普通image存储格式
- 适合 EC 10.18.0+
- @param img `{AutoImage}` 图片对象
- @return `普通存储格式的AutoImage`对象或者null

```
function main() {
  let req = startEnv();
  if (!req) {
    logd("申请权限失败");
    return;
  }
  logd("申请截图结果... " + request)
  sleep(1000)
  image.useOpencvMat(1)
  for (let i = 0; i < 100; i++) {
    let d = image.captureFullScreen();
    logd(d)
    sleep(1000);
    if (d) {
      let ds = image.matToImageFormat(d);
      logd(ds)
      image.recyle(d);
    }

  }
}

main();
```
