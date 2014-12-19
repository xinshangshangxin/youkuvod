(function() {
    // ==UserScript==
    // @name           youkuvod
    // @version        14.12.19.00
    // @description    硕鼠解析视频,ckplayer播放视频,去掉广告
    // @icon           http://i1.tietuku.com/f3f9084123926501.jpg
    // @include        http://v.youku.com/v_show/id*
    // @grant          GM_xmlhttpRequest
    // @auther         SHANG殇
    // @namespace 	   SHANG
    // ==/UserScript==


    //=============设置===============

    var qingxidu = 1;   //默认清晰度
					    // 1:  超清
					    // 2:  高清
					    // 3:  标清
    var isgy = false;   //默认是否为国语     
    				    //在港剧中可以选择粤语
    var which = 1;  /*     1:   京东云;  缺点:容易挂掉; 优点:速度不错,界面仿优酷
    					   2:   ckplayer官方版swf + git.oschina的js;
    			                缺点:不够美化; 优点:速度不错
    				       3:   host39; 缺点:速度慢; 优点:挂的概率小,界面仿优酷
    			    */
    //=============设置结束===============





	var flv = "ss"; // 解析服务器(只剩下 硕鼠了..........)
    //替换播放器界面
    // var ele = document.getElementById("player");
    // ele.style.background='url(http://q2234037172.host39.com/vod/images/lgz.gif) no-repeat center center rgb(0,0,0)';
    // var yuanhtml=ele.innerHTML;


    //全局变量
    var u; //播放地址
    var urlanswer = new Array(4); //清晰度解析地址
    var isconti = true; //播放环境
    var hadjiexi = new Array(4); //是否解析过
    var playid = "player"; //播放替换的 id
    var ptime = 0;

     // 京东服务器 容易挂
    var ckjs = 'http://youkuvod.jd-app.com/ckplayer/ckplayer.js';
    var ckswf = 'http://youkuvod.jd-app.com/ckplayer/ckplayer.swf';

    if (which == 2) {
    	//官方原版   不够美化
    	ckswf = 'http://www.ckplayer.com/ckplayer/6.6/ckplayer.swf';
    	ckjs  = 'http://git.oschina.net/q2234037172/youkuvod/raw/master/ckplayer.js';
    }
    else if (which == 3) {
    	// host39   速度慢
    	ckjs = 'http://q2234037172.host39.com/youkuvod/ckplayer/ckplayer.js';
    	ckswf = 'http://q2234037172.host39.com/youkuvod/ckplayer/ckplayer.swf';
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
        },
        onerror: function(res) {
        	alert("服务器挂了... 进设置换个服务器吧....");
        }
    });

    //清晰度显示 侧边栏
    var qxdiv = document.createElement('div');
    qxdiv.style.cssText = "position:fixed; z-index:999; top:45%; background:white;left:0px; border:3px solid rgb(221,221,221); padding:2px; border-radius:5px;overflow:hidden";
    qxdiv.innerHTML = "";
    document.getElementsByTagName('body')[0].appendChild(qxdiv);

    setTimeout(function() {
        qxdiv.style.width = "0";
    }, 5000);


    qxdiv.onmouseover = function() {
        qxdiv.style.width = "";
    }

    qxdiv.onmouseout = function() {
        qxdiv.style.width = "0";
    }



    // 其他信息显示 顶部栏
    /*
     var infodiv = document.createElement('div');
     infodiv.id = "info";
     $(document).ready(function() 
     {
         document.getElementsByClassName('s_main layout_121')[0].appendChild(infodiv);
         
         showbutton(3);
     });
*/
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
                        //判断解析到的是否为标清
                        if (hd == 1 && data.match(/<input type="hidden" name="filename" value="(.*?)超清版]"\/>/) == null || hd == 2 && data.match(/<input type="hidden" name="filename" value="(.*?)高清版]"\/>/) == null) {
                            return;
                        }

                        urlanswer[hd] = ur[1].replace(/\|$/gi, '').replace(/&/gi, '%26');
                        showbutton(hd);
                        if (isconti) {
                            isconti = false;
                            // console.log(urlanswer[hd])
                            start(urlanswer[hd], 0);
                        }
                    }
                    else {
                        throwerror(hd, phpadd);
                    }
                }
            });
        }
    }

    //播放视频

    function start(u, ss) {
        // console.log(u + "             " + ss)
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
        if (hd == 1) {
            qxdiv.innerHTML += '<input type="button" onclick = "CKobject.getObjectById(\'syplayer\').newAddress(\'{s->0}{f->' + decodeURIComponent(urlanswer[1]) + '}\');" value="超清" style="display:block;border:none;background:none;">';
            //console.log(qxdiv.innerHTML)
        }
        else if (hd == 2) {
            qxdiv.innerHTML += '<input type="button"  onclick = "CKobject.getObjectById(\'syplayer\').newAddress(\'{p->1}{f->' + decodeURIComponent(urlanswer[2]) + '}\');" value="高清" style="display:block;border:none;background:none;">';
        }
        else if (hd == 3) {
            qxdiv.innerHTML += '<input type="button"  onclick = "CKobject.getObjectById(\'syplayer\').newAddress(\'{f->' + decodeURIComponent(urlanswer[3]) + '}\');" value="标清" style="display:block;border:none;background:none;">';
        }

    }

    /* 
     * 141219       添加服务器切换设置, 添加服务器挂掉弹窗,移动至github
     * 141217	    清晰度选择恢复
     * 141216	    更新ckplayer; 暂时去除 清晰度选择(现在只可以选择默认清晰度)
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

    /*      注意事项:
     *              1, 业余作品, 如有不爽, 请勿乱喷, 欢迎指正
     *              2, 拖动存在问题(因为视频是分割的);还没想到解决方法
     *              3, 飞驴解析待定
     **/
})();
