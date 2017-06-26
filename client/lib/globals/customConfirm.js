//Primer parametro es el mensaje
//Segundo parametro es opcional
//Segundo parametro es un objeto con los atributos si y no para el texto del boton default: {si:'Si',no:'No'}
//Ultima funcion es un callback con lo que se va a ejecutar en caso de que se confirme la acción
window.customConfirm = function(message, buttons, resultCallback) {
  $("body").append('<div id="customConfirm" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" data-keyboard="false" data-backdrop="static"><div class="modal-dialog modal-md" role="document"><div class="modal-content"><div id="customConfirm_message" class="modal-body"></div><div class="modal-footer"><button id="customConfirm_false" type="button" class="btn btn-danger" data-dismiss="modal">No</button><button id="customConfirm_true" type="button" class="btn btn-primary">Si</button></div></div></div></div>');
  if(_.isFunction(message) || _.isObject(message)){
  	if(_.isFunction(buttons)){
  		resultCallback = buttons;
  	}
  	buttons = message;
  	message = 'Estás seguro';
  };
  
  if (!_.isFunction(buttons)) {
    if (_.isObject(buttons)) {
      if (buttons.si) {
        $("#customConfirm_true").html(buttons.si);
      }
      if (buttons.no) {
        $("#customConfirm_false").html(buttons.no);
      }
    }
  } else {
    resultCallback = buttons;
  }

  $('#customConfirm_message').html('<h3>' + message + '</h3>');
  $('#customConfirm').modal('show');

  $("#customConfirm_true").bind('click', function() {
    $('#customConfirm').modal('toggle');
    $("#customConfirm_true").unbind("click");
    $("#customConfirm_false").unbind("click");
    resultCallback();
  });

  $("#customConfirm_false").bind('click', function() {
    $('#customConfirm').modal('toggle');
    $("#customConfirm_false").unbind("click");
    $("#customConfirm_true").unbind("click");
  });
}
