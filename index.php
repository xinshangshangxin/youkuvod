<?php 
	$content = $_SERVER['QUERY_STRING'];
	$url = 'http://api.flvxz.com/token/4d9ff1b1446e3b786822fd84638603e0/url/'.$content.'/jsonp/prettyjson';
	echo file_get_contents($url);
?>