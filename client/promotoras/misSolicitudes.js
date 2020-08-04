angular.module("creditoMio")
  .controller("MisSolicitudesCtrl", MisSolicitudesCtrl);
function MisSolicitudesCtrl($scope, $meteor, $reactive, $state, toastr) {

  let rc = $reactive(this).attach($scope);
  window.rc = rc;

  rc.numeroPagina = 0;
  rc.avance = 100;
  rc.arreglo = [];

  rc.tipoSolicitud = "creditoPersonal";

  this.subscribe('solicitudesClientes', () => {
    return [{ "profile.usuario_id": Meteor.userId() }];
  })

  this.subscribe('solicitudesDistribuidores', () => {
    return [{ "profile.usuario_id": Meteor.userId() }];
  })


  this.helpers({

    arreglo: () => {
      var arreglo = [];
      var clientes = SolicitudesClientes.find({ "profile.usuario_id": Meteor.userId() }, { sort: { "profile.fechaCreacion": 1 } }).map(function (c) {
        c.profile.tipo = "Cliente Crédito Personal";
        arreglo.push(c);
        return c;
      });
      var distribuidores = SolicitudesDistribuidores.find({ "profile.usuario_id": Meteor.userId() }, { sort: { "profile.fechaCreacion": 1 } }).map(function (c) {
        c.profile.tipo = "Distribuidor";
        arreglo.push(c);
        return c;
      });

      arreglo.sort(function (a, b) {
        if (a.profile.fechaCreacion.getTime() < b.profile.fechaCreacion.getTime()) {
          return 1;
        }
        if (a.profile.fechaCreacion.getTime() > b.profile.fechaCreacion.getTime()) {
          return -1;
        }
        return 0;
      });

      return arreglo;
    },

  });

  //Paginador/////////// Funciones genericas
  this.izq = function (arreglo) {
    if (rc.numeroPagina > 0) {
      rc.numeroPagina -= rc.avance;
      //revisar para recorrer
      var elementoPaginador = arreglo.find(x => x.avance == rc.numeroPagina);
      if (elementoPaginador == undefined) {
        _.each(arreglo, function (elemento) {
          if (elemento.numero != "...") {
            elemento.numero--;
            elemento.avance -= rc.avance;
            elemento.estaActivo = false;
          }
        });
      }
      this.ActivarFlechas(rc.numeroPagina, rc.numeroPagina + rc.avance, arreglo);
    }
  }

  this.der = function (tabla, arreglo) {
    if (tabla.length > 0 && tabla.length == rc.avance) {
      rc.numeroPagina += rc.avance;

      //revisar para recorrer
      var elementoPaginador = arreglo.find(x => x.avance == rc.numeroPagina);
      if (elementoPaginador == undefined) {
        _.each(arreglo, function (elemento) {
          if (elemento.numero != "...") {
            elemento.numero++;
            elemento.avance += rc.avance;
            elemento.estaActivo = false;
          }
        });
      }

      this.ActivarFlechas(rc.numeroPagina, rc.numeroPagina - rc.avance, arreglo);
    }
  }

  this.activarPorNumero = function (item, arreglo) {

    if (item.numero != "...") {
      var elementoPaginador = arreglo.find(x => x.estaActivo == true);
      elementoPaginador.estaActivo = false;

      var elemento = arreglo.find(x => x.numero == item.numero);
      elemento.estaActivo = true;
      rc.numeroPagina = item.avance;
    }
  }

  this.ActivarFlechas = function (actual, anterior, arreglo) {
    var elementoPaginador = arreglo.find(x => x.avance == anterior);
    elementoPaginador.estaActivo = false;

    var elemento = arreglo.find(x => x.avance == actual);
    elemento.estaActivo = true;
  }

  rc.inicializaElementoActivoPaginador = function (arreglo) {
    if (arreglo.length > 0)
      arreglo[0].estaActivo = true;
  }

  //////////////////////////////////////////////////////

  ///Solo esta se especifica para cagar el arreglo de la tabla
  rc.cargarArregloPaginador = function () {
    Meteor.call('getTotalesRegistrosSolicitudesPromotoras', rc.avance, function (error, result) {
      if (result) {
        rc.arreglo = arregloPaginador(rc.avance, result);
        rc.inicializaElementoActivoPaginador(rc.arreglo);
        $scope.$apply();
      }
    });
  }

  $(document).ready(function () {
    rc.cargarArregloPaginador();
  });


};