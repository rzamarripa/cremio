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
/*
				console.log(Meteor.userId());
				console.log(Meteor.user());

*/
        //$state.go('root.home');
        if (Meteor.user().username == "admin")
           $state.go('root.home'); 
	      if (Meteor.user().roles[0] == "Verificador")
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