// ==UserScript==
// @name         flvcdNoAd
// @namespace    ishang
// @version      0.3
// @description  硕鼠解析页面自动跳过广告
// @author       ishang
// @match        http://www.flvcd.com/*
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';


var youkuUrl = getParameterByName('kw');
// 非解析页面
if(!youkuUrl) {
  return;
}

var html = document.documentElement.innerHTML;
// 解析成功
var isParsed = /下载地址：/.test(html);
if(isParsed) {
  return;
}
// 已经解析, 但解析失败
if(getCookie('youkuUrl')) {
  return;
}

// 设置为已经解析过了,不再进行解析
setCookie('youkuUrl', youkuUrl);

var key = ((html.match(/\='\w{32,32}'\;/) || [])[0] || '').replace('=\'', '').replace('\';', '');
var time = ((html.match(/\=\d{13,13}/) || [])[0] || '').replace('=', '');
var b = ((html.match(/\|\w{32,32}\|/) || [])[0] || '').replace(/\|/g, '');

parseCookie(key, time, b);

function parseCookie(key, time, b) {
  function createSc(a, t) {
    t = Math.floor(t / (600 * 1000));
    var ret = '';
    for(var i = 0; i < a.length; i++) {
      var j = a.charCodeAt(i) ^ b.charCodeAt(i) ^ t;
      j = j % 'z'.charCodeAt(0);
      var c;
      if(j < '0'.charCodeAt(0)) {
        c = String.fromCharCode('0'.charCodeAt(0) + j % 9);
      }
      else if(j >= '0'.charCodeAt(0) && j <= '9'.charCodeAt(0)) {
        c = String.fromCharCode(j);
      }
      else if(j > '9'.charCodeAt(0) && j < 'A'.charCodeAt(0)) {
        c = '9';
      }
      else if(j >= 'A'.charCodeAt(0) && j <= 'Z'.charCodeAt(0)) {
        c = String.fromCharCode(j);
      }
      else if(j > 'Z'.charCodeAt(0) && j < 'a'.charCodeAt(0)) {
        c = 'Z';
      }
      else if(j >= 'z'.charCodeAt(0) && j <= 'z'.charCodeAt(0)) {
        c = String.fromCharCode(j);
      }
      else {
        c = 'z';
      }
      ret += c;
    }
    return ret;
  }


  var g = createSc(key, time);
  var date = new Date();
  date.setTime(date.getTime() + 300 * 1000);
  document.cookie = 'go=' + g + ';expires=' + date.toGMTString();
  document.cookie = 'avdGggggtt=' + time + ';expires=' + date.toGMTString();

  window.setTimeout(function() {
    window.location.reload();
  }, 16);
}


function getParameterByName(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
    results = regex.exec(window.location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function getCookie(name) {
  var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
  if(arr = document.cookie.match(reg)) {
    return decodeURIComponent(arr[2]);
  }
  else {
    return null;
  }
}

function setCookie(name, value) {
  var date = new Date();
  date.setTime(date.getTime() + 300 * 1000);
  document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + date.toGMTString();
}
