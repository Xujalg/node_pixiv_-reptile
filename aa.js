const MysKeyTranslate = require("./MysKeyTranslate"); // 引入刚才保存的文件

const translate = MysKeyTranslate.test({
  appid: "20220110001051952",  // 你的appid  去百度开发者平台查看 http://api.fanyi.baidu.com/doc/21
  secret: "rKPtusOKhlXN5jwTosA2", // 你的密钥
});

// 下面就可以直接使用了
translate('密钥', { from: "jp", to: 'zh' }).then((res) => {
  console.log('res', res);
});


