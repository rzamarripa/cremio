angular.module("creditoMio")
  .controller("CajasActivasCtrl", CajasActivasCtrl);

function CajasActivasCtrl($scope, $meteor, $reactive, $state, toastr) {

  let rc = $reactive(this).attach($scope);
  window.rc = rc;
  this.action = true;
  this.nuevo = true;
  this.objeto = {};
  this.buscar = {};
  this.caja = { _id: 0 };
  this.pagos_id = [];
  this.cajasInactivas = [];
  this.fechaInicio = moment().subtract(1, 'month').startOf('month').toDate();
  this.fechaFin = moment().subtract(1, 'month').endOf('month').toDate();
  this.totalResumen = 0;
  this.nuevoTraspaso = { tipo: 'desde_cuenta' }
  this.subscribe('cajas', () => {
    return [{ sucursal_id: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "" }]
  });
  this.subscribe('tiposIngreso', () => {
    return [{}]
  });
  this.subscribe('allCajeros', () => {
    return [{}]
  });
  this.subscribe('cuentas', () => {
    return [{}]
  });
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

  this.subscribe('pagos', () => {
    return [{ _id: { $in: this.getReactively('pagos_id') } }]
  });

  this.subscribe('movimientosCaja', () => {
    return [{caja_id: this.getReactively('caja._id'), createdAt: {$gte: this.getReactively('caja.ultimaApertura')} }]
  });

  this.helpers({
    cajas: () => {
      var cajas = Cajas.find({ estadoCaja: "Abierta" }).fetch();
      _.each(cajas, function(caja) {
        _.each(caja.cuenta, function(c, key) {
          if (c.cuenta_id) {
            c.cuenta = Cuentas.findOne(c.cuenta_id);
          }
          c.tipoIngreso = TiposIngreso.findOne(key);
        });
      });
      return cajas;
    },
    caja: () => {
      var caja = Cajas.findOne({ _id: rc.getReactively('caja_id') });
      if(caja){
        _.each(caja.cuenta, function(c, key) {
          if (c.cuenta_id) {
            c.cuenta = Cuentas.findOne(c.cuenta_id);
          }
          c.tipoIngreso = TiposIngreso.findOne(key);
        });
      }
      return caja
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

            if (d.pago.tipoIngreso_id != undefined)console.log("kakakaakak")
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
  });

  this.getCajero = (objeto) => {
    c = Meteor.users.findOne(objeto.usuario_id)
    if (c && c.profile && c.profile.nombreCompleto)
      return c.profile.nombreCompleto
    return ""
  }

  this.verCaja = function(caja_id, cajaInactiva) {
	  console.log(caja_id);
    if (cajaInactiva) {
	    var caja = Cajas.findOne(caja_id);
	    console.log(caja);
      Meteor.apply('getCajaInactivaDetalle', [caja.caja._id, caja.createdAt, caja.corte.createdAt], function(err, result) {
	      console.log(result);
        rc.cajaInactiva = result;
        rc.cajaInactiva.caja = { nombre: caja.caja.nombre, fechaApertura: caja.createdAt, fechaCierre: caja.corte.createdAt }
        $scope.$apply();
        $('#cajaInactiva').modal('show');
      });
    } else {
      rc.caja_id = caja_id;
      $('#cajaActiva').modal('show');
    }
  }

  this.nuevoTraspasoModal = function() {
    $('#nuevoTraspaso').modal('show');
  }

  this.cancelarPago = function(pago) {
    customConfirm('Estás seguro de cancelar el pago ' + pago.folioPago + '?', function() {
      _.each(pago.planPagos, function(plan) {
        PlanPagos.update(plan.planPago_id, { $set: { estatus: 0 }, $inc: { importeRegular: plan.totalPago, pago: -plan.totalPago } });
      });
      var movimiento_id = MovimientosCajas.insert({
        tipoMovimiento: "Cancelación",
        origen: "Cancelación de pago",
        origen_id: pago._id,
        monto: pago.totalPago *-1,
        cuenta_id: pago.tipoIngreso_id,
        caja_id: pago.caja_id,
        sucursal_id: pago.sucursalPago_id,
        createdAt: new Date(),
        createdBy: Meteor.userId(),
        updated: false,
        estatus: 1
      });
      Pagos.update(pago._id, { $set: { estatus: 0, cancelacion_movimientoCaja_id: movimiento_id } });
    })
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

  this.nuevoTraspasoGuardar = function(datos, form) {
    if(form.$invalid){
      toastr.error('Completa todos los campos correctamente');
      return;
    }
    if(datos.tipo == 'desde_cuenta'){
      Meteor.apply('traspasoCuentaCaja', [datos.origen_destino, rc.caja._id, datos.importe, rc.detalleOrigenDestino.tipoIngreso_id], function(err, result){
        if(err){
          toastr.error(err.details);
          return
        }
        toastr.success('Guardado correctamente.');
        $('#nuevoTraspaso').modal('hide');
        //$scope.$apply();
        rc.nuevoTraspaso = { tipo: 'desde_cuenta' };
        rc.detalleOrigenDestino = undefined;
        form.$setPristine();
        form.$setUntouched();
      });
    }else if(datos.tipo == 'a_cuenta'){
      Meteor.apply('traspasoCajaCuenta', [rc.caja._id, datos.origen_destino, datos.importe], function(err, result){
        if(err){
          toastr.error(err.details);
          return
        }
        toastr.success('Guardado correctamente.');
        $('#nuevoTraspaso').modal('hide');
        //$scope.$apply();
        rc.nuevoTraspaso = { tipo: 'desde_cuenta' };
        rc.detalleOrigenDestino = undefined;
        form.$setPristine();
        form.$setUntouched();
      });
    }else if(datos.tipo == 'desde_ventanilla'){
      Meteor.apply('traspasoCajaCaja', [datos.origen_destino, rc.caja._id, datos.importe, datos.tipoIngreso_id], function(err, result){
        if(err){
          toastr.error(err.details);
          return
        }
        toastr.success('Guardado correctamente.');
        $('#nuevoTraspaso').modal('hide');
        //$scope.$apply();
        rc.nuevoTraspaso = { tipo: 'desde_cuenta' };
        rc.detalleOrigenDestino = undefined;
        form.$setPristine();
        form.$setUntouched();
      });
    }else if(datos.tipo == 'a_ventanilla'){
      Meteor.apply('traspasoCajaCaja', [rc.caja._id, datos.origen_destino, datos.importe, datos.tipoIngreso_id], function(err, result){
        if(err){
          toastr.error(err.details);
          return
        }
        toastr.success('Guardado correctamente.');
        $('#nuevoTraspaso').modal('hide');
        //$scope.$apply();
        rc.nuevoTraspaso = { tipo: 'desde_cuenta' };
        rc.detalleOrigenDestino = undefined;
        form.$setPristine();
        form.$setUntouched();
      });
    }
  };
    // Meteor.call("movimientosCaja",$stateParams,function(error,result){
    //  rc.movimientosCaja=result 
    //  $scope.$apply()
    // });

  // this.getMontos=(objeto)=>{
  //  var r = '<table class="table table-bordered"> <tbody>';
  //  for(i in objeto.cuenta){
  //    r+="<tr>"
  //    try{
  //      c=Cuentas.findOne(objeto.cuenta[i].cuenta_id)

  //      r+="<td>"+c.nombre+"</td>";
  //      r+='<td class="text-right">'+ ((objeto.cuenta[i].saldo+"").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"))+"</td>";
  //    }catch(e){

  //    }
  //    r+="</tr>"
  //  }
  //  r+="</tbody></table>"
  //  return r;
  // }
};
