// ==UserScript==
// @name           youkuvod
// @version        16.12.25.01
// @description    第三方服务解析视频,ckplayer播放视频,去掉优酷广告
// @icon           http://upload.xinshangshangxin.com/o_19pbo74ug1egh1d4tt818hb14b49.ico
// @include        http://v.youku.com/v_show/id*
// @grant          GM_xmlhttpRequest
// @auther         SHANG殇
// @namespace      SHANG
// ==/UserScript==


//全局变量
var currentHref = window.location.href;
var isLog = false;
var timeout = 15 * 1000;
var definitions = ['1080', '超清', '高清', '标清']; //清晰度
var playId = 'player'; //播放替换的 id

var ckSwf = 'http://youkuvod.coding.me/youkuvod/ckplayer/ckplayer.swf';
var ckJs = 'https://greasyfork.org/scripts/17997-ckplayer6-6/code/ckplayer66.js?version=113417';

var definitionDiv = document.createElement('div');

// 载入需要的ckJs
loadCkJs();

// polyfill
polyfill();

// 界面设置
pageSetting();

// 用户设置
var option = {
  definition: 1   //清晰度
};

if(localStorage.getItem('shang_youkuvod')) {
  var userOption = JSON.parse(localStorage.getItem('shang_youkuvod'));
  option.definition = userOption.definition === undefined ? option.definition : parseInt(userOption.definition);
}
// 用户设置结束


// 开始查询 播放URL;
if(isMatch(currentHref)) {
  startParse();
}

function startParse() {
  var nu = 0;
  var targetNu = 1;
  var results = [];
  var isPlaying = false;
  // addressXML(currentHref, function(err, data) {
  //   nu++;
  //   if(err) {
  //     log(err);
  //     tryPlay(results, nu);
  //     return;
  //   }
  //   results.push.apply(results, data);
  //   tryPlay(results, nu);
  // });

  address(currentHref, function(err, data) {
    nu++;
    if(err) {
      log(err);
      tryPlay(results, nu);
      return;
    }
    results.push.apply(results, data.filter(function(item) {
      return haveUrls(item);
    }).reverse());
    tryPlay(results, nu);
  });


  function tryPlay() {
    log('nu: ', nu, 'results: ', results);
    if(!results.length) {
      if(nu === targetNu) {
        throwError(null, nu === targetNu);
      }
      return;
    }

    addButton(results);

    var matchObj = results.filter(function(item) {
      return item.name === definitions[option.definition];
    })[0];

    if(haveUrls(matchObj)) {
      isPlaying = true;
      log('matchObj.data: ', matchObj.data);
      log('all results:', results);
      startPlay(matchObj.data.join('|'));
    }

    if(!isPlaying && nu === targetNu) {
      matchObj = results[results.length - 1];

      log('matchObj.data: ', matchObj.data);
      log('all results:', results);
      startPlay(matchObj.data.join('|'));
    }

  }
}

function haveUrls(matchObj) {
  return matchObj && matchObj.data && matchObj.data.length;
}


//检测匹配(待完善)
function isMatch(url) {
  return /v\.youku\.com\/v_show\/id/.test(url);
}

//未解析到视频抛出异常
function throwError(e, isAlert) {
  definitionDiv.innerHTML = '<div>解析失败</div>';
  if(isAlert) {
    alert('没有解析到视频');
  }
}

function addressXML(url, done) {
  log('start addressXML');
  //noinspection JSUnresolvedFunction
  GM_xmlhttpRequest({
    method: 'GET',
    timeout: timeout,
    url: 'http://api.btjson.com/video.php?v=' + url,
    headers: {
      'cache-control': 'no-cache',
      'user-agent': 'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.63 Safari/537.36'
    },
    onload: function(jdata) {
      var data = parseXML(jdata.responseText);
      log('end addressXML: ', data);
      done(null, data);
    },
    onerror: function(res) {
      log('error addressXML');
      done(res);
    },
    ontimeout: function(res) {
      log('timeout addressXML');
      done(res);
    }
  });
}

//地址解析
function address(url, done) {
  log('start address');
  //noinspection JSUnresolvedFunction
  GM_xmlhttpRequest({
    method: 'POST',
    timeout: timeout,
    url: 'http://www.shokdown.com/parse.php',
    data: 'url=' + url,
    headers: {
      'cache-control': 'no-cache',
      'accept-language': 'zh-CN,zh;q=0.8,en;q=0.6',
      referer: 'http://www.shokdown.com/',
      dnt: '1',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'content-type': 'application/x-www-form-urlencoded',
      'user-agent': 'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.63 Safari/537.36',
      'upgrade-insecure-requests': '1',
      'x-devtools-emulate-network-conditions-client-id': 'D045B439-DA29-4CDF-8A2C-B9DE2769D7DD',
      origin: 'http://www.shokdown.com'
    },
    onload: function(jdata) {
      var data = parseHtml(jdata.responseText);
      log('end address, ', data);
      done(null, data);
    },
    onerror: function(res) {
      log('error address');
      done(res);
    },
    ontimeout: function(res) {
      log('timeout address');
      done(res);
    }
  });
}

function parseXML(str) {
  var urls = str.match(/http[^><"' ]+(?=[\r\n]?]]>)/gi);

  if(!urls) {
    return [];
  }

  return [{
    name: '超清',
    len: urls.length,
    data: urls
  }];
}

function parseHtml(str) {
  var info = str.match(/<font color=red>.*?(?=<\/font>)/gi).map(function(item) {
    return item.replace(/<font color=red>/i, '');
  });
  var allA = str.match(/a href=["']?(http[^>"' ]+)(?=["']?)/gi).map(function(item) {
    return item.replace(/a href=["']?/i, '');
  });

  var len;
  var result = [];
  for(var i = 0, l = info.length; i < l - 1; i += 2) {
    if(!/\d+/.test(info[i + 1])) {
      break;
    }

    len = parseInt(info[i + 1]);
    result.push({
      name: info[i],
      len: len,
      data: allA.splice(0, len)
    });
  }

  return result;
}

//播放视频
function startPlay(u, ss, nu) {
  if(!CKobject) {
    if(nu > 2) {
      throwError(new Error('CKobject 不存在！！'), true);
      return;
    }

    setTimeout(function() {
      startPlay(u, ss, (nu || 1) + 1);
    }, 1000);
  }
  ss = ss || 0;
  if(CKobject.getObjectById('syplayer') !== null) {
    CKobject.getObjectById('syplayer').ckplayer_newaddress('{f->' + u + '}{s->' + ss + '}');
    return;
  }

  var loadJs = document.createElement('script');
  loadJs.type = 'text/javascript';
  loadJs.innerHTML = "var flashvars={f:'" + u + "',c:0,v:80,e:0,s:'" + ss + "',p:1,g:'" + 0 + "'};var params={bgcolor:'#FFF',allowFullScreen:true,allowScriptAccess:'always'};CKobject.embedSWF('" + ckSwf + "','" + playId + "','syplayer','100%','100%',flashvars,params);";

  document.getElementsByTagName('body')[0].appendChild(loadJs);
}

//显示悬浮按钮
function addButton(arr) {
  var setting = '';
  //'<button style="display:block;border:none;background:none;" onclick="document.getElementById(\'content_shang\').style.display=(document.getElementById(\'content_shang\').style.display == \'block\' ? \'none\' : \'block\')">设置</button>';
  definitionDiv.innerHTML = setting + arr.map(function(item) {
      return '<input type="button" onclick = "CKobject.getObjectById(\'syplayer\').newAddress(\'{s->0}{f->' +
        item.data.join('|') + '}\');" value="' + item.name +
        '" style="display:block;border:none;background:none;">';
    }).join('');
}

function log() {
  if(isLog) {
    console.log.apply(console, arguments);
  }
}

function loadCkJs() {
  // 载入 ckJs
  var loadCkJsEle = document.createElement('script');
  loadCkJsEle.type = 'text/javascript';
  loadCkJsEle.src = ckJs;
  document.getElementsByTagName('body')[0].appendChild(loadCkJsEle);
}

function pageSetting() {
  var optionShowHtml = document.createElement('div');
  optionShowHtml.innerHTML = '<div id="content_shang">' + '<fieldset>' + '<legend title="">解析服务器</legend>' + '<select id="flv_shang">' + '<option value="ss">舒克</option>' + '' + '</select>' + '</fieldset>' + '<fieldset>' + '<legend title="">默认清晰度</legend>' + '<select id="qxd_shang">' + '' + '<option value="1">超清</option>' + '<option value="2">高清</option>' + '<option value="3">标清</option>' + '</select>' + '</fieldset>' + '<fieldset>' + '<legend title="">注意</legend>' + '点击确定产生<br>' + '刷新页面应用设置' + '<button id="confirm_shang">确定</button>' + '</fieldset>' + '</div>';

  var optionShowStyle = document.createElement('style');
  optionShowStyle.type = 'text/css';
  optionShowStyle.innerHTML = '#content_shang{z-index: 99999;position:fixed;top:50%;margin-top:-150px;right:50px;background:#fbfbfb;display:none}#content_shang fieldset{padding:6px;margin:3px}#content_shang ul{margin:0;padding:0}#content_shang li{list-style:none}input[type=checkbox]:hover{cursor:pointer}';

  var optionShowScript = document.createElement('script');
  optionShowScript.innerHTML = '!function(){function a(){var a={qingxidu:1,isgy:!1,flv:"ss",which:3};localStorage["shang_youkuvod"]&&(a=e(a,JSON.parse(localStorage["shang_youkuvod"]))),b(document.getElementById("flv_shang").options,a.flv),b(document.getElementById("qxd_shang").options,a.qingxidu),b(document.getElementById("which_shang").options,a.which),document.getElementById("isgy_shang").checked=!a.isgy,document.getElementById("confirm_shang").onclick=function(){c(),location.href=location.href},document.getElementById("content_shang").onmouseover=function(){clearTimeout(this.timer),this.style.display="block"},document.getElementById("content_shang").onmouseleave=function(){var a=this;this.timer=setTimeout(function(){a.style.display="none"},1e3)}}function b(a,b){for(var c=0;c<a.length;c++)a[c].value==b&&(a[c].selected=!0)}function c(){var a={};a.flv=d(document.getElementById("flv_shang").options),a.qingxidu=d(document.getElementById("qxd_shang").options),a.which=d(document.getElementById("which_shang").options),a.isgy=!document.getElementById("isgy_shang").checked,localStorage["shang_youkuvod"]=JSON.stringify(a)}function d(a){for(var b=0;b<a.length;b++)if(a[b].selected)return a[b].value;return 0}function e(a,b){for(key in b)a[key]=b[key];return a}a()}();';

  definitionDiv.style.cssText = 'position:fixed; z-index:99999; top:45%; background:white;left:0px; border:3px solid rgb(221,221,221); padding:2px; border-radius:5px;overflow:hidden';
  definitionDiv.innerHTML = '<div>解析视频中</div>';

  var oBody = document.getElementsByTagName('body')[0];
  oBody.appendChild(definitionDiv);
  oBody.appendChild(optionShowHtml);
  oBody.appendChild(optionShowStyle);
  oBody.appendChild(optionShowScript);


  //清晰度显示 侧边栏
  setTimeout(function() {
    definitionDiv.style.width = '0';
  }, 5000);
  definitionDiv.onmouseover = function() {
    definitionDiv.style.width = '';
  };
  definitionDiv.onmouseout = function() {
    definitionDiv.style.width = '0';
  };

  document.getElementsByClassName('vpactionv5_iframe_wrap')[0].style = 'display: none';
}

function polyfill() {
  if(!Array.prototype.filter) {
    Array.prototype.filter = function(fun/*, thisArg*/) {
      'use strict';

      if(this === void 0 || this === null) {
        throw new TypeError();
      }

      var t = Object(this);
      var len = t.length >>> 0;
      if(typeof fun !== 'function') {
        throw new TypeError();
      }

      var res = [];
      var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
      for(var i = 0; i < len; i++) {
        if(i in t) {
          var val = t[i];
          if(fun.call(thisArg, val, i, t)) {
            res.push(val);
          }
        }
      }
      return res;
    };
  }
}


/*
 * 161225       修复进度条不显示问题
 * 160627       btjson停止解析
 * 160607       使用btjson.com解析超清视频
 * 160605       使用舒克解析代替硕鼠
 * 160316       配合greasyfork  "External Script: Please submit script as library."
 * 160102       突破硕鼠20s限制
 * 151204       修正因硕鼠改版导致的解析失效
 * 150414       修正因硕鼠改版导致的解析失效,修正清晰度按钮失效
 * 150322       飞驴api接口关闭;屏蔽相关代码
 * 150219       azure免费到期;域名转coding.net;修改/添加coding.net演示所需要文件
 * 150211       修正在已经设置硕鼠解析清晰度下标清失效问题
 * 150130       使用二级域名,本来域名即将调整
 * 150121       根据jshint修正各种警告
 * 150102       修正/更改 设置按钮 显示位置;修正飞驴1080P解析略过问题;去除京东服务器
 * 141230       图形化设置页面移动至清晰度按钮上方
 * 141229       去除代码设置;添加图形化设置;版本号书写方式变化
 * 141227       默认选择官方原版播放器; 京东太渣了~~~, onerr函数无用
 * 141221       添加飞驴解析; 添加清晰度1080P; 精简部分代码
 * 141219       添加服务器切换设置, 添加服务器挂掉弹窗,移动至github
 * 141217       清晰度选择恢复
 * 141216       更新ckplayer; 暂时去除 清晰度选择(现在只可以选择默认清晰度)
 * 140927       全面去除 飞驴 (┬＿┬); 添加清晰度自动隐藏
 * 140923       因为飞驴解析需要token, 所以默认为 硕鼠,也因此去除 爱奇艺解析(硕鼠不支持) 修正硕鼠下 高清不显示问题
 * 140811       添加更换服务器选项
 * 140725       更新服务器文件(swf文件)
 * 140724       添加爱奇艺解析; 添加更多清晰度(飞驴解析下)
 * 140701       修正视频解析显示错误,  发现某些未能修正错误,暂时只保留基本功能
 * 140628       整合飞驴解析, 添加视频大小选择(顶部栏其他信息显示)   添加设置
 * 140627       图标更改, 修正视频清晰度显示不正确
 * 140626       create
 **/
