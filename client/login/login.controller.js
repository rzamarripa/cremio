angular.module('creditoMio').controller('LoginCtrl', ['$injector', function ($injector) {
  var $meteor = $injector.get('$meteor');
  var $state 	= $injector.get('$state');
  var toastr 	= $injector.get('toastr');

  this.credentials = {
    username: '',
    password: ''
  };

  this.login = function () {
    $meteor.loginWithPassword(this.credentials.username, this.credentials.password).then(
      function () {
	      toastr.success("Bienvenido al Sistema");

        //if (Meteor.user().username == "admin" || Meteor.user().roles[0] == "Cajero" || Meteor.user().roles[0] == "Gerente" || Meteor.user().roles[0] == "Supervisor")
        if (Meteor.user().roles == "admin") {
            $state.go('root.home');    
        }
	      if (Meteor.user().roles == "Verificador")
        	 $state.go('root.panelVerificador');      
        else
        	 $state.go('root.home'); 	   
      },
      function (error) {
        toastr.error(error.reason);
      }
    )
  }
}]);