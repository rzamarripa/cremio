angular
  .module("creditoMio")
  .controller("TicketComisionPromotoraCtrl", TicketComisionPromotoraCtrl);
function TicketComisionPromotoraCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr) {

  let rc = $reactive(this).attach($scope);
  window.rc = rc;

  rc.pago = {};
  rc.caja = {};
  rc.cliente = {};
  rc.credito = {};
  rc.sucursal = {};
  rc.cajero = {};
  rc.tipoIngreso = {};
  rc.sucursal = {};

  this.subscribe('tiposIngreso', () => {
    return [{}]
  });

  this.subscribe('pagos', () => {
    return [{
      _id: $stateParams.pago_id
    }]
  },
    {
      onReady: function () {
        rc.pago = Pagos.findOne($stateParams.pago_id);
        rc.tipoIngreso = TiposIngreso.findOne(rc.pago.tipoIngreso_id);
        rc.pago = rc.pago ? rc.pago : {};

        Meteor.call('datosCliente', rc.pago.usuario_id, function (err, res) {
          rc.cliente = res;
        });

        var valores = (rc.pago.totalPago).toString().split('.');
        // console.log(valores);
        // console.log(valores[0]);
        // console.log(valores[1]);

        rc.pago.centavos = valores[1] == undefined ? "00" : valores[1];

        rc.pago.letra = NumeroALetras(valores[0]).trim();

        _.each(rc.pago.creditos, function (c) {

          Meteor.call('getCredito', c.id, function (err, res) {
            if (res) {

              c.credito = res;
              c.tipo = res.tipo == "vale" ? "Vale" : res.tipo == "creditoP" ? "Crédito Personal" : "";
              c.fechaEntrega = res.fechaEntrega;

              Meteor.call('datosCliente', res.cliente_id, function (err, res) {
                c.numeroCliente = res.profile.numeroCliente;
                $scope.$apply();
              });

              //$scope.$apply();
            }
          });

        });

        rc.subscribe('cajas', () => {
          return [{
            _id: rc.pago.caja_id ? rc.pago.caja_id : ""
          }]
        },
          {
            onReady: function () {
              rc.caja = Cajas.findOne(rc.pago.caja_id);
              rc.caja = rc.caja ? rc.caja : {};
            }
          });
        rc.subscribe('cajeroId', () => {
          return [{
            id: rc.pago.usuarioCobro_id ? rc.pago.usuarioCobro_id : ""
          }]
        },
          {
            onReady: () => {
              rc.cajero = Meteor.users.findOne(rc.pago.usuarioCobro_id);
              rc.cajero = rc.cajero ? rc.cajero : {};
            }
          });
        rc.subscribe('sucursales', () => {
          return [{
            _id: rc.pago.sucursalPago_id
          }]
        },
          {
            onReady: () => {
              rc.sucursal = Sucursales.findOne(rc.pago.sucursalPago_id);
              rc.sucursal = rc.sucursal ? rc.sucursal : {};
            }
          });
      }
    });

  this.borrarBotonImprimir = function () {
    var printButton = document.getElementById("printpagebutton");
    printButton.style.visibility = 'hidden';
    window.print()
    printButton.style.visibility = 'visible';
  };





};