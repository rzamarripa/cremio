angular.module("creditoMio")
  .controller("PanelAsignaSucursalSolicitudesCD", PanelAsignaSucursalSolicitudesCD);
function PanelAsignaSucursalSolicitudesCD($scope, $meteor, $reactive, $state, toastr) {

  let rc = $reactive(this).attach($scope);
  window.rc = rc;

  rc.asignaSucursal_id = "";

  this.subscribe('solicitudesClientes', () => {
    return [{ "profile.estatus": 1 }];
  })

  this.subscribe('solicitudesDistribuidores', () => {
    return [{ "profile.estatus": 1 }];
  })


  this.helpers({

    arreglo: () => {
      var arreglo = [];
      var clientes = SolicitudesClientes.find({ "profile.estatus": 1 }, { sort: { "profile.fechaSolicito": -1 } }).fetch();
      _.each(clientes, function (c) {
        c.profile.tipo = "Cliente Crédito Personal";
        arreglo.push(c);
      })
      var distribuidores = SolicitudesDistribuidores.find({ "profile.estatus": 1 }, { sort: { "profile.fechaSolicito": -1 } }).fetch();
      _.each(distribuidores, function (c) {
        c.profile.tipo = "Distribuidor";
        arreglo.push(c);
      })
      return arreglo;
    },
    sucursales: () => {
      return Sucursales.find();
    },
  });


  this.mostrarAsignarSucursal = function (objeto) {
    rc.objeto = objeto;
    $("#modalAsignarSucursal").modal();
  };

  this.asignarSucursal = function (form) {

    if (form.$invalid) {
      toastr.error('Error al rechazar.');
      return;
    }

    Meteor.call('asignaSucursalSolicitud', rc.objeto._id, rc.asignaSucursal_id, rc.objeto.profile.tipo, function (error, result) {
      if (result) {
        if (result)
          toastr.success("Solicitud Asignada");
        else
          toastr.danger("Error al asignar la Solicitud");

        $scope.$apply();
      }
    });

    rc.objeto = {};

    $('#modalAsignarSucursal').modal('hide');

  }




};