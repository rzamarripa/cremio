angular.module("creditoMio")
  .controller("verCajaInactivaCtrl", verCajaInactivaCtrl);

function verCajaInactivaCtrl($scope, $meteor, $reactive, $state, $stateParams, toastr) {
	let rc = $reactive(this).attach($scope);
  window.rc = rc;
  
  if ($stateParams.caja_id)
  	 this.caja_id 	= $stateParams.caja_id;
  
  rc.corte_id = $stateParams.corteCaja_id;
  
  this.caja = { _id: 0 };
  
  rc.pagos_id = [];
  this.cajasInactivas = [];
  this.fechaInicio = "";
  this.fechaFin = "";
  this.totalResumen = 0;
  
  this.subscribe('cajas', () => {
    return [{ }]
  });
  this.subscribe('tiposIngreso', () => {
    return [{}]
  });
  this.subscribe('allCajeros', () => {
    return [{"profile.sucursal_id": Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
						 "profile.estatus" 		: true,
						 roles 								: ["Cajero"]}]
  });

  this.subscribe('cuentas', () => {
    return [{}]
  });
	
 
  this.subscribe('cortesCaja', () => {
    return [{_id: $stateParams.corteCaja_id}]
  });
  
  this.subscribe('movimientosCaja', () => {
    return [{_id: $stateParams.movimientosCaja_id}]
  });
  
  this.helpers({
	  pagos: () => {
				return Pagos.find();
		},
	  caja: () => {
      var caj = Cajas.findOne({ _id: $stateParams.caja_id });  
			
      //var pagos_id = [];
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

					        rc.cajaInactiva = result;
					        var todos_id = _.pluck(rc.cajaInactiva.movimientosCaja, "origen_id"); 
					        rc.pagos_id = _.uniq(todos_id);
					        
					        _.each(rc.cajaInactiva.movimientosCaja, function(mov) {						        	
						      
						        	if (mov.origen == "Pago de Cliente" || mov.origen == "Pago de Distribuidor" || mov.origen == "Cancelación de pago")  
						        	{
							        		
							        		Meteor.call('getPago', mov.origen_id, function(err, result) {
												      if (err) {
												        //toastr.warning('Error al consultar los datos');
												      } 
												  		if (result)
															{
																var p = result;
																Meteor.apply('getUsuario', [p.usuario_id], function(err, result) {
														      if (err) {
														        toastr.warning('Error al consultar los datos');
														      } else {
														        var u = result;
														        mov.numeroCliente = u.numeroCliente != undefined ? u.numeroCliente : u.numeroDistribuidor;
																		mov.nombreCliente = u.nombreCompleto;
																		$scope.$apply();
														      }
														    });
														    
														    if (p.tipoIngreso_id != undefined)
																	mov.tipoIngreso = TiposIngreso.findOne(p.tipoIngreso_id);
														    
															}
															if (mov.origen == "Cancelación de pago")
															   mov.clase = "bg-color-pinkDark";
															   
															mov.bonificacion 	= mov.pago.bonificacion == undefined ? 0 : -mov.pago.bonificacion;   
							        		
							        		});
							        		
													
							        			
							        }
							        
							        if (mov.origen == "Entrega de Credito" || mov.origen == "Entrega de Vale" || mov.origen == "Cancelación de Ent. de Crédito" || mov.origen == "Cancelación de Ent. de Vale") 
							        {
         
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
															        mov.numeroCliente = u.numeroCliente != undefined ? u.numeroCliente : u.numeroDistribuidor;
																			mov.nombreCliente = u.nombreCompleto;
																			$scope.$apply();
															      }
															    });
															    mov.credito = credito;
															    mov.folio = credito.folio;
															    //$scope.$apply();
															  }  
												      }
												  });	
												  
												  if (mov.tipoIngreso_id != undefined)
															mov.tipoIngreso = TiposIngreso.findOne(mov.tipoIngreso_id); 
													if (mov.cuenta_id != undefined)	
															mov.tipoIngreso = TiposIngreso.findOne(mov.cuenta_id);	
						
												  if (mov.origen == "Cancelación de Ent. de Crédito" || mov.origen == "Cancelación de Ent. de Vale")
													   mov.clase = "bg-color-pinkDark";
													mov.credito_id				= mov.origen_id;
													mov.movimientoCaja_id = mov._id; 
							        } 
							      
					        });
					        $scope.$apply();

					      }  
							});
					}		
				}
      }
      return caj
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
    traspasos: () => {
      var traspasos = Traspasos.find({}, { sort: { createdAt: -1 } }).fetch();
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
		    if (c != undefined)
		      return c.profile.nombreCompleto;
		}     
    return "";
  }

  this.detalle = function(_id) {
    rc.detalleOrigenDestino = _.findWhere(rc.cajas, {_id: _id}) || _.findWhere(rc.cuentas, {_id: _id});
  };
    

}