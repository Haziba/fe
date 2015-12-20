function statusChangeCallback(response) {
	if (response.status === 'connected') {
		FB.api('/me', function(response) {
			window.bus.pub('player init', {name: response.name, id: response.id});
		});
	} else if (response.status === 'not_authorized') {
		document.getElementById('status').innerHTML = 'Please log into this app.';
	} else {
		document.getElementById('status').innerHTML = 'Please log into Facebook.';
	}
}

function checkLoginState() {
	FB.getLoginStatus(function(response) {
		statusChangeCallback(response);
	});
}
window.fbAsyncInit = function() {
	FB.init({
		appId      : '951320921624338',
		xfbml      : true,
		version    : 'v2.5'
	});
	
	FB.getLoginStatus(function(response) {
		statusChangeCallback(response);
	});
};

(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));