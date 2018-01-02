angular.module("creditoMio")
  .controller("verCajaActivaCtrl", verCajaActivaCtrl);

function verCajaActivaCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr) {
	let rc = $reactive(this).attach($scope);
  window.rc = rc;
  
  
  if ($stateParams.caja_id)
  	this.caja_id = $stateParams.caja_id;
  
  this.caja = { _id: 0 };
  
  this.pagos_id = [];
  this.cajasInactivas = [];
  this.fechaInicio = moment().subtract(1, 'month').startOf('month').toDate();
  this.fechaFin = moment().subtract(1, 'month').endOf('month').toDate();
  this.totalResumen = 0;
  this.nuevoTraspaso = { tipo: 'desde_cuenta' }
  
  
  
  this.subscribe('cajas', () => {
    return [{ }]
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
    caja: () => {
      var caj = Cajas.findOne({ _id: $stateParams.caja_id });
      if(caj){
	      this.caja = caj;
        _.each(caj.cuenta, function(c, key) {
          if (c.cuenta_id) {
            c.cuenta = Cuentas.findOne(c.cuenta_id);
          }
          c.tipoIngreso = TiposIngreso.findOne(key);
        });
      }
      return caj
    },
    cajas: () => {
      return Cajas.find({});
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

          var d = {};
          if (mov.origen == "Pago de Cliente" || mov.origen == "Pago de Distribuidor" || mov.origen == "Cancelación de pago") {
            	pagos_id.push(mov.origen_id);
							var p = Pagos.findOne(mov.origen_id);
							if (p != undefined)
							{
								Meteor.apply('getUsuario', [p.usuario_id], function(err, result) {
						      if (err) {
						        toastr.warning('Error al consultar los datos');
						      } else {
						        var u = result;
						        d.numeroCliente = u.numeroCliente != undefined ? u.numeroCliente : u.numeroDistribuidor;
										d.nombreCliente = u.nombreCompleto;
										$scope.$apply();
						      }
						    });
							}
							if (mov.origen == "Cancelación de pago")
							   d.clase = "bg-color-pinkDark";
          }
          
          var credito = {};
          
          if (mov.origen == "Entrega de Credito" || mov.origen == "Entrega de Vale" || mov.origen == "Cancelación de Ent. de Crédito") {
         
	          	Meteor.call('getCredito', mov.origen_id, function(err, result) {
						      if (err) {
						        //toastr.warning('Error al consultar los datos');
						      } 
						      
						      if (result) {
						        credito = result;
						        if (credito != undefined)
										{
							        Meteor.call('getUsuario', credito.cliente_id, function(err, result) {
									      if (err) {
									        toastr.warning('Error al consultar los datos');
									      } else {
									        var u = result;
									        d.numeroCliente = u.numeroCliente != undefined ? u.numeroCliente : u.numeroDistribuidor;
													d.nombreCliente = u.nombreCompleto;
													$scope.$apply();
									      }
									    });
									    d.credito = credito;
									  }  
						      }
						  });	

						  if (mov.origen == "Cancelación de Ent. de Crédito")
							   d.clase = "bg-color-pinkDark";
							d.credito_id				= mov.origen_id;
							d.movimientoCaja_id = mov._id; 
	        } 
					
					d.estatus					= mov.estatus;
          d.createdAt 		 	= mov.createdAt;
          d.tipoMovimiento 	= mov.tipoMovimiento;
          d.origen 					= mov.origen;
          
          
          c = Cuentas.findOne(cj.cuenta[mov.cuenta_id].cuenta_id);
         
          if (c) {
            d.cuenta = c.nombre;
          }
          d.monto = mov.monto;
          
          d.pago = Pagos.findOne(mov.origen_id);
          

          if (d.pago) {
            d.multas 		= 0;
            d.capital 	= 0;
            d.intereses = 0;
            d.iva 			= 0;
            d.seguro 		= 0;
						
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
          else
          {
          	if (mov.tipoIngreso_id != undefined)
								d.tipoIngreso = TiposIngreso.findOne(mov.tipoIngreso_id); 
						if (mov.cuenta_id != undefined)	
								d.tipoIngreso = TiposIngreso.findOne(mov.cuenta_id);							
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
		if (objeto != undefined)
		{
    	  c = Meteor.users.findOne(objeto.usuario_id);
		    //console.log("Cajero:", c);
		    if (c != undefined)
		      return c.profile.nombreCompleto;
		}     
    return "";
  }
	
  this.nuevoTraspasoModal = function() {
	  
	  rc.cajas = Cajas.find({estadoCaja: "Abierta"}).fetch();
		//console.log(rc.cajas);
	  
    $('#nuevoTraspaso').modal('show');
  }

  this.cancelarPago = function(pago, op) {
	  
	  
	  if (op == 1)
	  {
    	customConfirm('¿Estás seguro de cancelar el pago ' + pago.folioPago + '?', function() {
	    	    	
      
	      var mc = MovimientosCajas.findOne(pago.movimientoCaja_id);
	
	      if (mc.estatus == 2)
	      {
		      	toastr.warning("El movimiento ya está Cancelado");
		      	return;
	      }
				
				_.each(pago.planPagos, function(plan) {			
						//Poner pago Cancelado para que no sume
						_.each(plan.pagos, function(pago){
								if (pago.pago_id == pago._id)
									 pago.estatus = 2; //Estatus Cancelado;
	
						});
						
						PlanPagos.update(plan.planPago_id, { $set: { estatus				: 0}, 
																								 $inc: { importeRegular : plan.totalPago, 
																												 pagoInteres 		: -plan.pagoInteres,
																												 pagoIva 				: -plan.pagoIva,
																												 pagoSeguro 		: -plan.pagoSeguro, 
																												 pagoCapital		: -plan.pagoCapital
																											 }
		        });
						
	      });
	      
	      //Para que no se pueda voler a cancelar
	      MovimientosCajas.update(pago.movimientoCaja_id, {$set: {estatus:2}});
	      
	      var movimiento_id = MovimientosCajas.insert({
	        tipoMovimiento	: "Cancelación",
	        origen					: "Cancelación de pago",
	        origen_id				: pago._id,
	        monto						: pago.totalPago *-1,
	        cuenta_id				: pago.tipoIngreso_id,
	        caja_id					: pago.caja_id,
	        sucursal_id			: pago.sucursalPago_id,
	        createdAt				: new Date(),
	        createdBy				: Meteor.userId(),
	        updated					: false,
	        estatus					: 1
	      });
	      Pagos.update(pago._id, { $set: { estatus: 0, cancelacion_movimientoCaja_id: movimiento_id } });
	
	
				//Restar de la cuenta en la que se hizo el dinero:
				_.each(rc.caja.cuenta, function(caja, tipoIngreso_id){
						if (tipoIngreso_id == pago.tipoIngreso_id)
							rc.caja.cuenta[tipoIngreso_id].saldo = Number(parseFloat(rc.caja.cuenta[tipoIngreso_id].saldo - pago.totalPago).toFixed(2));				
				});
				var tempId = rc.caja._id;
				delete rc.caja._id;
				Cajas.update(tempId, {$set:rc.caja});
	    
	    });
	  }
	  else
	  {
		  customConfirm('¿Estás seguro de cancelar la entrega de crédito ?', function() {
      					
      					
      	if (pago.estatus == 2)
	      {
		      	toastr.warning("El movimiento ya está Cancelado");
		      	return;
	      }
      	
      	//Valida que se pueda cancelar la entrega de crédito
      	if (pago.credito.adeudoInicial != pago.credito.saldoActual)
      	{	
	      		toastr.warning("El crédito ya tiene pagos hechos no es posible cancelarlo");
		      	return;	
      	}
      	
      	
      	//Para que no se pueda voler a cancelar
				MovimientosCajas.update(pago.movimientoCaja_id, {$set: {estatus:2}});
	    	Creditos.update(pago.credito._id,{$set:{estatus:2}});
	    	
				
				var movimiento_id = MovimientosCajas.insert({
	        tipoMovimiento	: "Cancelación",
	        origen					: "Cancelación de Ent. de Crédito",
	        origen_id				: pago.credito._id,
	        monto						: pago.monto *-1,
	        cuenta_id				: pago.tipoIngreso._id,
	        caja_id					: rc.caja._id,
	        sucursal_id			: pago.credito.sucursalPago_id,
	        createdAt				: new Date(),
	        createdBy				: Meteor.userId(),
	        updated					: false,
	        estatus					: 1
	      });
				
				//Sumar de la cuenta en la que se hizo el dinero:				
				_.each(rc.caja.cuenta, function(caja, tipoIngreso_id){
						if (tipoIngreso_id == pago.tipoIngreso._id)
							rc.caja.cuenta[tipoIngreso_id].saldo = Number(parseFloat(rc.caja.cuenta[tipoIngreso_id].saldo + pago.monto).toFixed(2));				
				});
				var tempId = rc.caja._id;
				delete rc.caja._id;
				Cajas.update(tempId, {$set:rc.caja});

		      		  
			})
	    
	  }
	}

  this.detalle = function(_id) {
/*
	  console.log("Que es esto:", _id);
	  console.log("Cajas:", rc.cajas);
	  console.log("Cuentas:", rc.cuentas);
*/

		
	  
    rc.detalleOrigenDestino = _.findWhere(rc.cajas, {_id: _id}) || _.findWhere(rc.cuentas, {_id: _id});
    
    //console.log(rc.detalleOrigenDestino)
  };

  this.nuevoTraspasoGuardar = function(datos, form) {
	  
	  //console.log("Datos:", datos);
	  
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
  
  this.corte = function(caja) {
	  
    customConfirm('¿Estás seguro de cerrar la ventanilla?', function() {

      	Meteor.call ("corteCaja",caja.cuenta, caja.usuario_id, caja._id,function(error,result){
						if(error){
							console.log(error);
							toastr.error('Error al guardar los datos.');
							return
						}
						if (result)
						{
							console.log(result);
							toastr.success('Cierre efectuado correctamente.');
							$state.go('root.cajasActivas');						
							
							var url = $state.href("anon.imprimirCorte", { corte_id: result });
							window.open(url, '_blank');
							
						}	
				});
      
    })
  }

}