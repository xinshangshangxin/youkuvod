// ==UserScript==
// @name         flvcdNoAd
// @namespace    ishang
// @version      0.1
// @description  硕鼠解析页面自动跳过广告
// @author       ishang
// @match        http://www.flvcd.com/*
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';

var html = document.documentElement.innerHTML;

var isParsed = /<input type="hidden" name="inf" value="/.test(html);
if(isParsed) {
  return;
}

var key = ((html.match(/\='\w{32,32}'\;/) || [])[0] || '').replace('=\'', '').replace('\';', '');
var time = ((html.match(/\=\d{13,13}/) || [])[0] || '').replace('=', '');

parseCookie(key, time);

function parseCookie(key, time) {
  function createSc(a, t) {
    var b = '24227945943216730751837054267565';
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
