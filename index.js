(function() {
    // ==UserScript==
    // @name           youkuvod
    // @version        2.1.2
    // @description    硕鼠/飞驴解析视频,ckplayer播放视频,去掉广告
    // @icon           http://i3.tietuku.com/11d6c35e96ef7c9f.jpg
    // @include        http://v.youku.com/v_show/id*
    // @grant          GM_xmlhttpRequest
    // @auther         SHANG殇
    // @namespace      SHANG
    // ==/UserScript==


    var optionshowhtml = document.createElement('div');
    optionshowhtml.innerHTML = '<div id="content_shang">' + '            <fieldset>' + '                <legend title="">解析服务器</legend>' + '                <select id="flv_shang">' + '                    <option value="ss">硕鼠</option>' + '                    <option value="flv">飞驴</option>' + '                </select>' + '            </fieldset>' + '            <fieldset>' + '                <legend title="">默认清晰度</legend>' + '                <select id="qxd_shang">' + '                    <option value="0">1080P[飞驴解析下]</option>' + '                    <option value="1">超清</option>' + '                    <option value="2">高清</option>' + '                    <option value="3">标清</option>' + '                </select>' + '            </fieldset>' + '            <fieldset>' + '                <legend title="">播放器服务器</legend>' + '                <select id="which_shang">' + '                    <option value="1">京东云</option>' + '                    <option value="2">ckplayer官方[推荐]</option>' + '                    <option value="3">azure</option>' + '                </select>' + '            </fieldset>' + '            <fieldset>' + '                <legend title="">港剧语言</legend>' + '                <input id="isgy_shang" type="checkbox">粤语' + '            </fieldset>' + '            <fieldset>' + '                <legend title="">注意</legend>' + '                点击确定产生<br>' + '                刷新页面应用设置' + '                <button id="confirm_shang">确定</button>' + '            </fieldset>' + '        </div>';
    var optionshowstyle = document.createElement('style');
    optionshowstyle.type = 'text/css';
    optionshowstyle.innerHTML = '#content_shang{z-index: 99999;position:fixed;top:50%;margin-top:-150px;left:50px;background:#fbfbfb;display:none}#content_shang fieldset{padding:6px;margin:3px}#content_shang ul{margin:0;padding:0}#content_shang li{list-style:none}input[type=checkbox]:hover{cursor:pointer}';
    var optionshowscript = document.createElement('script');
    optionshowscript.innerHTML = '!function(){function a(){var a={qingxidu:1,isgy:!1,flv:"flv",which:2};localStorage["shang_youkuvod"]&&(a=e(a,JSON.parse(localStorage["shang_youkuvod"]))),b(document.getElementById("flv_shang").options,a.flv),b(document.getElementById("qxd_shang").options,a.qingxidu),b(document.getElementById("which_shang").options,a.which),document.getElementById("isgy_shang").checked=!a.isgy,document.getElementById("confirm_shang").onclick=function(){c(),location.href=location.href},document.getElementById("content_shang").onmouseover=function(){clearTimeout(this.timer),this.style.display="block"},document.getElementById("content_shang").onmouseleave=function(){var a=this;this.timer=setTimeout(function(){a.style.display="none"},1e3)}}function b(a,b){for(var c=0;c<a.length;c++)a[c].value==b&&(a[c].selected=!0)}function c(){var a={};a.flv=d(document.getElementById("flv_shang").options),a.qingxidu=d(document.getElementById("qxd_shang").options),a.which=d(document.getElementById("which_shang").options),a.isgy=!document.getElementById("isgy_shang").checked,localStorage["shang_youkuvod"]=JSON.stringify(a)}function d(a){for(var b=0;b<a.length;b++)if(a[b].selected)return a[b].value;return 0}function e(a,b){for(key in b)a[key]=b[key];return a}a()}();';

    var qxdiv = document.createElement('div');
    qxdiv.style.cssText = "position:fixed; z-index:99999; top:45%; background:white;left:0px; border:3px solid rgb(221,221,221); padding:2px; border-radius:5px;overflow:hidden";
    // qxdiv.innerHTML = '<button style="display:block;border:none;background:none;" onclick="document.getElementById(\'content_shang\').style.display=(document.getElementById(\'content_shang\').style.display == \'block\' ? \'none\' : \'block\')">设置</button>';

    var oBody = document.getElementsByTagName('body')[0];
    oBody.appendChild(qxdiv);
    oBody.appendChild(optionshowhtml);
    oBody.appendChild(optionshowstyle);
    oBody.appendChild(optionshowscript);


    var option = {
        qingxidu: 1,
        isgy: false,
        flv: 'flv',
        which: 2
    }
    if (localStorage['shang_youkuvod']) {
        option = extend(option, JSON.parse(localStorage['shang_youkuvod']));
    }

    qingxidu = option.qingxidu;
    isgy = option.isgy;
    flv = option.flv;
    which = option.which;

    function extend(o1, o2) {
        for (key in o2) {
            o1[key] = o2[key];
        }
        return o1;
    }


    //全局变量
    var u; //播放地址
    var urlanswer = []; //清晰度解析地址
    var isconti = true; //播放环境
    var islog = true; //是否输出日志
    var qxdchoose = ['1080', '超清', '高清', '标清']; //清晰度
    var hadjiexi = []; //是否解析过
    var playid = 'player'; //播放替换的 id
    var ptime = 0;

    // 京东服务器 容易挂
    var ckjs = 'http://youkuvod.jd-app.com/ckplayer/ckplayer.js';
    var ckswf = 'http://youkuvod.jd-app.com/ckplayer/ckplayer.swf';
    var parseflv = 'http://youkuvod.jd-app.com/?';

    if (which == 2) {
        //官方原版   不够美化
        ckswf = 'http://www.ckplayer.com/ckplayer/6.6/ckplayer.swf';
        ckjs = 'http://git.oschina.net/xinshangshangxin/youkuvod/raw/master/ckplayer/ckplayer.js';
        parseflv = 'http://xinshangshangxin.com/youkuvod/?';
    }
    else if (which == 3) {
        // azure 流量不够用~~
        ckjs = 'http://xinshangshangxin.com/youkuvod/ckplayer/ckplayer.js';
        ckswf = 'http://xinshangshangxin.com/youkuvod/ckplayer/ckplayer.swf';
        parseflv = 'http://xinshangshangxin.com/youkuvod/?';
    }



    var locationhref = window.location.href;

    //载入ckplayer.js
    GM_xmlhttpRequest({
        method: "GET",
        url: ckjs,
        onload: function(jdata) {
            loadjs = document.createElement('script');
            loadjs.type = 'text/javascript';
            loadjs.innerHTML = jdata.responseText;
            document.getElementsByTagName('body')[0].appendChild(loadjs);
        }
    });

    //清晰度显示 侧边栏

    setTimeout(function() {
        qxdiv.style.width = "0";
    }, 5000);


    qxdiv.onmouseover = function() {
        qxdiv.style.width = "";
    }

    qxdiv.onmouseout = function() {
        qxdiv.style.width = "0";
    }

    chushihua();

    //初始化变量
    function chushihua() {
        for (var i = 0; i < 4; i++) {
            hadjiexi[i] = false;
            urlanswer[i] = "";
        }
        isconti = true;
        qxdiv.innerHTML = '';
        ismatch(locationhref); //检测视频匹配, 开始寻找地址
    }

    //检测匹配(待完善)
    function ismatch(url) {
        if (url.match("http://v.youku.com/v_show/id")) {
            isconti = true;
            if (qingxidu < 1) //调整硕鼠解析时的清晰度
            {
                qingxidu = 1;
            }
            else if (qingxidu > 3) {
                qingxidu = 3;
            }
            address(qingxidu, url, flv)
        }
    }


    //未解析到视频抛出异常
    function throwerror(hd, phpadd) {
        if (hd == 3) {
            alert('没有解析到视频');
        }
    }

    // 暂停当前视频播放
    function pause() {
        if (CKobject.getObjectById('syplayer') != null) {
            CKobject.getObjectById('syplayer').ckplayer_pause();
        }
    }


    //字符转换  网络代码
    function base64_encode(e) {
        var t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            n, r, i, s, o, u, a, f, l = 0,
            c = 0,
            h = "",
            p = [];
        if (!e) return e;
        do n = e.charCodeAt(l++), r = e.charCodeAt(l++), i = e.charCodeAt(l++), f = n << 16 | r << 8 | i, s = f >> 18 & 63, o = f >> 12 & 63, u = f >> 6 & 63, a = f & 63, p[c++] = t.charAt(s) + t.charAt(o) + t.charAt(u) + t.charAt(a); while (l < e.length);
        h = p.join("");
        var d = e.length % 3;
        return (d ? h.slice(0, d - 3) : h) + "===".slice(d || 3)
    }

    //地址解析
    function address(hd, url, phpadd) {
        hadjiexi[hd] = true;
        if (phpadd == "ss") //硕鼠解析
        {
            if (hd == 3) {
                u = 'http://www.flvcd.com/parse.php?kw=' + encodeURIComponent(url);
            }
            else if (hd == 2) {
                u = 'http://www.flvcd.com/parse.php?format=high&kw=' + encodeURIComponent(url);
            }
            else if (hd == 1) {
                u = 'http://www.flvcd.com/parse.php?format=super&kw=' + encodeURIComponent(url)
            }


            GM_xmlhttpRequest({
                method: "GET",
                url: u,
                onload: function(jdata) {
                    for (var j = 1; j <= 3; j++) {
                        if (!hadjiexi[j]) {
                            hadjiexi[j] = true;
                            address(j, url, phpadd);
                        }
                    }

                    var data = jdata.responseText;


                    //解析时间过短造成未解析到视频
                    if (data.match(/两次解析间隔时间太短/)) {
                        address(hd, url, phpadd);
                        return;
                    }

                    //粤语
                    var yueyu = data.match(/<a href=(.*?)target="_blank"><font color="green">粤语版<\/font>/);
                    if (yueyu != null && !isgy) {
                        address(hd, yueyu[0].match(/http:\/\/(.*?)\.html/)[0], phpadd);
                        return;
                    }

                    var ur = data.match(/<input type="hidden" name="inf" value="(.*?)"\/>/);

                    if (ur != null) {
                        //判断解析到的是否为所要的清晰度
                        var matchstr = '<input type="hidden" name="filename" value="(.*?)' + (hd == 3 ? "\\/>" : qxdchoose[hd]);
                        if (data.match(new RegExp(matchstr, 'gi')) == null) {
                            log(matchstr);
                            return;
                        }
                        urlanswer[hd] = ur[1].replace(/\|$/gi, '').replace(/&/gi, '%26');
                        if (isconti) {
                            isconti = false;
                            // log(urlanswer[hd])
                            start(urlanswer[hd], 0);
                        }
                        showbutton(hd);
                    }
                    else {
                        throwerror(hd, phpadd);
                    }
                }
            });
        }
        else if (phpadd == "flv") {
            GM_xmlhttpRequest({
                method: "GET",
                url: parseflv + urlencode(url),
                onload: function(ret) {
                    var oVideos = JSON.parse(ret.responseText);
                    for (var i = 0; i < oVideos.length; i++) {
                        if (hadquality('M3U8', oVideos[i])) {
                            continue;
                        }
                        else {
                            add2urlanswer(oVideos[i]);
                        }
                    }
                    for (var i = 0; i < urlanswer.length; i++) {
                        if (urlanswer[i] != "") {
                            if (isconti && i >= qingxidu) {
                                start(urlanswer[i], 0);
                                isconti = false;
                            }
                            showbutton(i);
                        }
                    }
                },
                onerror: function(res) {
                    log('err');
                }
            });
        }
    }

    function add2urlanswer(oVideo) {
        for (var i = 0; i < qxdchoose.length; i++) {
            if (hadquality(qxdchoose[i], oVideo)) {
                if (urlanswer[i] == '') {
                    urlanswer[i] = urljoin(oVideo);
                }
                else if (hadquality('单段', oVideo)) {
                    urlanswer[i] = urljoin(oVideo);
                }
            }
        }
    }

    function hadquality(pattern, oVideo) {
        return (oVideo.quality.match(pattern));
    }

    function urljoin(oVideo) {
        var urlarr = [];
        for (var i = 0; i < oVideo.files.length; i++) {
            urlarr.push(oVideo.files[i].furl);
        }
        return urlarr.join('|');
    }


    //播放视频
    function start(u, ss) {
        log(u + "             " + ss)
        if (CKobject.getObjectById('syplayer') != null) {
            CKobject.getObjectById('syplayer').ckplayer_newaddress('{f->' + u + '}{s->' + ss + '}');
            return;
        }
        loadjs = document.createElement('script');
        loadjs.type = 'text/javascript';

        loadjs.innerHTML = "var flashvars={f:'" + u + "',c:0,v:80,e:0,s:'" + ss + "',p:1,g:'" + ptime + "'};var params={bgcolor:'#FFF',allowFullScreen:true,allowScriptAccess:'always'};CKobject.embedSWF('" + ckswf + "','" + playid + "','syplayer','100%','100%',flashvars,params);";
        document.getElementsByTagName('body')[0].appendChild(loadjs);
    }


    //显示悬浮按钮
    function showbutton(hd) {
        if (qxdiv.innerHTML == '') {
            qxdiv.innerHTML += '<button style="display:block;border:none;background:none;" onclick="document.getElementById(\'content_shang\').style.display=(document.getElementById(\'content_shang\').style.display == \'block\' ? \'none\' : \'block\')">设置</button>';
        }
        qxdiv.innerHTML += '<input type="button" onclick = "CKobject.getObjectById(\'syplayer\').newAddress(\'{s->0}{f->' + decodeURIComponent(urlanswer[hd]) + '}\');" value="' + qxdchoose[hd] + '" style="display:block;border:none;background:none;">';
    }


    function urlencode(uri) {
        uri = uri.replace(/^(http:\/\/[^\/]*(?:youku|tudou|ku6|yinyuetai|letv|sohu|youtube|iqiyi|facebook|vimeo|cutv|cctv|pptv))xia.com\//, '$1.com/');
        uri = uri.replace(/^(http:\/\/[^\/]*(?:bilibili|acfun|pps))xia\.tv\//, '$1.tv/');
        uri = uri.replace(/^(https?:)\/\//, '$1##');
        uri = btoa(uri); //IE10+
        uri = uri.replace('+', '-').replace('/', '_');
        return uri;
    };

    function log(str) {
        if (islog) {
            console.log(str);
        }
    }

    /* 
     * 150102		修正 设置按钮 显示位置不正确
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
})();
