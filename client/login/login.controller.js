angular.module('creditoMio').controller('LoginCtrl', ['$injector', function ($injector) {
  var $meteor = $injector.get('$meteor');
  var $state 	= $injector.get('$state');
  var toastr 	= $injector.get('toastr');
  var sucursal = ""


  this.credentials = {
    username: '',
    password: ''
  };

  this.login = function () {
    $meteor.loginWithPassword(this.credentials.username, this.credentials.password).then(
      function () {
        if (Meteor.user().username != "admin") {
          Meteor.call("getHorario", Meteor.user().profile.sucursal_id,  function(error,result){
            if(error){
              toastr.error('Error en el servidor');
              $state.go('anon.logout');
            }
            if (result){
              toastr.success("Bienvenido al Sistema");
              if (Meteor.user().roles == "Verificador")
              {
                $state.go('root.panelVerificador'); 
              }else{
                $state.go('root.home'); 
              }
            }else{
              toastr.error("No puedes entrar en este horario");
              $state.go('anon.logout');
            }
          });
        }
        else{
          toastr.success("Bienvenido al Sistema");
          $state.go('root.home');
        }

      
	      if (Meteor.user().roles == "Verificador")
        	 $state.go('root.panelVerificador');      
      	   
      },
      function (error) {
        toastr.error(error.reason);
      }
    )
  }
}]);