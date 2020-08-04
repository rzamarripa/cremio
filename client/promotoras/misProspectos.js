angular.module("creditoMio")
  .controller("MisProspectosCtrl", MisProspectosCtrl);
function MisProspectosCtrl($scope, $meteor, $reactive, $state, toastr) {

  let rc = $reactive(this).attach($scope);
  window.rc = rc;

  rc.tipoSolicitud = "creditoPersonal";

  this.subscribe('prospectosCreditoPersonalComposite', () => {
    return [{
      "profile.promotora_id": Meteor.userId() 
    }];
  });

  this.subscribe('prospectosDistribuidorComposite', () => {
    return [{
      "profile.promotora_id": Meteor.userId() 
    }];
  });

  this.helpers({
    arreglo: () => {
      var prospectos = [];

      var prospectosCreditoPersonal = ProspectosCreditoPersonal.find({ "profile.promotora_id": Meteor.userId() }).map(function (p) {
        if (p.profile.origen != 'Internet') {
          Meteor.call('getUsuario', p.profile.usuarioCreacion, function (error, result) {
            if (result) {
              p.profile.nombreUsuario = result.nombre;
              prospectos.push(p);
              $scope.$apply()
            }
          });
        }
        else {
          p.profile.nombreUsuario = "Internet";
          prospectos.push(p);
          if (!$scope.$$phase) {
            $scope.$apply()
          }
        }

      });


      var prospectosDistribuidor = ProspectosDistribuidor.find({ "profile.promotora_id": Meteor.userId()  }).map(function (p) {
        if (p.profile.origen != 'Internet') {
          Meteor.call('getUsuario', p.profile.usuarioCreacion, function (error, result) {
            if (result) {
              p.profile.nombreUsuario = result.nombre;
              prospectos.push(p);
              $scope.$apply()
            }
          });
        }
        else {
          p.profile.nombreUsuario = "Internet";
          prospectos.push(p);
          if (!$scope.$$phase) {
            $scope.$apply()
          }

        }

      });

      prospectos.sort(function (a, b) {
        if (a.profile.fechaCreacion.getTime() < b.profile.fechaCreacion.getTime()) {
          return 1;
        }
        if (a.profile.fechaCreacion.getTime() > b.profile.fechaCreacion.getTime()) {
          return -1;
        }
        return 0;
      });

      return prospectos;
    }
  });

  

};