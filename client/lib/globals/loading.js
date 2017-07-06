window.loading = function(val, milisec){
	if(!milisec){
		milisec = 300;
	}
  if(val){
    if(!window.loadingInterval){
    	$("[type=button]").attr("disabled", true);
    	$("body").css("cursor", "progress");
      window.loadingInterval = setInterval(function(){NProgress.inc()}, milisec);
    }
  }else{
    clearInterval(window.loadingInterval);
    delete window.loadingInterval;
    $("[type=button]").attr("disabled", false);
    $("body").css("cursor", "default");
    NProgress.done();
  }
};