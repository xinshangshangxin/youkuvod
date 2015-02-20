<?php 
	$content = $_SERVER['QUERY_STRING'];
	$url = 'http://api.flvxz.com/token/$_ENV["flvxz_token"]/url/'.$content.'/jsonp/prettyjson';
	echo file_get_contents($url);
?>