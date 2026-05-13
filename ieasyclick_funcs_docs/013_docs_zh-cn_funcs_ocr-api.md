本页总览

## 说明 ​

- OCR模块是属于对图像进行识别
- OCR模块的对象前缀是ocr，例如 ocr.initOcr()这样调用
- 目前的OCR包含了mlkit,ocrLite,百度AI的easyedge,paddlOcrNcnnV5,paddleOcrOnnxV4，paddleOcrOnnxV5,Tesseract,paddleOcrOnline和百度在线识别
- 支持PPOCR-V4和PPOCR-V5模型
- Tesseract 请下载对应的语言包或者自己创建语言包
- 版本高于9.17.0的，请看 【Tesseract 例子 [高于9.17版本]】例子，因为api已经更改了

## ocr.newOcr 实例一个ocr ​

- 初始化一个ocr实例
- 适配版本 EC安卓 9.17.0+

```
function main() {
    let o = ocr.newOcr();
    // 这里做初始化和识别


    o.releaseAll()
}
```

## ocr.initOcr 初始化 ​

- 初始化OCR模块
- @param map map参数表
- key分别为：
- type : OCR类型，值分别为 OCR , paddleOcrNcnnV5 = ncnn版本的PPOCR-V5模型, paddleLiteOcr=paddleLite， paddleOcrOnnxV4=onnx实现的PPOCR-V4模型，paddleOcrOnnxV5=onnx实现的PPOCR-V5模型， tess = Tesseract模块，baiduOnline=百度在在线识别模块，paddleocr=百度离线的paddleocr，easyedge=百度AI OCR
- ocrLite = ocrLite, paddleOcrOnline = EC自带的PC端的paddleOcr服务程序
- 如果类型是 `tess`,请将训练的模型放到 /sdcard/tessdata/ 文件夹下 参数设置为 : `{"type":"tess","language":"chi_sim","debug":false,"ocrEngineMode":3}` language: 语言数据集文件， 例如 chi_sim.traineddata 代表是中文简体语言，参数就填写 chi_sim,多个可以用+链接，例如 :chi_sim +eng+num ocrEngineMode: 识别引擎类型，0 OEM_TESSERACT_ONLY ， 1 OEM_LSTM_ONLY,2 OEM_TESSERACT_LSTM_COMBINED,3 OEM_DEFAULT rilLevel: PageIteratorLevel 参数，-1 自适应， 0: RIL_BLOCK, 1: RIL_PARA, 2: RIL_TEXTLINE, 3: RIL_WORD, 4 :RIL_SYMBOL debug: 代码是否设置调试模式，一般设置false即可 path： 放tessdata的文件夹路径，不要加上tessdata，是tessdata文件夹的父级
- 如果类型是 `baiduOnline`, 参数设置为 : `{"type":"baiduOnline","ak":"xxx","sk":"xx"}` ak = api key,sk = secret key, 百度OCR文档地址 : [https://ai.baidu.com/ai-doc/OCR/Ck3h7y2ia](https://ai.baidu.com/ai-doc/OCR/Ck3h7y2ia)
- 如果参数是 `paddleOcrNcnnV5` 参数设置为 `{"type":"paddleOcrNcnnV5","numThread":2,"padding":32,"maxSideLen":640}` 参数解释： numThread 使用的CPU线程数，默认0，-1代表最大CPU padding: 图像外接白框，用于提升识别率，有48，32等，默认 32，影响识别速度和准确率 modelsDir： 模型路径，如果是外部路径例如 /sdcard/models/代表是sdcard下面的，默认自带有模型 不写这一项即可 keysName: 训练的文字标签文件路径，可以是外部的 例如 ppocr_keys_v1.txt，默认自带有模型 不写这一项即可 detName: 检测模型文件名，检测模型的文件名称，不要带.param和.bin，放到 modelsDir 参数的路径下，默认自带有模型 不写这一项即可 recName: 识别模型文件名，识别模型的文件名称，不要带.param和.bin，放到 modelsDir 参数的路径下，默认自带有模型 不写这一项即可 maxSideLen: 按图像长边进行总体缩放，放大增加识别耗时但精度更高，缩小减小耗时但精度降低，分别有960,640，480，320等，影响识别速度和准确率，默认是640
- 如果参数是`paddleOcrOnnxV4`或者`paddleOcrOnnxV4` 参数设置为 `{"type":"paddleOcrOnnxV4","numThread":2,"padding":50,"maxSideLen":960}` 参数解释： numThread 使用的CPU线程数， modelsDir： 模型路径，如果是外部路径例如 /sdcard/models/代表是sdcard下面的，默认自带有模型 不写这一项即可 keysName: 训练的文字标签文件路径，可以是外部的 例如 /sdcard/labels/ppocr_keys_v1.txt，默认自带有模型 不写这一项即可 detName: 检测模型文件名，onnx结尾的文件名称，放到 modelsDir 参数的路径下，默认自带有模型 不写这一项即可 recName: 识别模型文件名，onnx结尾的文件名称，放到 modelsDir 参数的路径下，默认自带有模型 不写这一项即可 clsName: 分类模型文件名，onnx结尾的文件名称，放到 modelsDir 参数的路径下，默认自带有模型 不写这一项即可 padding 图像外接白框，用于提升识别率，文字框没有正确框住所有文字时，增加此值。默认50。 maxSideLen 按图像长边进行总体缩放，放大增加识别耗时但精度更高，缩小减小耗时但精度降低，maxSideLen为0表示不缩放。 boxScoreThresh 文字框置信度门限，文字框没有正确框住所有文字时，减小此值 boxThresh 同上，自行试验。 unClipRatio 单个文字框大小倍率，越大时单个文字框越大。 doAngleFlag 启用(1)/禁用(0) 文字方向检测，只有图片倒置的情况下(旋转90~270度的图片)，才需要启用文字方向检测，默认关闭。 mostAngleFlag 启用(1)/禁用(0) 角度投票(整张图片以最大可能文字方向来识别)，当禁用文字方向检测时，此项也不起作用，默认关闭。
- 如果类型是 `paddleLiteOcr`,paddlelite版本是v2.14-rc 当前自带的是ppocrv4 优化后的nb模型，有兴趣去github自己搜paddlelite即可， 参数设置为 `{"type":"paddleLiteOcr","cpuThreadNum":2,"cpuPowerMode":"LITE_POWER_FULL"}` 参数解释： cpuThreadNum 使用的CPU线程数， cpuPowerMode：CPU模式，值有 LITE_POWER_FULL,LITE_POWER_HIGH,LITE_POWER_LOW,LITE_POWER_NO_BIND,LITE_POWER_RAND_HIGH,LITE_POWER_RAND_LOW modelPath： 模型路径，如果是外部路径例如 /sdcard/models/代表是sdcard下面的，默认自带有模型 不写这一项即可 labelPath: 训练的文字标签文件路径，可以是外部的 例如 /sdcard/labels/ppocr_keys_v1.txt，默认自带有模型 不写这一项即可 detModelFilename: 检测模型文件名，nb结尾的文件名称，放到 modelPath 参数的路径下，默认自带有模型 不写这一项即可 recModelFilename: 识别模型文件名，nb结尾的文件名称，放到 modelPath 参数的路径下，默认自带有模型 不写这一项即可 clsModelFilename: 分类模型文件名，nb结尾的文件名称，放到 modelPath 参数的路径下，默认自带有模型 不写这一项即可
- 如果类型是 `ocrLite`, 参数设置为 : `{"type":"ocrLite","numThread":4,"padding":10,"maxSideLen":0}` numThread: 线程数量。 padding: 图像预处理，在图片外周添加白边，用于提升识别率，文字框没有正确框住所有文字时，增加此值。 maxSideLen: 按图片最长边的长度，此值为0代表不缩放，例：1024，如果图片长边大于1024则把图像整体缩小到1024再进行图像分割计算，如果图片长边小于1024则不缩放，如果图片长边小于32，则缩放到32。
- 如果类型设置为: `paddleOcrOnline` , 请到网盘中下载**EasyClick-PaddleOcr.zip文件解压运行**

```
{
  "type": "paddleOcrOnline",
  "ocrType": "ONNX_PPOCR_V3",
  "padding": 50,
  "maxSideLen": 0,
  "boxScoreThresh": 0.5,
  "boxThresh": 0.3,
  "unClipRatio": 1.6,
  "doAngleFlag": 0,
  "mostAngleFlag": 0
}
```

```
*  - ocrType : 模型 ONNX_PPOCR_V3,ONNX_PPOCR_V4,NCNN_PPOCR_V3
*  - serverUrl：paddle ocr服务器地址，可以在其他电脑部署，然后中控链接，例如 192.168.2.8，部署在电脑就改ip地址即可，端口是 9022 可以不写
*  - padding 图像外接白框，用于提升识别率，文字框没有正确框住所有文字时，增加此值。默认50。<br/>
*  - maxSideLen 按图像长边进行总体缩放，放大增加识别耗时但精度更高，缩小减小耗时但精度降低，maxSideLen为0表示不缩放。<br/>
*  - boxScoreThresh 文字框置信度门限，文字框没有正确框住所有文字时，减小此值 <br/>
*  - boxThresh 同上，自行试验。<br/>
*  - unClipRatio 单个文字框大小倍率，越大时单个文字框越大。<br/>
*  - doAngleFlag 启用(1)/禁用(0) 文字方向检测，只有图片倒置的情况下(旋转90~270度的图片)，才需要启用文字方向检测，默认关闭。<br/>
*  - mostAngleFlag 启用(1)/禁用(0) 角度投票(整张图片以最大可能文字方向来识别)，当禁用文字方向检测时，此项也不起作用，默认关闭。<br/>
*  - limit 代表每1秒执行ocr请求个数 默认1000。可以适当降低减少cpu占用<br/>
*  - checkImage 检查数据是否是图像(1是 0否)默认关闭。<br/>
```

- @return `{bool}` 布尔型 成功或者失败

### 9.17+版本-单实例-paddleOcrOnline ​

- 注意 9.17+ ocr有单例变成多例模式，跟着下面的方式走，更改初始化initOcr的参数即可，之前的ocrlite、paddleOcrOnline都是支持的

```
let paddleOcrOnline = null

//脚本停止回调
setStopCallback(function () {
    //释放所有资源,一般不需要调用,或者放到setStopCallback中
    logi("释放paddleOcrOnline对象")
    paddleOcrOnline && paddleOcrOnline.releaseAll()
})

//初始化自动化环境
function initEnv() {
    if (!startEnv()) {
        loge("自动化启动失败,结束脚本")
        exit()
    }
    if (!image.requestScreenCapture(10000, 0)) {
        loge("申请截图权限失败,检查是否开启后台弹出,悬浮框等权限")
        exit()
    }
    //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
    sleep(1000)
}

//初始化所有ocr对象及环境
function initAllOcr() {
    // paddleOcrOnline,参数参考上方解释,不需要的参数可以不填
    let paddleOcrOnlineMap = {
        "serverUrl": "10.0.0.112", 
        "type": "paddleOcrOnline",
        "ocrType": "ONNX_PPOCR_V3",
    }
    //创建ocr对象,仅脚本开头一次即可
    paddleOcrOnline = ocr.newOcr()
    //初始化ocr,仅脚本开头一次即可
    if (!paddleOcrOnline.initOcr(paddleOcrOnlineMap)) {
        loge("OCR初始化失败 : " + paddleOcrOnline.getErrorMsg())
        exit()
    }
}

// ocr识别
function ocrFunc() {
    // 截图
    let img = image.captureFullScreenEx()
    if (!img) {
        loge("截图失败")
        return
    }
    logi("===================paddleOcrOnline识别======================")
    // 用paddleOcrOnline进行识别
    let result = paddleOcrOnline.ocrImage(img, 20 * 1000, {})
    if (result) {
        logd("ocr结果-> " + JSON.stringify(result))
        for (let i = 0; i < result.length; i++) {
            let value = result[i]
            logd("文字 : " + value.label + " x: " + value.x + " y: " + value.y + " width: " + value.width + " height: " + value.height)
        }
    } else {
        logw("未识别到结果")
    }

    //回收图片
    image.recycle(img)
}

function main() {
    //初始化环境
    initEnv()
    //初始化所有ocr对象及环境
    initAllOcr()
    //多次识别
    ocrFunc()
    ocrFunc()
    ocrFunc()
}

main()
```

### 11.17+版本paddleLiteOcr例子 ​

```
let paddlelite = null
//脚本停止回调
setStopCallback(function () {
  //释放所有资源,一般不需要调用,或者放到setStopCallback中
  logi("释放 paddleLite 对象")
  paddlelite && paddlelite.releaseAll()
})

//初始化自动化环境
function initEnv() {
  if (!startEnv()) {
    loge("自动化启动失败,结束脚本")
    exit()
  }
  if (!image.requestScreenCapture(10000, 0)) {
    loge("申请截图权限失败,检查是否开启后台弹出,悬浮框等权限")
    exit()
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
}

//初始化 paddlelite
function initOcrpaddle() {
  let paddleliteMap = {"type": "paddleLiteOcr"}
  //创建ocr对象,仅脚本开头一次即可
  paddlelite = ocr.newOcr()
  //初始化ocr,仅脚本开头一次即可
  if (!paddlelite.initOcr(paddleliteMap)) {
    loge("OCR初始化失败 : " + paddlelite.getErrorMsg())
    exit()
  }
}

// ocr识别
function ocrFunc() {
  // 截图
  let img = image.captureFullScreenEx()
  if (!img) {
    loge("截图失败")
    return
  }
  // 对图片进行识别
  let result = paddlelite.ocrImage(img, 20 * 1000, {})
  if (result) {
    logd("ocr结果-》 " + JSON.stringify(result))
    for (let i = 0; i < result.length; i++) {
      let value = result[i]
      logd("文字 : " + value.label + " x: " + value.x + " y: " + value.y + " width: " + value.width + " height: " + value.height)
    }
  } else {
    logw("未识别到结果")
  }
  //回收图片
  image.recycle(img)
}

function main() {
  //初始化环境
  initEnv()
  //初始化ocr
  initOcrpaddle()
  //多次识别
  ocrFunc()
  ocrFunc()
  ocrFunc()
}

main()
```

### 11.26+版本 paddleOcrOnnxV4,paddleOcrOnnxV5 例子 ​

```
let paddleOcrOnnx = null
//脚本停止回调
setStopCallback(function () {
  //释放所有资源,一般不需要调用,或者放到setStopCallback中
  logi("释放 paddleOcrOnnx 对象")
  paddleOcrOnnx && paddleOcrOnnx.releaseAll()
})

//初始化自动化环境
function initEnv() {
  if (!startEnv()) {
    loge("自动化启动失败,结束脚本")
    exit()
  }
  if (!image.requestScreenCapture(10000, 0)) {
    loge("申请截图权限失败,检查是否开启后台弹出,悬浮框等权限")
    exit()
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
}

//初始化 paddlelite
function initOcrpaddle() {
  // type可以是paddleOcrOnnxV4或者paddleOcrOnnxV5
  let paddleOnnxMap = {"type": "paddleOcrOnnxV4","modelsDir":"","numThread":2,"padding":60,"maxSideLen":960}
  //创建ocr对象,仅脚本开头一次即可
  paddleOcrOnnx = ocr.newOcr()
  //初始化ocr,仅脚本开头一次即可
  if (!paddleOcrOnnx.initOcr(paddleOnnxMap)) {
    loge("OCR初始化失败 : " + paddleOcrOnnx.getErrorMsg())
    exit()
  }
}

// ocr识别
function ocrFunc() {
  // 截图
  let img = image.captureFullScreenEx()
  if (!img) {
    loge("截图失败")
    return
  }
  // 对图片进行识别
  let result = paddleOcrOnnx.ocrImage(img, 20 * 1000, {})
  if (result) {
    logd("ocr结果-》 " + JSON.stringify(result))
    for (let i = 0; i < result.length; i++) {
      let value = result[i]
      logd("文字 : " + value.label+" confidence:"+value.confidence + " 范围: " + value.x + "," + value.y + "," + (value.x+value.width) + "," + (value.y+value.height))
    }
  } else {
    logw("未识别到结果")
  }
  //回收图片
  image.recycle(img)
}

function main() {
  //初始化环境
  initEnv()
  //初始化ocr
  initOcrpaddle()
  //多次识别
  ocrFunc()
  ocrFunc()
  ocrFunc()
}

main()
```

### 11.28+版本 paddleOcrNcnnV5 例子 ​

```
let ncnnOcr = null
//脚本停止回调
setStopCallback(function () {
  //释放所有资源,一般不需要调用,或者放到setStopCallback中
  logi("释放 ncnnOcr 对象")
  ncnnOcr && ncnnOcr.releaseAll()
})

//初始化自动化环境
function initEnv() {
  if (!startEnv()) {
    loge("自动化启动失败,结束脚本")
    exit()
  }
  if (!image.requestScreenCapture(10000, 0)) {
    loge("申请截图权限失败,检查是否开启后台弹出,悬浮框等权限")
    exit()
  }
  //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
  sleep(1000)
}

//初始化 
function initOcrpaddle() {
  // type= paddleOcrNcnnV5
  let config = {"type": "paddleOcrNcnnV5","modelsDir":"","numThread":0,"padding":32,"maxSideLen":640}
  //创建ocr对象,仅脚本开头一次即可
  ncnnOcr = ocr.newOcr()
  //初始化ocr,仅脚本开头一次即可
  if (!ncnnOcr.initOcr(config)) {
    loge("OCR初始化失败 : " + ncnnOcr.getErrorMsg())
    exit()
  }
}

// ocr识别
function ocrFunc() {
  // 截图
  let img = image.captureFullScreenEx()
  if (!img) {
    loge("截图失败")
    return
  }
  // 对图片进行识别 也可以动态设置参数
  let result = ncnnOcr.ocrImage(img, 20 * 1000, {"padding":32})
  if (result) {
    logd("ocr结果-》 " + JSON.stringify(result))
    for (let i = 0; i < result.length; i++) {
      let value = result[i]
      logd("文字 : " + value.label+" confidence:"+value.confidence + " 范围: " + value.x + "," + value.y + "," + (value.x+value.width) + "," + (value.y+value.height))
    }
  } else {
    logw("未识别到结果")
  }
  //回收图片
  image.recycle(img)
}

function main() {
  //初始化环境
  initEnv()
  //初始化ocr
  initOcrpaddle()
  //多次识别
  ocrFunc()
  ocrFunc()
  ocrFunc()
}

main()
```

### 9.17+版本-单实例-ocrLite ​

- 注意 9.17+ ocr有单例变成多例模式，跟着下面的方式走，更改初始化initOcr的参数即可，之前的ocrlite、paddleOcrOnline都是支持的

```
let ocrLite = null
//脚本停止回调
setStopCallback(function () {
    //释放所有资源,一般不需要调用,或者放到setStopCallback中
    logi("释放ocrLite对象")
    ocrLite && ocrLite.releaseAll()
})

//初始化自动化环境
function initEnv() {
    if (!startEnv()) {
        loge("自动化启动失败,结束脚本")
        exit()
    }
    if (!image.requestScreenCapture(10000, 0)) {
        loge("申请截图权限失败,检查是否开启后台弹出,悬浮框等权限")
        exit()
    }
    //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
    sleep(1000)
}

//初始化ocrlite
function initOcrLite() {
    let ocrLiteMap = {"type": "ocrLite", "numThread": 1, "padding": 10, "maxSideLen": 0}
    //创建ocr对象,仅脚本开头一次即可
    ocrLite = ocr.newOcr()
    //初始化ocr,仅脚本开头一次即可
    if (!ocrLite.initOcr(ocrLiteMap)) {
        loge("OCR初始化失败 : " + ocrLite.getErrorMsg())
        exit()
    }
}

// ocr识别
function ocrFunc() {
    // 截图
    let img = image.captureFullScreenEx()
    if (!img) {
        loge("截图失败")
        return
    }
    // 对图片进行识别
    let result = ocrLite.ocrImage(img, 20 * 1000, {})
    if (result) {
        logd("ocr结果-》 " + JSON.stringify(result))
        for (let i = 0; i < result.length; i++) {
            let value = result[i]
            logd("文字 : " + value.label + " x: " + value.x + " y: " + value.y + " width: " + value.width + " height: " + value.height)
        }
    } else {
        logw("未识别到结果")
    }
    //回收图片
    image.recycle(img)
}

function main() {
    //初始化环境
    initEnv()
    //初始化ocr
    initOcrLite()
    //多次识别
    ocrFunc()
    ocrFunc()
    ocrFunc()
}

main()
```

### 9.17+版本-多实例-ocrLite + mlkit ​

- 注意 9.17+ ocr有单例变成多例模式，跟着下面的方式走，更改初始化initOcr的参数即可，之前的ocrlite、paddleOcrOnline都是支持的

```
let ocrLite = null
let mlkit = null
//脚本停止回调
setStopCallback(function () {
    //释放所有资源,一般不需要调用,或者放到setStopCallback中
    logi("释放ocrLite对象")
    ocrLite && ocrLite.releaseAll()
    logi("释放mlkit对象")
    mlkit && mlkit.releaseAll()
})

//初始化自动化环境
function initEnv() {
    if (!startEnv()) {
        loge("自动化启动失败,结束脚本")
        exit()
    }
    if (!image.requestScreenCapture(10000, 0)) {
        loge("申请截图权限失败,检查是否开启后台弹出,悬浮框等权限")
        exit()
    }
    //申请完权限至少等1s(垃圾设备多加点)再截图,否则会截不到图
    sleep(1000)
}

//初始化所有ocr对象及环境
function initAllOcr() {
    let ocrLiteMap = {"type": "ocrLite", "numThread": 1, "padding": 10, "maxSideLen": 0}
    //创建ocr对象,仅脚本开头一次即可
    ocrLite = ocr.newOcr()
    //初始化ocr,仅脚本开头一次即可
    if (!ocrLite.initOcr(ocrLiteMap)) {
        loge("OCR初始化失败 : " + ocrLite.getErrorMsg())
        exit()
    }

    let mlkitMap = {
        "type": "mlkit",
    }
    //创建ocr对象,仅脚本开头一次即可
    mlkit = ocr.newOcr()
    //初始化ocr,仅脚本开头一次即可
    if (!mlkit.initOcr(mlkitMap)) {
        loge("OCR初始化失败 : " + mlkit.getErrorMsg())
        exit()
    }
}

// ocr识别
function ocrFunc() {
    // 截图
    let img = image.captureFullScreenEx()
    if (!img) {
        loge("截图失败")
        return
    }
    logi("===================ocrLite识别======================")
    // 用ocrLite进行识别
    let result = ocrLite.ocrImage(img, 20 * 1000, {})
    if (result) {
        logd("ocr结果-》 " + JSON.stringify(result))
        for (let i = 0; i < result.length; i++) {
            let value = result[i]
            logd("文字 : " + value.label + " x: " + value.x + " y: " + value.y + " width: " + value.width + " height: " + value.height)
        }
    } else {
        logw("未识别到结果")
    }
    // 用mlkit进行识别
    logi("===================mlkit识别======================")
    // orz 参数代表是旋转角度，0 代表不旋转 90 代表向左旋转90度，还有180，270，360参数
    result = mlkit.ocrImage(img, 20 * 1000,  {"orz": 0})
    if (result) {
        logd("ocr结果-》 " + JSON.stringify(result))
        for (let i = 0; i < result.length; i++) {
            let value = result[i]
            logd("文字 : " + value.label + " x: " + value.x + " y: " + value.y + " width: " + value.width + " height: " + value.height)
        }
    } else {
        logw("未识别到结果")
    }
    //回收图片
    image.recycle(img)
}

function main() {
    //初始化环境
    initEnv()
    //初始化所有ocr对象及环境
    initAllOcr()
    //多次识别
    ocrFunc()
    ocrFunc()
    ocrFunc()
}

main()
```

### easyedge OCR例子 [低于9.17版本] ​

提示

此方法不推荐

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

    let paddleocr = {
        "type": "paddleocr"
    }

    let easyedge = {
        "type": "easyedge",

    }
    let ocrlite = {
        "type": "ocrLite",

    }
    let inited = ocr.initOcr(easyedge)
    logd("初始化结果 -" + inited);
    if (!inited) {
        loge("error : " + ocr.getErrorMsg());
        return;
    }
    // ocrLite 模式下 不需要初始化这个server 没用的
    let initServer = ocr.initOcrServer(5 * 1000);
    logd("initServer " + initServer);
    if (!initServer) {
        loge("initServer error : " + ocr.getErrorMsg());
        return;
    }
    ocr.setDaemonServer(true, 500);
    for (var ix = 0; ix < 20; ix++) {

        //读取一个bitmap
        let bitmap = image.readBitmap("/sdcard/Screenshot_20210127_152932_com.huawei.android.lau.jpg");
        if (!bitmap) {
            loge("读取图片失败");
            continue;
        }
        console.time("1")
        logd("start---ocr");
        // 对图片进行识别
        let result = ocr.ocrBitmap(bitmap, 20 * 1000, {});
        logd(result)
        if (result) {
            logd("ocr结果-》 " + JSON.stringify(result));
            for (var i = 0; i < result.length; i++) {
                var value = result[i];
                logd("文字 : " + value.label + " x: " + value.x + " y: " + value.y + " width: " + value.width + " height: " + value.height);
            }
        } else {
            logw("未识别到结果");
        }
        bitmap.recycle();
        logd("耗时: " + console.timeEnd(1) + " ms")
        sleep(1000);
        logd("ix = " + ix)
    }
    //释放所有资源
    ocr.releaseAll();
}

main();
```

### Paddle OCR例子 [低于9.17版本] ​

提示

此方法不推荐

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

    let paddleocr = {
        "type": "paddleocr"
    }

    let easyedge = {
        "type": "easyedge",
    }

    let inited = ocr.initOcr(paddleocr)
    logd("初始化结果 -" + inited);
    if (!inited) {
        loge("error : " + ocr.getErrorMsg());
        return;
    }

    let initServer = ocr.initOcrServer(5 * 1000);
    logd("initServer " + initServer);
    if (!initServer) {
        loge("initServer error : " + ocr.getErrorMsg());
        return;
    }
    ocr.setDaemonServer(true, 500);
    for (var ix = 0; ix < 20; ix++) {

        //读取一个bitmap
        let bitmap = image.readBitmap("/sdcard/Screenshot_20210127_152932_com.huawei.android.lau.jpg");
        if (!bitmap) {
            loge("读取图片失败");
            continue;
        }
        console.time("1")
        logd("start---ocr");
        // 对图片进行识别
        let result = ocr.ocrBitmap(bitmap, 20 * 1000, {});
        logd(result)
        if (result) {
            logd("ocr结果-》 " + JSON.stringify(result));
            for (var i = 0; i < result.length; i++) {
                var value = result[i];
                logd("文字 : " + value.label + " x: " + value.x + " y: " + value.y + " width: " + value.width + " height: " + value.height);
            }
        } else {
            logw("未识别到结果");
        }
        bitmap.recycle();
        logd("耗时: " + console.timeEnd(1) + " ms")
        sleep(1000);
        logd("ix = " + ix)
    }
    //释放所有资源
    ocr.releaseAll();
}

main();
```

### Tesseract 例子 [低于9.17版本] ​

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

    //Tesseract模块初始化参数
    let tessInitMap = {
        "type": "tess",
        "language": "chi_sim",
        "debug": true
    }

    let inited = ocr.initOcr(tessInitMap)
    logd("初始化结果 -" + inited);
    if (!inited) {
        loge("error : " + ocr.getErrorMsg());
        return;
    }

    //读取一个bitmap
    let bitmap = image.readBitmap("/sdcard/a.png");
    if (!bitmap) {
        loge("读取图片失败");
        return;
    }
    // 对图片进行识别
    let result = ocr.ocrBitmap(bitmap, 20 * 1000, {});
    if (result) {
        logd("ocr结果-》 " + JSON.stringify(result));
        for (var i = 0; i < result.length; i++) {
            var value = result[i];
            logd("文字 : " + value.label + " x: " + value.x + " y: " + value.y + " width: " + value.width + " height: " + value.height);
        }
    } else {
        logw("未识别到结果");
    }

    bitmap.recycle();
    //释放所有资源
    ocr.releaseAll();

}


main();
```

### 百度在线OCR例子 [低于9.17版本] ​

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

    let baiduOnlineInitMap = {
        "type": "baiduOnline",
        "ak": "xx",
        "sk": "xx"
    }

    let inited = ocr.initOcr(baiduOnlineInitMap)
    logd("初始化结果 -" + inited);
    if (!inited) {
        loge("error : " + ocr.getErrorMsg());
        return;
    }

    //读取一个bitmap
    let bitmap = image.readBitmap("/sdcard/a.png");
    if (!bitmap) {
        loge("读取图片失败");
        return;
    }
    // URL 参数参见 ： https://ai.baidu.com/ai-doc/OCR/tk3h7y2aq
    // 对图片进行识别
    let result = ocr.ocrBitmap(bitmap, 20 * 1000, {"url": "https://aip.baidubce.com/rest/2.0/ocr/v1/accurate"});
    if (result) {
        logd("ocr结果-》 " + JSON.stringify(result));
        for (var i = 0; i < result.length; i++) {
            var value = result[i];
            logd("文字 : " + value.label + " x: " + value.x + " y: " + value.y + " width: " + value.width + " height: " + value.height);
        }
    } else {
        logw("未识别到结果 " + ocr.getErrorMsg());
    }

    bitmap.recycle();
    //释放所有资源
    ocr.releaseAll();

}

main();
```

### Mlkit OCR例子 [低于9.17版本] ​

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

    let mlkit = {
        "type": "mlkit"
    }

    let inited = ocr.initOcr(mlkit)
    logd("初始化结果 -" + inited);
    if (!inited) {
        loge("error : " + ocr.getErrorMsg());
        return;
    }
    for (var ix = 0; ix < 20; ix++) {
        let tmpImage = image.captureFullScreen();
        // orz 参数代表是旋转角度，0 代表不旋转 90 代表向左旋转90度，还有180，270，360参数
        let result = ocr.ocrImage(tmpImage, 20000, {"orz": 0});
        logd("耗时 {}", console.timeEnd(1))
        if (result) {
            for (let i = 0; i < result.length; i++) {
                logd(JSON.stringify(result[i]))
            }
        }
        image.recycle(tmpImage)
    }
    //释放所有资源
    ocr.releaseAll();
}

main();
```

### ocrLite OCR例子 [低于9.17版本] ​

```
function main() {
    //let start = startEnv()
    //logd("start {}", start)

    let s = image.requestScreenCapture(10000, 0);
    logd("s {}", s)


    logd("初始化ocrLite")

    let m = {
        "type": "ocrLite"
    }
    m = {"type": "ocrLite", "numThread": 1, "padding": 10, "maxSideLen": 0};
    let iniit = ocr.initOcr(m);
    logd("初始化o " + iniit)
    image.initOpenCV()
    sleep(1000)
    let id = thread.execAsync(function () {
        while (true) {
            sleep(1000)

            let tmpImage = image.captureFullScreen();
            logd("截图 tmpImage {}", tmpImage)
            let tt = image.binaryzation(tmpImage, 1, 100)
            console.time(1)
            let result = ocr.ocrImage(tt, 10000, {"maxSideLen": 1024});
            if (result) {
                for (let i = 0; i < result.length; i++) {
                    logd(JSON.stringify(result[i]))
                }
            }
            logd("耗时 {}", console.timeEnd(1))
            image.recycle(tt)
            image.recycle(tmpImage)
        }
    })

    logd("线程 thread id = {}", id)

    sleep(115 * 1000)
    thread.cancelThread(id)
    sleep(1000)
    //restartScript("/sdcard/release.iec", true, 3)
}

main();
```

## ocr.setOcrType 设置类型 ​

- 设置OCR实现方式
- 适用版本(EC 5.17.0+)
- @param type 值分别为 tess = Tesseract模块，baiduOnline=百度在在线识别模块
- @return `{bool}` 成功或者失败

```
代码例子常见
OCR初始化
```

## ocr.setDaemonServer 守护OCR服务 ​

- 设置是否守护OCR服务
- 适合版本 EC 6.9.0+
- @param daemon true 代表守护，false代表不守护
- @param delay 每次守护间隔，单位是毫秒
- @return `{bool}` 成功或者失败

```
代码例子常见
OCR初始化
```

## ocr.ocrBitmap 识别文字 ​

- 对Bitmap进行OCR，返回的是JSON数据，其中数据类似于与：
- 适用版本(EC 5.17.0+)

```
[
  {
    "label": "奇趣装扮三阶盘化",
    "confidence": 0.48334712,
    "x": 11,
    "y": 25,
    "width": 100,
    "height": 100
  }
]
```

- label: 代表是识别的文字
- confidence：代表识别的准确度
- x: 代表X开始坐标
- Y: 代表Y开始坐标
- width: 代表宽度
- height: 代表高度
- @param bitmap 图片
- @param timeout 超时时间 单位毫秒
- @param extra 扩展参数，map形式，例如 `{"token":"xxx"}`
- @return `{json}` JSON对象

```
代码例子常见
OCR初始化
```

## ocr.ocrImage 识别文字 ​

- 对 AutoImage 进行OCR，返回的是JSON数据，其中数据类似于与：
- 适用版本(EC 8.2.0+)

```
[
  {
    "label": "奇趣装扮三阶盘化",
    "confidence": 0.48334712,
    "x": 11,
    "y": 25,
    "width": 100,
    "height": 100
  }
]
```

- label: 代表是识别的文字
- confidence：代表识别的准确度
- x: 代表X开始坐标
- Y: 代表Y开始坐标
- width: 代表宽度
- height: 代表高度
- @param image 图片
- @param timeout 超时时间 单位毫秒
- @param extra 扩展参数，map形式，例如 `{"token":"xxx"}`
- @return `{json}` JSON对象

## ocr.getErrorMsg 获取错误消息 ​

- 获取OCR错误消息
- 适用版本(EC 5.17.0+)
- @return `{string}` null代表没有错误

```
代码例子常见
OCR初始化
```

## ocr.releaseAll 释放OCR资源 ​

- 释放OCR占用的资源
- 适用版本(EC 5.17.0+)
- @return `{bool}` 成功或者失败

```
代码例子常见
OCR初始化
```
