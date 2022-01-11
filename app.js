let cheerio = require('cheerio')
let rp = require('request-promise')
let request = require('request')
let fs = require('fs');
let Agent = require('socks5-https-client/lib/Agent');
const MysKeyTranslate = require("./MysKeyTranslate");

let downloadAmount = 10; //下载图片总数
let downloading = 0; //正在下载图片序号
let success = 0; //下载成功数
let fail = 0; //下载失败数
let downloaded = 0; //已存在数
let fails = [] //下载失败列表
let listArr = []; //已经下载的图片列表
let total = 0; //一次抓取的图片数

let headers = {
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
}

function replaceLabel(str) {

  // 去除a标签包括链接
  let newStr = str.replace(/<a.*?<\/a>/g, "")
  return newStr.replace(/<[^>]+>/g, "");
}
// 保存标题信息
function saveInfo(params, textPath) {

  let options = {
    strictSSL: true,
    agentClass: Agent,
    agentOptions: {
      socksHost: "127.0.0.1",
      socksPort: '1080',

    },
    //  获取帖子信息
    uri: encodeURI(`https://www.pixiv.net/ajax/illust/${params.id}?lang=zh`),
    headers: headers,
    transform: function (body) {
      return cheerio.load(body);

    }
  }
  let avatarPath = `./data/${params.id}/avatar/`
  const translate = MysKeyTranslate.test({
    appid: "20220110001051952",  // 你的appid  
    secret: "rKPtusOKhlXN5jwTosA2", // 你的密钥
  });


  // 下面就可以直接使用了

  rp(options).then(async function ($) {
    let str = $('body').html();
    str = str.replace(/&quot;/g, '"');
    let json = JSON.parse(str);
    //  获取body
    let data = json.body;

    let { title, description, userName, userId } = data
    console.log('datadatadatadata', userId)
    // 格式化
    let translatedata = []

    // await translate(`${replaceLabel(title)}\n${replaceLabel(description)}\n${replaceLabel(userName)}`, { from: "auto", to: 'zh' }).then((res) => {
    //   translatedata = res.map(item => {
    //     return item.dst;
    //   })
    // });
    let useroptions = {
      strictSSL: true,
      agentClass: Agent,
      agentOptions: {
        socksHost: "127.0.0.1",
        socksPort: '1080',

      },
      //  获取帖子信息
      uri: encodeURI(`https://www.pixiv.net/ajax/user/${userId}?lang=zh`),
      headers: headers,
      transform: function (body) {
        return cheerio.load(body);

      }
    }
    rp(useroptions).then(async function ($) {
      let str = $('body').html();
      str = str.replace(/&quot;/g, '"');
      let json = JSON.parse(str);
      //  获取body
      let data = json.body;
      const headers = {
        'referer': 'http://www.pixiv.net/member_illust.php?mode=big&illust_id=' + params.id,
        //'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.75 Safari/537.36'
      }

      let Jpg_options = {
        strictSSL: true,
        agentClass: Agent,
        agentOptions: {
          socksHost: "127.0.0.1",
          socksPort: '1080',
        },
        uri: data.image,
        headers,
        transform: function (body) {
          return cheerio.load(body);
        }
      }
      let Png_options = {
        strictSSL: true,
        agentClass: Agent,
        agentOptions: {
          socksHost: "127.0.0.1",
          socksPort: '1080',
        },
        uri: data.image,
        headers,
        transform: function (body) {
          return cheerio.load(body);
        }
      }
      download(Jpg_options, Png_options, params.id, `${params.id}_0`, avatarPath);
    })

    let getText = {
      title: replaceLabel(title), description: replaceLabel(description), userName: replaceLabel(userName)
    }
    // 保存 title信息
    getText = JSON.stringify(getText)
    getText = getText + '\n'
    fs.appendFile(`${textPath}` + data.illustId + '.txt', getText, 'utf-8', function (err) {
      if (err) {
        console.log('保存信息', err)
      }
    })
  })
}
function pixiv(params) {
  let imagePath = `./data/${params.id}/image/`

  let textPath = `./data/${params.id}/`
  // 生成文件夹
  fs.exists(`./data/${params.id}/image/`, function (exists) {
    if (!exists) {
      fs.mkdirSync(`./data/${params.id}`);

      fs.mkdirSync(`./data/${params.id}/image`);

      fs.mkdirSync(`./data/${params.id}/avatar`);
    }
  });
  const list = fs.readFileSync("./data/list.json");
  listArr = JSON.parse(list);
  let options = {
    strictSSL: true,
    agentClass: Agent,
    agentOptions: {
      socksHost: "127.0.0.1",
      socksPort: '1080',
    },
    uri: encodeURI(`https://www.pixiv.net/ajax/illust/${params.id}/pages?lang=zh`),
    headers: headers,
    transform: function (body) {
      return cheerio.load(body);
    }
  }
  console.log('1231313')
  rp(options).then(function ($) {

    let str = $('body').html();

    // console.log("str", $.html());

    str = str.replace(/&quot;/g, '"');

    let json = JSON.parse(str);

    //  获取body
    let data = json.body;

    downloading = 0;
    success = 0;
    fail = 0;
    downloaded = 0;
    total = data.length;
    downloadAmount = data.length;

    data.map((item, index) => {
      let referer = 'http://www.pixiv.net/member_illust.php?mode=big&illust_id=' + params.id;

      let Jpg_options = {
        strictSSL: true,
        agentClass: Agent,
        agentOptions: {
          socksHost: "127.0.0.1",
          socksPort: '1080',
        },
        uri: item.urls.regular,
        headers: {
          'referer': referer,
          //'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8",
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.75 Safari/537.36'
        },
        transform: function (body) {
          return cheerio.load(body);
        }
      }

      let Png_options = {
        strictSSL: true,
        agentClass: Agent,
        agentOptions: {
          socksHost: "127.0.0.1",
          socksPort: '1080',
        },
        uri: item.urls.regular,
        headers: {
          'referer': referer,
          //'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8",
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.75 Safari/537.36'
        },
        transform: function (body) {
          return cheerio.load(body);
        }
      }


      //如果当前图片未被下载过，则下载
      if (listArr.includes(`${params.id}_${index}`) == false) {
        //若当前下载量未到下载总数，则继续下载
        if (downloading < downloadAmount) {
          index === 0 && saveInfo(params, textPath)
          download(Jpg_options, Png_options, params.id, `${params.id}_${index}`, imagePath);
        }
      } else {
        downloading++;
        downloaded++;
        console.log("第 " + downloading + '/' + downloadAmount + " 张已经下载过！ID: " + params.id);
        if (downloading == downloadAmount) {
          finishDownload();
        }
      }

    })


  })
  return '23113';
}


//通过判断访问url得到的状态码是否是404来判断图片是jpg格式还是png格式
function download(Jpg_options, Png_options, id, filename, imagePath) {
  request(Jpg_options, function (error, response, body) {

    let now_options = Jpg_options;
    if (response.statusCode != 404) {
      let name = filename + '.jpg';
      // `./datas/${data.illustId}/`
      let writeStream = fs.createWriteStream(`${imagePath}` + name);
      let readStream = request(now_options);
      readStream.pipe(writeStream);
      writeStream.on("finish", function () {
        downloading++;
        success++;
        console.log("第 " + downloading + '/' + downloadAmount + " 张下载成功！ID: " + id);
        writeStream.end();
        listArr.push(filename);
        if (downloading == downloadAmount) {
          finishDownload();
        }

      });
    } else {
      request(Png_options, function (error, response, body) {
        let now_options = Png_options;
        if (response.statusCode != 404) {
          let name = filename + '.png';
          let writeStream = fs.createWriteStream(`${imagePath}` + name);
          let readStream = request(now_options);
          readStream.pipe(writeStream);
          writeStream.on("finish", function () {
            downloading++;
            success++;
            console.log("第 " + downloading + '/' + downloadAmount + " 张下载成功！ID: " + id);
            writeStream.end();
            listArr.push(filename);
            if (downloading == downloadAmount) {
              finishDownload();
            }
          });

        } else {
          // 下载失败如何处理？ 
          downloading++;
          fail++

          console.log("第 " + downloading + '/' + downloadAmount + " 张下载失败！ID: " + id);
          fails.push(filename)
          if (downloading == downloadAmount) {
            finishDownload();
          }

        }

      });
    }
  });
}

function finishDownload() {
  let finallist = JSON.stringify(listArr, '', '\t');
  fs.writeFileSync("./data/list.json", finallist);
  console.log('全部下载完毕！共抓取到 ' + total + " 张，计划下载 " + downloadAmount + " 张，其中 " + downloaded + " 张已存在，下载成功 " + success + " 张，下载失败 " + fail + " 张。");
  if (fail > 0) {
    console.log('下载失败：' + fails);
  }
}





exports.pixiv = pixiv;

