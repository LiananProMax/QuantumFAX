本页总览

## 说明 ​

- [YOLO使用说明](https://ieasyclick.com/docs/zh-cn/advance/yolov8)

## yolov8Api.newYolov8 初始化yolov8 ncnn 实例,支持多实例 ​

- 初始化yolov8实例
- 适配EC 10.15.0+
- @return `Yolov8Util` 实例对象

```
function main() {
    // 初始化YOLO实例
    let yolov8s = yolov8Api.newYolov8();
    // 初始化配置选项
    let config = yolov8s.getDefaultConfig("yolov8s-640", 640, 0.25, 0.35, "ALL", 0, [
        "aixin",
        "pinglun"
    ])
    logd("config : " + JSON.stringify(config))
    // 初始化 训练过的模型
    let paramPath = "/sdcard/model.ncnn.param";
    let binPath = "/sdcard/model.ncnn.bin";
    let inted = yolov8s.initYoloModel(config, paramPath, binPath);
    if (inted) {
        logd("初始化yolov8s成功");
    } else {
        logd("初始化yolov8s失败: " + yolov8s.getErrorMsg());
        return;
    }
    // 截图bitmap格式
    let bitmap = image.captureScreenBitmapEx()
    // 读取本地图片
    // let bitmap = image.readBitmap("/sdcard/a.png");
    let result = yolov8s.detectBitmap(bitmap, []);
    // 这个带参数的代表只过滤pinglun的分类数据
    //let result = yolov8s.detectBitmap(bitmap, ["pinglun"]);
    if (result == null || result == "") {
        logd("yolov8s 无结果: " + yolov8s.getErrorMsg());
    } else {
        logd("yolov8s 结果: " + result);
    }
    if (bitmap != null) {
        // 回收图片
        bitmap.recycle();
    }
    // 在需要的时候释放，不要用一次释放一次
    yolov8s.release();
}

main();
```

## yolov8Api.newYolov8Onxx 初始化yolov8 onnx 实例,支持多实例 ​

- 初始化yolov8 onnx 实例
- 适配EC 11.6.0+
- @return `Yolov8Util` 实例对象

```
function main() {
    // 初始化YOLO实例
    let yolov8s = yolov8Api.newYolov8Onxx();
    // 初始化配置选项
    let config = yolov8s.getOnnxConfig([
      "aixin",
      "pinglun"
    ], 640,640, 0.35, 0.55, 2 )
    // 设置占用CPU线程数量，越小 占用CPU越少，不设置默认是4，建议设置为1或者2
    config["num_thread"] = 1;
    logd("config : " + JSON.stringify(config))
    // 初始化 训练过的模型
    let paramPath = "/sdcard/best.onnx";
    let inted = yolov8s.initYoloModel(config, paramPath, "");
    if (inted) {
        logd("初始化yolov8s成功");
    } else {
        logd("初始化yolov8s失败: " + yolov8s.getErrorMsg());
        return;
    }
    // 截图 img 格式
    let img = image.captureFullScreen()
    // 读取本地图片
    // let bitmap = image.readBitmap("/sdcard/a.png");
    let result = yolov8s.detectImage(img, []);
    // 这个带参数的代表只过滤pinglun的分类数据
    //let result = yolov8s.detectBitmap(bitmap, ["pinglun"]);
    if (result == null || result == "") {
        logd("yolov8s 无结果: " + yolov8s.getErrorMsg());
    } else {
        logd("yolov8s 结果: " + result);
    }
    if (img != null) {
        // 回收图片
        img.recycle();
    }
    // 在需要的时候释放，不要用一次释放一次
    yolov8s.release();
}

main();
```

## Yolov8Util.getDefaultConfig 获取 yolov8 默认配置 ​

- 获取 yolov8 默认配置
- 适配EC 10.15.0+
- @param model_name 模型名称 默认写 yolov8s-640 即可
- @param input_size yolov8训练时候的imgsz参数，默认写640即可
- @param input_size 检测框系数，默认写0.25即可
- @param iou_thr 输出系数，，默认写0.35 即可
- @param bind_cpu 是否绑定CPU，选项为ALL,BIG,LITTLE 三个,默认写ALL
- @param use_vulkan_compute 是否启用硬件加速，1是，0否，默认写0 即可
- @param obj_names JSON数组，训练的时候分类名称例如 ["star","common","face"]
- @return JSON数据

```
   代码例子请看 `初始化yolov8实例`
```

## Yolov8Util.getOnnxConfig ONNX的配置选项 ​

- ONNX的配置选项
- @param obj_names obj_names JSON数组，可以不写的情况下，onnx从模型中获取，训练的时候分类名称例如 ["star","common","face"]
- @param input_width 训练的图片尺寸宽度，写0 就是onnx自己提取
- @param input_height 训练的图片尺寸高度，写0 就是onnx自己提取
- @param confThreshold 指在ONNX模型推理过程中用于确定检测目标的最小置信度阈值
- @param iouThreshold 阈值在ONNX模型中用于确定检测框的重叠程度，通常用于非极大值抑制（NMS）过程中
- @param numThread 线程数量 一般为cpu个数的一般，如果不知道 不写即可 为了避免CPU占用大，这个可以写1或者2即可
- @return `{JSON}`

```
   代码例子请看 `初始化yolov8实例`
```

## Yolov8Util.initYoloModel 初始化yolov8模型 ​

- 初始化yolov8模型
- 具体如何生成param和bin文件，请参考文件的yolo使用章节，通过yolo的pt转成ncnn的param、bin文件,
- 对于onnx模型，binPath参数写null即可，paramPath是onnx文件路径
- 适配EC 10.15.0+
- @param map 参数表 ncnn参考 getDefaultConfig函数获取默认的参数，onnx参考getOnnxConfig函数
- @param paramPath param文件路径
- @param binPath bin文件路径
- @return boolean true代表成功 false代表失败

```
   代码例子请看 `初始化yolov8实例`
```

## Yolov8Util.detectBitmap 检测图片 ​

- 检测图片
- 适配EC 10.15.0+
- 返回数据例如
- `[{"name":"heart","confidence":0.92,"left":957,"top":986,"right":1050,"bottom":1078}]`
- name: 代表是分类，confidence:代表可信度，left,top,right,bottom代表结果坐标选框
- @param bitmap 安卓的bitmap对象
- @param obj_names JSON数组，不写代表不过滤，写了代表只取填写的分类
- @return string 字符串数据

```
   代码例子请看 `初始化yolov8实例`
```

## Yolov8Util.detectImage 检测图片 ​

- 检测Image
- 适配EC 10.16.0+
- 返回数据例如
- `[{"name":"heart","confidence":0.92,"left":957,"top":986,"right":1050,"bottom":1078}]`
- name: 代表是分类，confidence:代表可信度，left,top,right,bottom代表结果坐标选框
- @param img AutoImage对象
- @param obj_names JSON数组，不写代表不过滤，写了代表只取填写的分类
- @return `{string|null}` 字符串数据

```
   代码例子请看 `初始化yolov8实例`
```

## Yolov8Util.release 插入数据 ​

- 释放yolov8资源
- 适配EC 10.15.0+
- @return boolean

```
   代码例子请看 `初始化yolov8实例`
   释放函数在脚本结束的的时候释放，无需要每次使用都释放
```

## Yolov8Util.getErrorMsg 获取YOLOV8错误消息 ​

- 获取YOLOV8错误消息
- 适配EC 10.15.0+
- @return string 字符串

```
   代码例子请看 `初始化yolov8实例`
```
