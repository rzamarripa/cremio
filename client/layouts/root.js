angular.module("creditoMio").controller("RootCtrl", ['$scope', '$meteor', '$reactive', function ($scope, $meteor, $reactive)
{
	let self = $reactive(this).attach($scope);
	self.buscarRoot = "";
	
	$(document).ready(function() {
	  $(".select2").select2();
	});
	
	self.subscribe('buscarRootClientes', () => {
		console.log(self.getReactively("buscarRoot"));
		if(self.getReactively("buscarRoot").length > 0){
			console.log(self.buscarRoot.nombre);
			return [{
		    options : { limit: 20 },
		    where : {
					nombreCompleto : self.getReactively('buscarRoot')
				}
	    }];
		}
  });
  
  self.helpers({
		clientesRoot : () => {
			return Meteor.users.find({
		  	"profile.nombreCompleto": { '$regex' : '.*' + self.getReactively('buscarRoot') || '' + '.*', '$options' : 'i' },
		  	roles : ["Cliente"]
			}, { sort : {"profile.nombreCompleto" : 1 }});
		},
	});
	
	self.isLoggedIn = function(){
	  return Meteor.user();
  }
  
  $scope.$watch('buscarRoot', function (newVal, oldVal) {
    if (oldVal == newVal) return;
    alert('here');
}, true);
  
}])