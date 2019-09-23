angular
	.module('creditoMio')
	.controller('ClientesDetalleCtrl', ClientesDetalleCtrl);
 
function ClientesDetalleCtrl($scope, $meteor, $reactive, $state, toastr, $stateParams) {
	
	rc = $reactive(this).attach($scope);
	
	this.fechaActual = new Date();
	this.creditos = [];
	rc.creditos_id = [];
	rc.empresaCliente = ""
	rc.credito_id = ""
	rc.credito = "";
	rc.notaCuenta = []
	rc.empresaArray
	this.notaCobranza = {}
	this.masInfo = false;
	this.masInfoCredito = false;
	this.creditoAc = true;
	this.solicitudesCre = false;
	this.notasCre = false;
	rc.cancelacion = {};
	rc.nota = {};
	rc.pagos = ""
	window.rc = rc;
	this.imagenes = []
	rc.openModal = false
	rc.empresa = {}
	rc.creActivos =false;
	rc.creditoApro = false;
	this.creditosRechazados = false;
	this.respuestaNotaCLiente = false;
	rc.objeto = {};
	rc.objeto.profile = {};
	rc.objeto.profile.empresa = {};
	rc.creditoSeleccionado = {};
	rc.estadoCivilSeleccionado = "";
	rc.recibo = {};
	rc.recibos = [];
	rc.empresaSeleccionada = ""
	rc.datosCliente = ""
	rc.btnCerrarRespuesta = true;
	
	rc.editMode = false;
	rc.puedeSolicitar = true;
	
	rc.estatusCaja = "";
	
	rc.parametrizacion = {};
	
	rc.notaPerfil = {};
	rc.notaCuenta1 = {};
	
	rc.saldo = 0;
	rc.cargosMoratorios = 0;
	
	rc.abonosRecibos 					= 0;
	rc.abonosCargorMoratorios = 0;
	
	rc.banderaContestar = false;
	
	rc.edad	= 0;
	
	rc.pago_id = "";
	rc.pagos_ids = [];
	
	rc.editarNota = false;
	
	rc.cliente_id = $stateParams.objeto_id;
	
	this.subscribe('cajas',()=>{
		return [{}];
	});
	this.subscribe('detalleClienteEncabezado', () => {
		return [{_id : $stateParams.objeto_id}];
	});
	this.subscribe('parametrizacion', () => {
		return [{cliente_id : $stateParams.objeto_id}];
	});
	this.subscribe('creditos', () => {
		return [{cliente_id : $stateParams.objeto_id}];
	});
	this.subscribe('notasCredito', () => {
		return [{cliente_id : $stateParams.objeto_id}];
	});
	this.subscribe('planPagos', () => {
		return [{
			cliente_id : $stateParams.objeto_id, credito_id : { $in : rc.getReactively("creditos_id")}
		}];
	});
	this.subscribe('notas',()=>{
		return [{cliente_id	: $stateParams.objeto_id,
						estatus 		: true,
						tipo				: {$in : ["Cliente", "Cuenta"]} 	
		}]
	})
	this.subscribe('tiposNotasCredito',()=>{
		return [{}]
	});
	this.subscribe('tiposCreditos',()=>{
		return [{}]
	});
	this.subscribe('estadoCivil',()=>{
		return [{}]
	});
	this.subscribe('pagos',()=>{
		return [{ _id : { $in : rc.getReactively("pagos_ids")}}];
	});
	this.subscribe('personas',()=>{
		return [{rol:"Cliente"}];
	});
	this.subscribe('tiposIngreso',()=>{
		return [{}] 
	});	
	this.subscribe('tiposCredito',()=>{
		return [{
			estatus : true
		}]
	});
			
	this.helpers({
		creditos : () => {
			var creditos = Creditos.find({estatus:4}, {sort:{fechaSolicito:1}}).fetch();
			
			_.each(creditos, function(credito){
				if (credito.saldoMultas == 0) {
					rc.puedeSolicitar = true
				}else{
					rc.puedeSolicitar = false
				}
				if (creditos == "") {
					rc.puedeSolicitar = false
				}
				
				
				credito.tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
								
				credito.tieneAvales = false;
				_.each(credito.avales_ids, function(aval){
						credito.tieneAvales = true;
						Meteor.apply('getAval', [aval.aval_id], function(error, result){
							if(result){

								aval.nombreCompleto = result.nombreCompleto;
								aval.celular = result.celular;
							}
							if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
					    		$scope.$apply();
							}
							
						});
					
				})
				
			});

			return creditos;
		},
		parametrizacion : () => {
			rc.parametrizacion = Parametrizacion.findOne({});
			if (rc.parametrizacion)
			{
				return rc.parametrizacion;
			}	
		},
		creditosAprobados : () =>{
			var creditos = Creditos.find({cliente_id: rc.cliente_id, estatus:2}, {sort:{fechaSolicito:1}}).fetch();			
			if(creditos != undefined){
				_.each(creditos, function(credito){	
					 credito.tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
					 if (credito.avales_ids.length > 0)
					 		credito.tieneAval = "SI";
					 else
					 		credito.tieneAval = "NO";		
					 				
				})
			}
			return creditos;
		},
		creditosCancelados : () =>{
			return Creditos.find({estatus: {$in: [3,6]}});
		},
		creditosPendientes : () =>{
			var creditos = Creditos.find({cliente_id: rc.cliente_id, estatus:{$in:[0,1]} }, {sort:{fechaSolicito:1}}).fetch();
			
			if(creditos != undefined){
				_.each(creditos, function(credito){				
					 credito.estatusClase = obtenerClaseEstatus(credito.requiereVerificacion);
					 credito.tipoCredito = TiposCredito.findOne(credito.tipoCredito_id);
					 if (credito.avales_ids.length > 0)
					 		credito.tieneAval = "SI";
					 else
					 		credito.tieneAval = "NO";		
				})
			}
			
			return creditos;
		},
		notasCredito : () =>{
			var notas = NotasCredito.find({},{sort:{createdAt:-1}});
			return notas;
		},
		notasCreditoSaldo : () =>{
			var notas = NotasCredito.find({estatus: 1, saldo : {$gt: 0}});
			return notas;
		},
		objeto : () => {
			var cli = Meteor.users.findOne({_id : $stateParams.objeto_id});

			if (cli != undefined)
			{
					
					rc.edad	= moment().diff(cli.profile.fechaNacimiento, 'years',false);
								
					var estadoCivilSeleccionado = EstadoCivil.findOne(cli.profile.estadoCivil_id);
					
					if (estadoCivilSeleccionado)
							rc.estadoCivilSeleccionado = estadoCivilSeleccionado;

					var notas = Notas.find({cliente_id	: $stateParams.objeto_id,
																	estatus 		: true,
																	tipo				: {$in : ["Cliente", "Cuenta"]}}).fetch();
					
					if (rc.banderaContestar == false)
					{
							_.each(notas, function(nota){
								
								if (nota.tipo == "Cuenta") {
										rc.notaCuenta1 = nota;
										
										Meteor.call('getUsuario', nota.usuario_id,
									     	function(err, result) {
									      if(result){
													nota.nombreCompleto = result.nombreCompleto;
													$scope.$apply();
									      }
								    });	
										$("#myModal").modal(); 
									}
									else if (nota.tipo == "Cliente")
									{
										//Esta abre la nota de Cliente
										rc.notaPerfil = nota;
										$("#notaPerfil").modal();
									}
							});
					}
					
					//getdocumentos
          Meteor.call('getDocumentosClientes', $stateParams.objeto_id, function(error,result){
			      if (result)
			        {
			          //ir por los documentos
			          rc.documentos = result;
			          $scope.$apply();      
			        }
			    });

																	
			}
			
			return cli;	
		},			
		planPagos : () => {
			var planPagos = PlanPagos.find({},{sort : {numeroPago : 1, descripcion:-1}}).fetch();
			
			rc.saldo = 0;
			rc.cargosMoratorios = 0;
			
			if(rc.getReactively("creditos") && rc.creditos.length > 0 && planPagos.length > 0){	
				_.each(rc.getReactively("creditos"), function(credito){
					credito.planPagos = [];
					
					credito.numeroPagosCargoMoratorios = 0;
					credito.pagados = 0;
					credito.pagadosCargoM = 0;
					credito.sumaRecibos = 0;
					credito.sumaPagosRecibos = 0;
					credito.sumaCargoMoratorios = 0;
					credito.sumaPagosCargoM = 0;
					credito.tieneCargoMoratorio = false;
					
					credito.pagos = 0;
					rc.cargosMoratorios = 0;

					_.each(planPagos, function(pago){
							
								pago.credito = Creditos.findOne(credito._id);
		
								if(pago.descripcion=="Recibo"){
									credito.pagos +=pago.pago;
								}
								
								if(credito._id == pago.credito_id){
									
									
									pago.numeroPagos = credito.numeroPagos;
									pago.numeroPagosCargoMoratorios = 0;
									
									credito.planPagos.push(pago);
									if (pago.descripcion == "Recibo")
									{
										if (pago.importeRegular == 0)
										{
											  credito.pagados++;
											  credito.sumaPagosRecibos += pago.cargo;
										}
										else
										{
												if (pago.pagos.length > 0)
												{
														_.each(pago.pagos, function(pp){
															 if (pp.estatus != 2)	
																credito.sumaPagosRecibos += pp.totalPago;				
														});
														
												}
												rc.saldo += pago.importeRegular;
												
										}		
										credito.sumaRecibos += pago.importeRegular;
									}
									
									if (pago.descripcion == "Cargo Moratorio")
									{
										credito.tieneCargoMoratorio = true;	
										
										if (pago.importeRegular == 0)
										{
											  credito.pagadosCargoM++;
											  credito.sumaPagosCargoM += pago.cargo;
										}
										else
										{
											  if (pago.pagos.length > 0)
												{
														_.each(pago.pagos, function(pp){
															 if (pp.estatus != 2)
																credito.sumaPagosCargoM += pp.totalPago;				
														});
												}
										}
										
										rc.cargosMoratorios += pago.importeRegular;		
										credito.numeroPagosCargoMoratorios += 1;
										credito.sumaCargoMoratorios += pago.cargo;
									}
										
								}

					});
					
					if (rc.cargosMoratorios != credito.saldoMultas){
							credito.saldoMultas = rc.cargosMoratorios;
							Creditos.update({_id: credito._id}, {$set: {saldoMultas : rc.cargosMoratorios}});
					}
												
					if (credito.sumaRecibos != credito.saldoActual){
							credito.saldoActual = credito.sumaRecibos;
							//Creditos.update({_id: credito._id}, {$set: {saldoActual : credito.sumaRecibos}});
					}
						
				})
			}

			_.each(rc.empresas, function(empresa){

					empresa.ciudad = Ciudades.findOne(empresa.ciudad_id)
					empresa.colonia = Colonias.findOne(empresa.colonia_id)
					empresa.estado = Estados.findOne(empresa.estado_id)
					empresa.municipio = Municipios.findOne(empresa.municipio_id)
					empresa.pais = Paises.findOne(empresa.pais_id)


			});
			
			return planPagos
		},
		usuario: () => {
			return Meteor.users.findOne()
		},
		planPagosHistorial  : () => {
			var planes = PlanPagos.find({credito_id : rc.getReactively("credito_id")}, {sort:{numeroPago	: 1, 
																																												fechaLimite	: 1, 
																												descripcion	: -1}} ).fetch();
			return planes
		},
		historial : () => {
			arreglo = [];
			
			var saldoPago 			= 0;
			var saldoActual 		= 0; 
			rc.saldo 						= 0;
			rc.saldoGeneral 		= 0;
			rc.sumaNotaCredito 	= 0;
			var credito 				= rc.credito
			rc.saldoMultas 			= 0;

			rc.abonosRecibos 					= 0;
			rc.abonosCargorMoratorios = 0;

			_.each(rc.getReactively("planPagosHistorial"), function(planPago){	
				if(planPago.descripcion == "Recibo")
					rc.saldo += Number(parseFloat(planPago.cargo).toFixed(2));
				
				if (planPago.descripcion == "Cargo Moratorio")
					rc.saldoMultas 	+= Number(planPago.importeRegular + planPago.pago);	
					
			});

			rc.pagos_ids = [];
			
			_.each(rc.getReactively("planPagosHistorial"), function(planPago, index){
									
				var sa 			 	= 0;
				var cargoCM 	= 0;
				if (planPago.descripcion == 'Recibo')
				{
					 sa = Number(parseFloat( planPago.cargo - (planPago.pagoInteres + planPago.pagoIva + planPago.pagoCapital +	planPago.pagoSeguro) ).toFixed(2)); 
					 planPago.fechaLimite.setHours(0,0,0,0);
				}
				else if (planPago.descripcion == 'Cargo Moratorio')
				{
					 	sa = Number(parseFloat(planPago.importeRegular).toFixed(2));
					 	planPago.fechaLimite.setHours(1,0,0,0);
					 	cargoCM = Number(planPago.importeRegular + planPago.pago);
				}
	
				arreglo.push({saldo							: rc.saldo,
											numeroPago  			: planPago.numeroPago,
											cantidad 					: rc.credito.numeroPagos,
											fechaSolicito 		: rc.credito.fechaSolicito,
											fecha 						: planPago.fechaLimite,
											pago  						: 0, 
											cargo 						: planPago.descripcion == "Recibo"? planPago.cargo: cargoCM,
											movimiento 				: planPago.movimiento,
											planPago_id 			: planPago._id,
											credito_id 				: planPago.credito_id,
											descripcion 			: planPago.descripcion,
											importe 					: planPago.importeRegular,
											pagos 						: planPago.pagos,
											notaCredito				: 0,
											saldoActualizado	: planPago.pagos.length == 0 ? planPago.importeRegular : sa
																																																									 
			  	});			
			  		
				if (planPago.pagos.length > 0)
				{
						
					_.each(planPago.pagos,function (pago) {
						 if (pago.estatus != 3)
								rc.pagos_ids.push(pago.pago_id);
					});	
					
					_.each(planPago.pagos,function (pago) {
						
						//Ir por la Forma de Pago
						if (pago.estatus != 3)
						{	
							var formaPago = "";
							var pag = Pagos.findOne(pago.pago_id);
							if (pag != undefined)
							{
								 var ti = TiposIngreso.findOne(pag.tipoIngreso_id);
								 if (ti != undefined)
		 							 formaPago = ti.nombre;
							}
							
							if (planPago.descripcion == 'Recibo')
							{
									rc.abonosRecibos += pago.totalPago;
							}
							else if (planPago.descripcion == "Cargo Moratorio")	
							{
									rc.abonosCargorMoratorios += pago.totalPago;
							}
							
							if (formaPago == 'Nota de Credito')
									rc.sumaNotaCredito 	+= pago.totalPago;
												
							arreglo.push({saldo							: rc.saldo,
														numeroPago 				: planPago.numeroPago,
														cantidad 					: credito.numeroPagos,
														fechaSolicito 		: rc.credito.fechaSolicito,
														fecha 						: pago.fechaPago,
														pago  						: pago.totalPago, 
														cargo 						: 0,
														movimiento 				: planPago.descripcion == "Cargo Moratorio"? "Abono a CM": "Abono",
														planPago_id 			: planPago._id,
														credito_id 				: planPago.credito_id,
														descripcion 			: planPago.descripcion == "Cargo Moratorio"? "Abono A CM": "Abono",
														importe 					: planPago.importeRegular,
														pagos 						: planPago.pagos,
														notaCredito				: formaPago == 'Nota de Credito' ? pago.totalPago : 0,
														saldoActualizado	: 0
					  	});
					  }	
					})
					
				}
					
			});
		
			
			rc.saldoGeneral 	= (rc.saldo + rc.saldoMultas ) - ( rc.abonosRecibos + rc.abonosCargorMoratorios );
							
			arreglo.sort(function(a,b){		
				return a.numeroPago - b.numeroPago || new Date(a.fecha) - new Date(b.fecha) ;
			});

			_.each(arreglo, function(item, index){
					if (index > 0)
					{
							if (item.descripcion == "Cargo Moratorio")
									rc.saldo += Number(parseFloat(item.cargo).toFixed(2));
							else if  (item.movimiento == "Abono" || item.movimiento == "Abono A CM")
									rc.saldo -= Number(parseFloat(item.pago).toFixed(2));
					}
					item.saldo = rc.saldo;
			});
						
			return arreglo;
		},
		historialCreditos : () => {
			var creditos = Creditos.find({estatus: {$in: [4,5]}}, {sort : {fechaSolicito: -1}}).fetch();
			if(creditos != undefined){
				
				_.each(creditos, function(c)
				{
						var tc = TiposCredito.findOne(c.tipoCredito_id);
						if (tc != undefined)
							 c.tipoCredito = tc.nombre;
							 
						if (c.avales_ids.length > 0)
								c.tieneAval = "Si";
						else
								c.tieneAval = "No";		
						
				});
				
				rc.creditos_id = _.pluck(creditos, "_id");
			}	
			return creditos;
		},
		cajero: () => {
			var c = Meteor.users.findOne({roles: "Cajero"});
			
			if (c != undefined)
			{
					var caja = Cajas.findOne({usuario_id: c._id});
					//console.log(caja);
					if (caja != undefined)
					{
							if (caja.estadoCaja == "Cerrada")
									rc.estatusCaja = false;
							else if (caja.estadoCaja == "Abierta")
									rc.estatusCaja = true;
					}
					else
							rc.estatusCaja = false;
			}			
			//console.log(rc.estatusCaja);
			return c;
		},
    imagenesDocs : () => {
   	var imagen = rc.imagenes
   	_.each(rc.getReactively("imagenes"),function(imagen){
   		imagen.archivo = rc.objeto.profile.foto

   	});


  		return imagen
		},
	});

//////////////////////////////////////////////////////////////////////////////////////////
  this.mostrarCheckCuenta = function(nota){
  	//console.log(nota,"mostrarCheckCuenta")
  	if (nota.tipo == "Cuenta") {
  		//console.log("entra")
			 document.getElementById("cuentaNota").style.visibility = "visible";
		}else{
			document.getElementById("cuentaNota").style.visibility = "hidden";
		}

  };
	this.actualizar = function(cliente,form){

		//console.log(cliente);
		var clienteTemp = Meteor.users.findOne({_id : cliente._id});
		this.cliente.password = clienteTemp.password;
		this.cliente.repeatPassword = clienteTemp.password;
		//console.log(this.cliente.password)
		//document.getElementById("contra").value = this.cliente.password;

		if(form.$invalid){
			toastr.error('Error al actualizar los datos.');
			return;
		}
		var nombre = cliente.profile.nombre != undefined ? cliente.profile.nombre + " " : "";
		var apPaterno = cliente.profile.apPaterno != undefined ? cliente.profile.apPaterno + " " : "";
		var apMaterno = cliente.profile.apMaterno != undefined ? cliente.profile.apMaterno : "";
		cliente.profile.nombreCompleto = nombre + apPaterno + apMaterno;
		delete cliente.profile.repeatPassword;
		Meteor.call('updateGerenteVenta', rc.cliente, "cliente");
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
		$state.go("root.clienteDetalle",{objeto_id : rc.cliente._id});
		//$state.go('root.clientes');
	};	
	this.tomarFoto = function () {
		$meteor.getPicture().then(function(data){
			rc.cliente.profile.fotografia = data;
		});
	};
	this.tieneFoto = function(sexo, foto){
		if(foto === undefined){
			if(sexo === "Masculino")
				return "img/badmenprofile.png";
			else if(sexo === "Femenino"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
			}
		}else{
			return foto;
		}
	}
	this.tieneFoto = function(foto, sexo){
		
	  if(foto === undefined){
		  if(sexo === "Masculino")
			  return "img/badmenprofile.png";
			else if(sexo === "Femenino"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
			}
	  }else{
		  return foto;
	  }
  };
	this.masInformacion = function(cliente){

		this.masInfo = !this.masInfo;
		this.solicitudesCre = false;
		this.creditoAc = false;
		this.notasCre=false;
		this.masInfoCredito = false;
		this.creditoApro = false
		this.creditosRechazados = false;
		
		Meteor.call('getClienteInformacion',cliente, function(error, result) {           
        if (result)
        {
          	rc.objeto = result;
						$scope.$apply();      	
				}
		});
		
		Meteor.call('getDocumentosSinImagenCliente',rc.objeto._id, function(error, result) {           
        if (result)
        {
		      rc.objeto.profile.documentos = [];
        	rc.objeto.profile.documentos = result;
        	$scope.$apply();
 				}
		});
		
		rc.referenciasPersonales = [];
					
		//console.log(cli.profile.referenciasPersonales_ids);
    _.each(cliente.profile.referenciasPersonales_ids,function(referenciaPersonal){
      		//console.log("RP ARRay:",referenciaPersonal);
          Meteor.call('getReferenciaPersonal', referenciaPersonal.referenciaPersonal_id, function(error, result){           
                if (result)
                {
                  //console.log("RP:",result);
                	if (result.apellidoMaterno == null) {
                		result.apellidoMaterno = ""
                	}
                    //Recorrer las relaciones 
                    
                    rc.referenciasPersonales.push({//buscarPersona_id : referenciaPersonal.referenciaPersonal_id,
                                                   nombre           : result.nombre,
                                                   apellidoPaterno  : result.apellidoPaterno,
                                                   apellidoMaterno  : result.apellidoMaterno,
                                                   parentesco       : referenciaPersonal.parentesco,
                                                   direccion        : result.direccion,
                                                   telefono         : result.telefono,
                                                   ciudad		        : result.ciudad,
                                                   estado     	    : result.estado,
                                                   tiempo           : referenciaPersonal.tiempoConocerlo,
                                                   num              : referenciaPersonal.num,
                                                   nombreCompleto		:	result.nombreCompleto
                                                   //cliente          : result.cliente,
                                                   //cliente_id       : result.cliente_id,
                                                   //tipoPersona      : result.tipoPersona,
                                                   //estatus          : result.estatus
                    });
										if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
								    		$scope.$apply();
										}
                }
          }); 
    });

	};
	this.creditosActivos = function(){
		this.creditoAc = !this.creditoAc;
		this.solicitudesCre = false;
		this.masInfo = false;
		this.notasCre=false;
		this.masInfoCredito = false;
		this.creditoApro = false
		this.creditosRechazados = false;
	}
	this.solicitudesCreditos = function(){
		this.solicitudesCre= !this.solicitudesCre;
		this.creditoAc = false;
		this.masInfo = false;
		this.notasCre=false;
		this.masInfoCredito = false;
		this.creditoApro = false
		this.creditosRechazados = false;
	}
	this.notasCreditos = function(){
		this.notasCre= !this.notasCre;
		this.creditoAc = false;
		this.solicitudesCre = false;
		this.masInfo = false;
		this.masInfoCredito = false;
		this.creditoApro = false
		this.creditosRechazados = false;
	}
	this.masInformacionCrdito = function(){
		this.masInfoCredito = !this.masInfoCredito;
		this.creditoAc = false;
		this.solicitudesCre = false;
		this.masInfo = false;
		this.notasCre=false;
		this.creditoApro = false;
		this.creditosRechazados = false;
	}
	this.creAprobados = function(){
		this.creditoApro = !this.creditoApro;
		this.masInfoCredito = false;
		this.creditoAc = false;
		this.solicitudesCre = false;
		this.masInfo = false;
		this.notasCre=false;
		this.creditosRechazados = false

	}
	this.creRechazados = function(){
		this.creditoApro = false;
		this.masInfoCredito = false;
		this.creditoAc = false;
		this.solicitudesCre = false;
		this.masInfo = false;
		this.notasCre=false;
		this.creditosRechazados = !this.creditosRechazados;


	}
	this.getNombreTipoNotaCredito = function (tipo_id) {
		var tipo = TiposNotasCredito.findOne(tipo_id);
		return tipo? tipo.nombre:"";
	}
	this.obtenerEstatus = function(cobro){
		if(cobro.estatus == 1)
			return "bg-color-green txt-color-white";
	 	if(cobro.estatus == 5 || cobro.tmpestatus==5)
		 	return "bg-color-blue txt-color-white";
	 	else if(cobro.estatus == 3)
	 		return "bg-color-blueDark txt-color-white";
	 	else if(cobro.estatus == 2)
	 		return "bg-color-red txt-color-white";
	 	else if(cobro.estatus == 6)
	 		return "bg-color-greenLight txt-color-white";
	 	else if(cobro.tiempoPago == 1)
	 		return "bg-color-orange txt-color-white";
		
		return "";
		
	}
	this.cancelarCredito = function(motivo, form){
			
			if(form.$invalid){
		        toastr.error('Error al cancelar.');
		        return;
		  }

			var cre = Creditos.findOne({_id : rc.cancelacion._id});
			Creditos.update({_id : cre._id}, { $set : {estatus : 6, motivo: motivo}});
			toastr.success("El crédito se ha cancelado.")
			$("#cancelaCredito").modal('hide');
	};
	this.cancelarSeleccion = function(aprobado){
			 //console.log(aprobado);	
			 rc.cancelacion = aprobado;
			 rc.motivo = "";
	};
	////*********************************************************************************************************************
	this.mostrarNotaCliente = function(){
		$("#modalCliente").modal();
		rc.nota = {};
		document.getElementById("cuentaNota").style.visibility = "hidden";
	};
	this.guardarNota = function(objeto){
		//console.log(objeto,"nota")
		objeto.perfil = "perfil"
		objeto.cliente_id = rc.objeto._id
		objeto.nombreCliente = rc.objeto.profile.nombreCompleto
		//objeto.respuesta = true;
		objeto.usuario_id = Meteor.userId();
		objeto.respuesta =  this.respuestaNotaCLiente	
		objeto.fecha = new Date()
	  objeto.hora = moment(objeto.fecha).format("hh:mm:ss a")
		objeto.estatus = true; //Significa esta Activa
		Notas.insert(objeto);
		toastr.success('Nota guardada.');
		rc.nota = {};
		$("#modalCliente").modal('hide');
	};
	this.quitarNota = function(id){
		var nota = Notas.findOne({_id:id});
		
		Notas.update({_id: id},{$set :  {estatus : false}});
		if (nota.tipo == "Cuenta") 
		{
			$("#myModal").modal('hide');
		}
		else
		{
			$("#notaPerfil").modal('hide');
		}
			
	}
	this.contestarNota = function(id){

		this.nota = Notas.findOne({_id:id});

		//console.log(this.nota)
		
		if (rc.notaCuenta1.respuestaNota != undefined) {
			//console.log("entro")
			this.nota.respuestaNota = rc.notaCuenta1.respuestaNota
			var idTemp = this.nota._id;
			delete this.nota._id;
			//this.nota.respuesta = false
			//this.nota.estatus = false
			Notas.update({_id:idTemp},{$set:this.nota});
			//toastr.success('Comentario guardado.');
			$("#myModal").modal('hide');
			rc.banderaContestar = true;
		}else{
			toastr.warning('Comentario vacio.');
		}

	};
	////*********************************************************************************************************************
	
	this.verPagos= function(credito) {

		rc.credito = credito;
		rc.credito_id = credito._id;
		$("#modalpagos").modal();
		credito.pagos = Pagos.find({credito_id: rc.getReactively("credito_id")}).fetch()
		rc.pagos = credito.pagos
		rc.openModal = true;
	};
	this.modalDoc= function(id){	
			console.log(id);
			loading(true);
	  	Meteor.call('getDocumentoCliente', id, function(error,result){
	      if (result)
	        {
	          loading(false);
	          var imagen = '<img class="img-responsive" src="'+result+'" style="margin:auto;">';
				    $('#imagenDiv').empty().append(imagen);
				    $("#myModalVerDocumento").modal('show');
	        }
	    });
 	};
	this.imprimirDoc= function(id)
	{

 		 	Meteor.call('getDocumentoCliente', id, function(error,result){
	      if (result)
        {

 		        	loading(true);
							Meteor.call('imprimirImagenDocumento', result,function(error, response) {
					       if(error)
					       {
					        console.log('ERROR :', error);
					        return;
					       }
					       else
					       {
						       		loading(false);
					              function b64toBlob(b64Data, contentType, sliceSize) {
					                  contentType = contentType || '';
					                  sliceSize = sliceSize || 512;
					                
					                  var byteCharacters = atob(b64Data);
					                  var byteArrays = [];
					                
					                  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
					                    var slice = byteCharacters.slice(offset, offset + sliceSize);
					                
					                    var byteNumbers = new Array(slice.length);
					                    for (var i = 0; i < slice.length; i++) {
					                      byteNumbers[i] = slice.charCodeAt(i);
					                    }
					                
					                    var byteArray = new Uint8Array(byteNumbers);
					                
					                    byteArrays.push(byteArray);
					                  }
					                    
					                  var blob = new Blob(byteArrays, {type: contentType});
					                  return blob;
					              }
					              
					              var blob = b64toBlob(response, "application/docx");
					              var url = window.URL.createObjectURL(blob);
					              
					              //console.log(url);
					              var dlnk = document.getElementById('dwnldLnk');
					
					              dlnk.download = "imagenDocumento.docx"; 
					              dlnk.href = url;
					              dlnk.click();       
					              window.URL.revokeObjectURL(url);
					  
					       }
					    });
 	 				}
			});
	 	
	 	
	 	
		/*
var html  = "<html><head>" +
        "</head>" +
        "<body  style ='-webkit-print-color-adjust:exact;'>"+
        "<img src=\"" + img + "\" onload=\"javascript:window.print();\"/>" +
        "</body>";
    var win = window.open("about:blank","_blank");
    win.document.write(html);
*/
	};
	this.cerrarModal= function() {
		rc.openModal = false

	};
  this.generarFicha= function(objeto) 
  {
	   Meteor.call('getPeople',objeto._id,objeto.profile.referenciasPersonales_ids.referenciaPersonal_id, function(error, result){           					
				if (result)
				{
	
					loading(true);
					rc.datosCliente = result.profile;
					
					Meteor.call('getFicha', rc.datosCliente, rc.referenciasPersonales, 'pdf', function(error, response) {

						   if(error)
						   {
						    console.log('ERROR :', error);
						    return;
						   }
						   else
						   {
							   	//console.log(response);
							 		downloadFile(response);
							 		loading(false);
							 }
					});
				}
		});
	}; 
	this.diarioCobranza= function(objeto) {

		//console.log(objeto,"objetillo")
		objeto.fechaInicial = objeto[0].fechaSolicito
		objeto.objetoFinal = objeto[objeto.length - 1];
		objeto.fechaFinal = objeto.objetoFinal.fechaSolicito
		//console.log(objeto,"actualizado")

	}
	this.mostrarModal= function()
	{
		$("#modalDocumento").modal();
	};
	this.almacenaImagen = function(imagen)
	{
		if (this.objeto)
			this.objeto.profile.foto = imagen;
		    this.imagenes.push({archivo:imagen})
		    //console.log(this.imagenes)

						
	}
	function obtenerClaseEstatus(valor){
		
		//console.log(valor);
		if (valor )
			 return "warning";
		else
			 return "info";  	
		
		
		/*
if(estatus == 0){
			return "danger";
		}else if(estatus == 1){
			return "warning";
		}else if(estatus == 2){
			return "primary";
		}else if(estatus == 3){
			return "danger";
		}else if(estatus == 4){
			return "info";
		}else if(estatus == 5){
			return "success";
		}else if(estatus == 6){
			return "danger";
		}
*/
	};	
	this.mostrarReestructuracion= function(objeto)
	{
			rc.creditoSeleccionado = objeto;	
			_.each(rc.creditoSeleccionado.planPagos,function(planPago){
					planPago.editar = false;
					//planPago.numeroPagos = rc.creditoSeleccionado.numeroPagos;
			});
			
			if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
	    		$scope.$apply();
			}
			$("#modalReestructuracion").modal('show');
	};
	this.agregarPago= function()
	{		
			var fecha = moment(new Date()); 
			
		
	    var nuevoPago = {
		    semana							: fecha.isoWeek(),
				fechaLimite					: new Date(new Date(fecha.toDate().getTime()).setHours(23,59,59)),
				diaSemana						: fecha.weekday(),
				tipoPlan						: rc.creditoSeleccionado.periodoPago,
				numeroPago					: rc.creditoSeleccionado.planPagos.length + 1,
				tipoCredito					: rc.credito.tipo, //si es vale o CP
				importeRegular			: 0,
				iva									: 0,
				interes 						: 0,
				seguro							: 0,
				cliente_id					: rc.creditoSeleccionado.cliente_id,
				capital 						: 0,
				fechaPago						: undefined,
				semanaPago					: undefined,
				diaPago							: undefined,
				pago								: 0,
				estatus							: 0,
				multada							: 0,
				multa_id						: undefined,
				planPago_id					: undefined,
				tiempoPago					: 0,
				modificada					: false,
				pagos 							: [],
				descripcion					: "Recibo",
				ultimaModificacion	: new Date(),
				credito_id 					: rc.creditoSeleccionado._id,
				mes									: fecha.get('month') + 1,
				anio								: fecha.get('year'),
				cargo								: 0,
				movimiento					: "Recibo",
				multa								:0,
				abono								:0,
				numeroPagos					: rc.creditoSeleccionado.planPagos.length + 1
	    };
	    rc.creditoSeleccionado.planPagos.push(nuevoPago);

	};
	this.guardarplanPagos= function()
	{		
			
			
			
 	    _.each(rc.creditoSeleccionado.planPagos,function(planPago){
					
					delete planPago.$$hashKey;

					if (planPago._id == undefined)
					{
						
							var suma = planPago.capital + planPago.iva + planPago.interes + planPago.seguro;
							
							planPago.importeRegular = suma;
							planPago.cargo = suma;
							
							try{
									
									PlanPagos.insert(planPago);		
														
									rc.creditoSeleccionado.saldoActual += suma;
									rc.creditoSeleccionado.numeroPagos = planPago.numeroPagos;
									Creditos.update({_id:rc.creditoSeleccionado._id},
																	{$set:{saldoActual : rc.creditoSeleccionado.saldoActual, 
																				 numeroPagos : rc.creditoSeleccionado.numeroPagos}
																	});
										
							}
							catch(err)
							{ 
										
							}
							
					}	
					else
					{
											
							//Actualizar numero de pagos de Credito, asi como el saldo del credito??
							var recibo = PlanPagos.findOne({_id : planPago._id});
							
							planPago.numeroPagos = rc.creditoSeleccionado.planPagos.length;
							
							var valor = 0;
							if (recibo.capital != planPago.capital || recibo.interes != planPago.interes || recibo.iva != planPago.iva || recibo.seguro != planPago.seguro)
							{
									//console.log("Recibo:",recibo);
									var suma = planPago.capital + planPago.iva + planPago.interes + planPago.seguro;
							
									
									planPago.importeRegular = suma;
									planPago.cargo = suma;
									
									//----------------------------------------------------------------------
									if (recibo.capital > planPago.capital) //Sumar al saldoActual
									{
											valor = recibo.capital - planPago.capital;
											rc.creditoSeleccionado.saldoActual -= valor;
									}		
									else if (recibo.capital < planPago.capital) //restar al saldoActual
									{
											valor = planPago.capital - recibo.capital
											rc.creditoSeleccionado.saldoActual += valor;
									}		
									//----------------------------------------------------------------------
									if (recibo.interes > planPago.interes) //Sumar al saldoActual
									{
											valor = recibo.interes - planPago.interes;
											rc.creditoSeleccionado.saldoActual -= valor;
									}		
									else if (recibo.interes < planPago.interes) //restar al saldoActual
									{
											valor = planPago.interes - recibo.interes
											rc.creditoSeleccionado.saldoActual += valor;
									}	
									//----------------------------------------------------------------------
									if (recibo.iva > planPago.iva) //Sumar al saldoActual
									{
											valor = recibo.iva - planPago.iva;
											rc.creditoSeleccionado.saldoActual -= valor;
									}		
									else if (recibo.iva < planPago.iva) //restar al saldoActual
									{
											valor = planPago.iva - recibo.iva
											rc.creditoSeleccionado.saldoActual += valor;
									}	
									//----------------------------------------------------------------------
									if (recibo.seguro > planPago.seguro) //Sumar al saldoActual
									{
											valor = recibo.seguro - planPago.seguro;
											rc.creditoSeleccionado.saldoActual -= valor;
									}		
									else if (recibo.seguro < planPago.seguro) //restar al saldoActual
									{
											valor = planPago.seguro - recibo.seguro
											rc.creditoSeleccionado.saldoActual += valor;
									}	
									//----------------------------------------------------------------------
									rc.creditoSeleccionado.numeroPagos = planPago.numeroPagos;
									Creditos.update({_id : rc.creditoSeleccionado._id},
																	{$set:{saldoActual : rc.creditoSeleccionado.saldoActual, 
																				 numeroPagos : rc.creditoSeleccionado.numeroPagos}
																	})
											
							}
							
							
							var tempId = planPago._id;
							delete planPago._id;
							planPago.credito = {};
							delete planPago.credito;
							
							delete planPago.$$hashKey;
							
							PlanPagos.update({_id:tempId}, {$set:planPago});		

					}
					
			});	
			toastr.success('Actualizado correctamente.');		

			
	};
	
	//--------------------------------------------------------------------
	this.getRecibos = function(credito_id)
	{
			rc.recibos = PlanPagos.find({credito_id: credito_id, descripcion: "Recibo"}).fetch();
					
	};
	this.crearCargoMoratorio = function()
	{
			rc.recibo._id= "";		
			rc.recibo.importe = 0.00;
			$("#modalCargosMoratorios").modal('show');
	};
	this.guardarCargoMoratorio = function(objeto)
	{	
		
			if (rc.recibo._id == "")
			{
					toastr.error('Debe de seleccionar un recibo.');	
					return;	
				
			}
			
			var c = Creditos.findOne({_id: objeto._id});
			
			var mfecha = moment(new Date());
			var pago = PlanPagos.findOne(rc.recibo._id);
			var multas = Number(rc.recibo.importe); 
			var iva = 0;
			var interes = 0;
			
			var multa = {
				semana							: mfecha.isoWeek(),
				fechaLimite					: pago.fechaLimite,
				diaSemana						: mfecha.weekday(),
				tipoPlan						: pago.tipoPlan,
				numeroPago					: pago.numeroPago,
				importeRegular			: multas,
				cliente_id					: pago.cliente_id,
				fechaPago						: undefined,
				semanaPago					: undefined,
				diaPago							: undefined,
				iva					  			: 0,
				interes 						: 0,
				seguro							: 0,
				capital 						: 0,
				pago				  			: 0,
				estatus							: 0,
				multada							: 0,
				multa 							: 0,
				multa_id						: undefined,
				planPago_id					: rc.recibo._id,
				tiempoPago					: 0,
				modificada					: false,
				pagos 							: [],
				descripcion					: "Cargo Moratorio",
				ultimaModificacion	: new Date(),
				credito_id 					: objeto.credito_id,
				mes									: mfecha.get('month') + 1,
				anio								: mfecha.get('year'),
				cargo								: multas,
				movimiento					: "Cargo Moratorio",
				tipoCargoMoratorio	: 2,	//Manual,
				tipoCredito					: "creditoP" //Si es Vale o CP
			};
			
			var creditoSeleccionado = Creditos.findOne(objeto.credito_id);
			//console.log(creditoSeleccionado);
						

			var multa_id = PlanPagos.insert(multa);
			PlanPagos.update({_id:rc.recibo._id},{$set:{multada : 1, multa_id : multa_id}})
			var suma = multas + iva + interes;
			creditoSeleccionado.saldoMultas += suma;
			creditoSeleccionado.saldoMultas = Math.round(creditoSeleccionado.saldoMultas * 100) / 100;
			Creditos.update({_id:objeto.credito_id},{$set:{saldoMultas:creditoSeleccionado.saldoMultas, estatus: 4}})

			$("#modalCargosMoratorios").modal('hide');
			toastr.success('Actualizado correctamente.');	
	};
	
	//--------------------------------------------------------------------
	
	this.modificar= function(pago)
	{		
			//console.log(pago);
	    pago.editar = true;
	};
	this.actualizar= function(pago)
	{		
	    pago.editar = false;
	};
	this.sumarPago = function(pago)
	{
			//console.log("entro a suman", pago);
			
			pago.importeRegular = pago.capital + pago.interes + pago.iva + pago.seguro;
			pago.cargo 					= pago.capital + pago.interes + pago.iva + pago.seguro;
			
			/*
				
			_.each(rc.creditoSeleccionado.planPagos,function(planPago){
					if(planPago._id == pago.numeroPago._id)
					{
							planPago.importeRegular = pago.capital + pago.interes + pago.iva + pago.seguro;
							planPago.cargo = pago.capital + pago.interes + pago.iva + pago.seguro;
					}		
			});	
*/
	}

	this.cerrar = function()
	{
		
			var planPagos = PlanPagos.find({},{sort : {numeroPago : 1, descripcion:-1}}).fetch();
			if(rc.creditos && rc.creditos.length > 0 && planPagos.length > 0){	
				_.each(rc.creditos, function(credito){
					credito.planPagos = [];
					credito.pagados = 0;
					credito.abonados = 0;
					credito.condonado = 0;
					credito.tiempoPago = 0;
					credito.pagos = 0;

					_.each(planPagos, function(pago){

						pago.credito = Creditos.findOne(credito._id);

						if(pago.descripcion=="Recibo"){
							credito.pagos +=pago.pago;
						}
						if(credito._id == pago.credito_id){
							pago.numeroPagos = credito.numeroPagos;
							credito.planPagos.push(pago);
							if(pago.estatus == 0){
								credito.pendientes++;
							}else if(pago.estatus == 1){
								credito.pagados++;
							}else if(pago.estatus == 2){
								credito.abonado++;
							}else if(pago.estatus == 3){
								credito.condonado++;
							}
							
							if(pago.multada == 1){
								credito.tiempoPago++;
							}
						}
					})
				})
			}
			
			rc.modalReestructuracion = false;

		
	}

	this.cambioEstatusRespuesta=function(){
		this.respuestaNotaCLiente = !this.respuestaNotaCLiente;
					
	}
	this.seleccionContrato=function(contrato){
		//console.log( contrato)
					
	}
	this.trance= function(credito)
	{
		    Meteor.call('numeroALetras',credito.capitalSolicitado, function(error, result){           					
					if (result)
					{
							rc.cantidad = result
					}			
			});
		};
	this.getAvales= function(credito)
	{
				
	};

	this.imprimirContratos = function(contrato,cliente){
			
			var avales = [];
	 		if (contrato.avales_ids.length > 0) {
					rc.avalpapu = contrato.avales_ids[0].aval_id
	        Meteor.call('obAvales',rc.avalpapu, function(error, result){           					
						if (result)
						{
								rc.avalesCliente = result.profile
								avales = rc.avalesCliente
					    }
					});
		  }	
			contrato.tipoInteres = TiposCredito.findOne(contrato.tipoCredito_id)
			
			
	    Meteor.call('getPeople',cliente,contrato._id, function(error, result){           					
				if (result)
				{
					rc.datosCliente = result.profile;
					
					var _credito = {
						cliente									: contrato.nombre,
						tipoCredito_id 					: contrato.tipoCredito_id,
						fechaSolicito 					: new Date(),
						duracionMeses 					: contrato.duracionMeses,
						capitalSolicitado 			: contrato.capitalSolicitado,
						adeudoInicial 					: 0,
						saldoActual 						: 0,
						periodoPago 						: contrato.periodoPago,
						fechaPrimerAbono 				: contrato.fechaPrimerAbono,
						multasPendientes 				: 0,
						saldoMultas 						: 0.00,
						saldoRecibo 						: 0.00,
						estatus 								: 1,
						requiereVerificacion		: contrato.requiereVerificacion,
						sucursal_id 						: Meteor.user().profile.sucursal_id,
						fechaVerificacion				: contrato.fechaVerificacion,
						turno										: contrato.turno,
						tasa										: contrato.tasa,
						conSeguro 							: contrato.conSeguro,
						seguro									: contrato.seguro
					};
					
					Meteor.call("generarPlanPagos",_credito,rc.cliente,function(error,result){

						if (result)
						{
								//console.log("Plan Pagos", result);
								loading(true);
								Meteor.call('contratos', contrato, contrato._id,rc.datosCliente, result, avales, function(error, response) {
								   if(error)
								   {
									    console.log('ERROR :', error);
									    return;
								   }
								   else
								   {
									   	loading(false);
							 				function b64toBlob(b64Data, contentType, sliceSize) {
												  contentType = contentType || '';
												  sliceSize = sliceSize || 512;
												
												  var byteCharacters = atob(b64Data);
												  var byteArrays = [];
												
												  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
												    var slice = byteCharacters.slice(offset, offset + sliceSize);
												
												    var byteNumbers = new Array(slice.length);
												    for (var i = 0; i < slice.length; i++) {
												      byteNumbers[i] = slice.charCodeAt(i);
												    }
												
												    var byteArray = new Uint8Array(byteNumbers);
												
												    byteArrays.push(byteArray);
												  }
												    
												  var blob = new Blob(byteArrays, {type: contentType});
												  return blob;
											}
											
											var blob = b64toBlob(response, "application/docx");
										  var url = window.URL.createObjectURL(blob);
										  

											//CONTRATO SIMPLE ////////////////////////////////////////////////////
										  if (_.isEmpty(contrato.garantias) && _.isEmpty(contrato.avales_ids)) {

												  if (contrato.tipoInteres.tipoInteres == "Simple") {
													  var dlnk = document.getElementById('dwnldLnk');
												    dlnk.download = "CONTRATOINTERES.docx"; 
														dlnk.href = url;
														dlnk.click();		    
													  window.URL.revokeObjectURL(url);
													}
												  if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
													  var dlnk = document.getElementById('dwnldLnk');
												    dlnk.download = "CONTRATOINTERESSSI.docx"; 
														dlnk.href = url;
														dlnk.click();		    
													  window.URL.revokeObjectURL(url);
													}
													if (contrato.tipoInteres.tipoInteres == "Compuesto") {
													  var dlnk = document.getElementById('dwnldLnk');
												    dlnk.download = "CONTRATOINTERESCOMPUESTO.docx"; 
														dlnk.href = url;
														dlnk.click();		    
													  window.URL.revokeObjectURL(url);
													}
											}
											////////////////////////////////////////////////////////////////////////////////////////////////////
											///////CONTRATO SOLIDARIO//////////////////////////////////////////
				
											if (contrato.avales_ids.length > 0 && _.isEmpty(contrato.garantias)) {		
													if (contrato.tipoInteres.tipoInteres == "Simple") {
														var dlnk = document.getElementById('dwnldLnk');
												    dlnk.download = "CONTRATOOBLIGADOSOLIDARIO.docx"; 
														dlnk.href = url;
														dlnk.click();		    
													  window.URL.revokeObjectURL(url);
												  }
												  if (contrato.tipoInteres.tipoInteres == "Compuesto") {
														var dlnk = document.getElementById('dwnldLnk');
												    dlnk.download = "CONTRATOOBLIGADOSOLIDARIOCOMPUESTO.docx"; 
														dlnk.href = url;
														dlnk.click();		    
													  window.URL.revokeObjectURL(url);
												  }
												  if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
														var dlnk = document.getElementById('dwnldLnk');
												    dlnk.download = "CONTRATOOBLIGADOSOLIDARIOSSI.docx"; 
														dlnk.href = url;
														dlnk.click();		    
													  window.URL.revokeObjectURL(url);
													}
				
										}
											if (contrato.garantias && contrato.tipoGarantia == "general") {
												//console.log("HIPOTECARIO","INTERES:",contrato.tipoInteres.tipoInteres)
												if (contrato.tipoInteres.tipoInteres == "Simple") {
												var dlnk = document.getElementById('dwnldLnk');
										    dlnk.download = "CONTRATOHIPOTECARIO.docx"; 
												dlnk.href = url;
												dlnk.click();		    
											  window.URL.revokeObjectURL(url);
											}
											if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
												var dlnk = document.getElementById('dwnldLnk');
										    dlnk.download = "CONTRATOHIPOTECARIOSSI.docx"; 
												dlnk.href = url;
												dlnk.click();		    
											  window.URL.revokeObjectURL(url);
											}
											if (contrato.tipoInteres.tipoInteres == "Compuesto") {
												var dlnk = document.getElementById('dwnldLnk');
										    dlnk.download = "CONTRATOHIPOTECARIOCOMPUESTO.docx"; 
												dlnk.href = url;
												dlnk.click();		    
											  window.URL.revokeObjectURL(url);
											}
				
										}
											if (contrato.garantias && contrato.tipoGarantia == "mobiliaria") {
												//console.log("PRENDARIA","INTERES:",contrato.tipoInteres.tipoInteres)
												if (contrato.tipoInteres.tipoInteres == "Simple") {
													var dlnk = document.getElementById('dwnldLnk');
											    dlnk.download = "CONTRATOGARANTIAPRENDARIA.docx"; 
													dlnk.href = url;
													dlnk.click();		    
												  window.URL.revokeObjectURL(url);
												}
												if (contrato.tipoInteres.tipoInteres == "Compuesto") {
													var dlnk = document.getElementById('dwnldLnk');
											    dlnk.download = "CONTRATOGARANTIAPRENDARIACOMPUESTO.docx"; 
													dlnk.href = url;
													dlnk.click();		    
												  window.URL.revokeObjectURL(url);
												}
												if (contrato.tipoInteres.tipoInteres == "Saldos Insolutos") {
													var dlnk = document.getElementById('dwnldLnk');
											    dlnk.download = "CONTRATOGARANTIAPRENDARIASSI.docx"; 
													dlnk.href = url;
													dlnk.click();		    
												  window.URL.revokeObjectURL(url);
												}
											}
										}//else
								});//meteorcontratos							
						}
					});	
				}
			});
	};

	this.recuperarCredito= function(id)
	{
	    var r = confirm("Selecciona una opción");
	    if (r == true) {
	        var objeto = Creditos.findOne({_id:id});
				if (objeto.estatus == 3)
					objeto.estatus = 1;
				else if (objeto.estatus == 6) 
					objeto.estatus = 0;
				else
					objeto.estatus = 3; 	
				
				Creditos.update({_id: id},{$set :  {estatus : objeto.estatus}});

				toastr.success('Crédito Recuperado');
	    } else {
       
	   	}		
	};
	this.CreditoSolicitar= function(id)
	{
			//console.log(rc.cargosMoratorios);
			
			if (Number(parseFloat(rc.cargosMoratorios.toFixed(2))) > 0 )
			{
					toastr.error("No es posible hacer una nueva solicitud ya que tiene Cargos Moratorios");
					return;
			}
			else	
    			$state.go("root.generadorPlan",{objeto_id : id});
	    
	};
	this.btnCerrar= function()
	{

    	rc.btnCerrarRespuesta = false
	  
	    // ui-sref="root.generadorPlan({objeto_id : cd.objeto._id})"
	};

	this.imprimirHistorial= function(objeto,cliente,credito, saldoMultas, abonosRecibos, abonosCargorMoratorios, saldoGeneral) 
  {
	    cliente = rc.datosCliente;
	    objeto.objetoFinal = objeto[objeto.length - 1];
			loading(true);
			Meteor.call('imprimirHistorial', objeto, cliente, credito, 'pdf', rc.saldoMultas, rc.abonosRecibos, rc.abonosCargorMoratorios, rc.saldoGeneral, rc.sumaNotaCredito, function(error, response) {
	
				   if(error)
				   {
				    console.log('ERROR :', error);
				    return;
				   }
				   else
				   {
					   	//console.log(response);
					 		downloadFile(response);
					 		loading(false);
					 }
			});		    
  };  

  this.obtenerGente= function(objeto)
	{		
		//console.log(objeto,"Cliente")
		    Meteor.call('getPeople',objeto._id, function(error, result){           					
				if (result)
				{

					rc.datosCliente = result.profile

					   //console.log("cliente",rc.datosCliente)
	 
			  }
		});
	    
	};
	
	this.editarNotaModal= function(valor)
	{
    	rc.editarNota = valor;
	};
	this.actualizarNota= function(objeto)	
	{
			Notas.update({_id: objeto._id}, {$set: {descripcion : objeto.descripcion, fecha: new Date()}} )
			rc.editarNota = false;			
	};
	
	this.cancelarNotaCredito = function(id)	
	{
			customConfirm('¿Estás seguro de cancelar la nota de crédito ?', function() {
					NotasCredito.update({_id: id}, {$set: {estatus : 4} } )		
			});	
	};
		

/*
	$(document).ready(function() {

	  $('.po-markup').popover({
	    trigger: 'hover',
	    html: true,  
	    
	    title: function() {
	      return $(this).parent().find('.po-title').html();
	    },
	    content: function() {
	      return $(this).parent().find('.po-body').html();
	    },
	
	    container: 'body',
	    placement: 'right'
	  });
	
	});
*/
	
	  	
	
}