angular.module("creditoMio")
  .controller("verCajaInactivaCtrl", verCajaInactivaCtrl);

function verCajaInactivaCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr) {
	let rc = $reactive(this).attach($scope);
  window.rc = rc;
  
  
  
  this.caja_id = $stateParams.caja_id;
  
  this.caja = { _id: 0 };
  
  this.pagos_id = [];
  this.cajasInactivas = [];
  this.fechaInicio = "";
  this.fechaFin = "";
  this.totalResumen = 0;
  this.nuevoTraspaso = { tipo: 'desde_cuenta' }
  this.subscribe('cajas', () => {
    return [{ _id: $stateParams.caja_id }]
  });
  this.subscribe('tiposIngreso', () => {
    return [{estatus: true}]
  });
  this.subscribe('allCajeros', () => {
    return [{}]
  });

  this.subscribe('cuentas', () => {
    return [{}]
  });
 
 
  this.subscribe('cortesCaja', () => {
    return [{_id: $stateParams.corteCaja_id}]
  });
  
/*
  this.subscribe('traspasos', () => {
    return [{
      $or: [
        { origen_id: this.getReactively('caja._id') },
        { destino_id: this.getReactively('caja._id') }
      ],
      createdAt: {$gte: this.getReactively('caja.ultimaApertura')},
      sucursal_id: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : ""
    }];
  });
*/
  this.subscribe('pagos', () => {
    return [{ _id: { $in: this.getReactively('pagos_id') } }]
  });
  this.subscribe('movimientosCaja', () => {
    return [{_id: $stateParams.movimientosCaja_id}]
  });
  
  
  this.helpers({
    caja: () => {
      var caj = Cajas.findOne({ _id: $stateParams.caja_id });      
      if(caj != undefined){

	    	var corte = CortesCaja.findOne({_id:$stateParams.corteCaja_id});
		    if (corte != undefined)
		    {  
			    this.fechaFinal = corte.createdAt;
			    var mc = MovimientosCajas.findOne({_id: $stateParams.movimientosCaja_id});
			    if (mc != undefined)
			    {
				    	this.fechaInicio = mc.createdAt
				      Meteor.apply('getCajaInactivaDetalle', [caj._id, mc.createdAt, corte.createdAt], function(err, result) {
					      if (result)
					      {
						      console.log(result);
					        rc.cajaInactiva = result;
					        $scope.$apply();
					      }  
							});
					}		
				}
      }
      return caj
    },
    cortesCaja: () => {
      var corte = CortesCaja.find().fetch();
      return corte;
    },
    cuentas: () => {
      var cuentas = Cuentas.find().fetch();
      _.each(cuentas, function(cuenta) {
        cuenta.tipoIngreso = TiposIngreso.findOne(cuenta.tipoIngreso_id);
      });
      return cuentas
    },
    resumen : () => {
      var agrupados = {};
      var total = 0;
      var movs = MovimientosCajas.find().fetch();
      if (movs.length) {
        _.each(movs, function(mov) {
          mov.tipoIngreso = rc.tiposIngreso[mov.cuenta_id].nombre;
          if (agrupados[mov.tipoIngreso] == undefined) {
            agrupados[mov.tipoIngreso] = 0;
          }
          agrupados[mov.tipoIngreso] += mov.monto;
          total += mov.monto;
        });
      }
      rc.totalResumen = total;
      return agrupados;
    },
    tiposIngreso: () => {
      var obj = {};
      var tiposIngreso = TiposIngreso.find().fetch();
      _.each(tiposIngreso, function(ti) {
        obj[ti._id] = ti;
      });
      return obj;
    },
    cajeros: () => {
      return Meteor.users.find({ roles: ["Cajero"] });
    },
    movimientosCaja: () => {
      var ret = [];
      if (rc.getReactively('caja._id')) {
        var movimientos = MovimientosCajas.find({
        $or: [
	        { tipoMovimiento: 'Saldo Inicial'},
          { tipoMovimiento: 'Pago' },
          { tipoMovimiento: 'Retiro' },
          { tipoMovimiento: 'Cancelación'}
        ]
      },).fetch();
      	
        var cj = Cajas.findOne(rc.caja._id);
        var pagos_id = [];
        _.each(movimientos, function(mov) {
	        //console.log(mov);
          var d = {};
          
          if (mov.origen == "Pago de Cliente") {
            	pagos_id.push(mov.origen_id);
							var p = Pagos.findOne(mov.origen_id);
							if (p != undefined)
							{
								Meteor.apply('getUsuario', [p.usuario_id], function(err, result) {
						      if (err) {
						        toastr.warning('Error al consultar los datos');
						      } else {
						        var u = result;
						        d.numeroCliente = u.numeroCliente;
										d.nombreCliente = u.nombreCompleto;
										$scope.$apply();
						      }
						    });
							}
          }
          
          if (mov.origen == "Entrega de Credito") {
         
	          	Meteor.apply('getCredito', [mov.origen_id], function(err, result) {
						      if (err) {
						        toastr.warning('Error al consultar los datos');
						      } else {
						        var credito = result;
						        if (credito != undefined)
										{
							        Meteor.apply('getUsuario', [credito.cliente_id], function(err, result) {
									      if (err) {
									        toastr.warning('Error al consultar los datos');
									      } else {
									        var u = result;
									        d.numeroCliente = u.numeroCliente;
													d.nombreCliente = u.nombreCompleto;
													$scope.$apply();
									      }
									    });
									  }  
						      }
						  });	
	          
	        } 
          
          d.createdAt = mov.createdAt;
          d.tipoMovimiento = mov.tipoMovimiento;
          d.origen = mov.origen;
                    
          c = Cuentas.findOne(cj.cuenta[mov.cuenta_id].cuenta_id);
         
          if (c) {
            d.cuenta = c.nombre;
          }
          d.monto = mov.monto;
          d.pago = Pagos.findOne(mov.origen_id);
          //d.pago_id = mov.origen_id;
          if (d.pago) {
            d.multas = 0;
            d.capital = 0;
            d.intereses = 0;
            d.iva = 0;
            d.seguro = 0;

            if (d.pago.tipoIngreso_id != undefined)
              d.tipoIngreso = TiposIngreso.findOne(d.pago.tipoIngreso_id);

            _.each(d.pago.planPagos, function(plan) {
              if (plan.descripcion == "Cargo Moratorio") {
                d.multas += plan.totalPago;
              }
              d.capital += plan.pagoCapital;
              d.intereses += plan.pagoInteres;
              d.iva += plan.pagoIva;
              d.seguro += plan.pagoSeguro;
            });
          }
          ret.push(d)
        });
        rc.pagos_id = pagos_id;
      }
			
      return ret
    },
    /*
traspasos: () => {
      var traspasos = Traspasos.find({}, { order: { createdAt: -1 } }).fetch();
      _.each(traspasos, function(traspaso) {
        if (traspaso.tipo == "CuentaCaja") {
          traspaso.origen = Cuentas.findOne(traspaso.origen_id);
          traspaso.destino = Cajas.findOne(traspaso.destino_id);
        } else if (traspaso.tipo == "CajaCaja") {
          traspaso.origen = Cajas.findOne(traspaso.origen_id);
          traspaso.destino = Cajas.findOne(traspaso.destino_id);
        } else {
          traspaso.origen = Cajas.findOne(traspaso.origen_id);
          traspaso.destino = Cuentas.findOne(traspaso.destino_id);
        }
      });
      return traspasos
    }
*/
  });
   
	this.getCajero = (objeto) => {
		if (objeto != undefined)
		{
    	  c = Meteor.users.findOne(objeto.usuario_id);
		    if (c != undefined)
		      return c.profile.nombreCompleto;
		}     
    return "";
  }

  this.detalle = function(_id) {
    rc.detalleOrigenDestino = _.findWhere(rc.cajas, {_id: _id}) || _.findWhere(rc.cuentas, {_id: _id});
  };

  this.getHistorialCajas = function(fechaInicio, fechaFin) {
    fechaInicio = moment(fechaInicio).startOf('day').toDate();
    fechaFin = moment(fechaFin).endOf('day').toDate();
    Meteor.apply('getHistorialCajas', [fechaInicio, fechaFin, Meteor.user().profile.sucursal_id], function(err, result) {
      if (err) {
        toastr.warning('Error al consultar los datos');
      } else {
        rc.cajasInactivas = result;
        $scope.$apply();
      }
    });
  };

   

}