window.downloadFile = function(params) {
  if(!params || !params.uri || !params.nombre){
    console.log('err');
  }else{
    var link = document.createElement("a");
    link.download = params.nombre;
    link.href = params.uri;
    link.click();
  }
}