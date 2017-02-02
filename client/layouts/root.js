angular.module("creditoMio").controller("RootCtrl", ['$scope', '$meteor', function ($scope, $meteor)
{

  isLoggedIn = function(){
	  return Meteor.user();
  }
}]);