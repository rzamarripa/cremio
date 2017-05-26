window.customConfirm  = function(message, buttons, resultCallback){
  $('#confirm').modal('show');
  $('#confirm_message').html('<h3>'+message+'</h3>');
  
  if(!_.isFunction(buttons)){
  	if(_.isObject(buttons)){
  		if(buttons.si){
  			$( "#simio").html(buttons.si);
  		}
  		if(buttons.no){
  			$( "#nelson").html(buttons.no);
  		}
  	}
  }

  $( "#simio" ).bind('click', function() {
  	$('#confirm').modal('toggle');
    $( "#simio").unbind( "click" );
    $( "#nelson").unbind( "click" );
	  resultCallback();
	});
  
  $( "#nelson" ).bind('click', function() {
     $('#confirm').modal('toggle');
     $( "#nelson").unbind( "click" );
     $( "#simio").unbind( "click" );
  });
}