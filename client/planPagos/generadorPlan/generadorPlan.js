angular
.module("creditoMio")
.controller("GeneradorPlanCtrl", GeneradorPlanCtrl);
function GeneradorPlanCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	window.rc = rc;

	this.tablaAmort = false;

	this.nuevoBotonPago = true;
	this.action = false;
	this.actionAval = true;
	this.actionGarantia = true;
	this.fechaActual = new Date();
	this.nuevoBotonReestructuracion = true;
	this.nuevoBotonCredito = true;
	
	this.cliente_id = "";
	rc.sucursalCliente = "";
	this.planPagos = [];
	this.credito = {};
	this.pago = {};

	this.con = 0;
	this.num = 0;
	this.avales = [];
	rc.aval = {};
	this.conG = 0;
	this.numG = 0;
	this.conGen = 0;
	this.numGen = 0;
	
	this.garantias = [];
	this.garantiasGeneral = [];
	this.garantia = {};
  
  this.cliente = {};
	this.buscar = {};
	this.buscar.nombre = "";
	this.buscando = false;
	this.personasTipos = [];
	this.personas_ids = [];
	
	//rc.avalesH = [];
	
	rc.ocupacion = "";
	
	
	this.subscribe('buscarAvales', () => {
		if(this.getReactively("buscar.nombre").length > 3){
			this.buscando = true;
			return [{
		    options : { limit: 20 },
		    where : { 
					nombreCompleto : this.getReactively('buscar.nombre')
				} 		   
	    }];
		}
		else if (this.getReactively("buscar.nombre").length  == 0 )
		{
			this.buscando = false;
			rc.avalesH = [];
		}	
  });
	

	this.subscribe("planPagos", ()=>{
		return [{ cliente_id : $stateParams.objeto_id }]
	});

	
	this.subscribe("tiposCredito", ()=>{
		return [{ estatus : true, sucursal_id : Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "" }]
	});
	
	this.subscribe('cliente', () => {
		return [{ _id : $stateParams.objeto_id }];
	});
	
	this.subscribe('creditos', () => {
		return [{ cliente_id : $stateParams.objeto_id }];
	});
	
	this.subscribe('pagos', () => {
		return [{ estatus:true}];
	});
	
	this.subscribe('estadoCivil', () => {
		return [{estatus: true}];
	});
	this.subscribe('ocupaciones', () => {
		return [{estatus: true}];
	});


	
	this.helpers({
		avalesHelper : () => {
			var aval = Avales.find({
		  	"profile.nombreCompleto": { '$regex' : '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' }
			}, { sort : {"nombreCompleto" : 1 }}).fetch();
						
			return aval;
		},
		cliente : () => {
			var cliente = Meteor.users.findOne($stateParams.objeto_id);
			//console.log(cliente,"el cliente paps")
			if (true) {}

			return  cliente
		},
		tiposCredito : () => {
			return TiposCredito.find();
		},
		pagos : () => {
			return Pagos.find();
		},
		estadosCiviles : () => {
      return EstadoCivil.find();
    },
		ocupaciones : () => {
      return Ocupaciones.find();
    },

/*
		creditos: () => {
			var cred = Creditos.find({}).fetch();
			
			if (cred != undefined)
			{

					_.each(cred, function(c){
						if (c.avales_ids != undefined && c.avales_ids.length > 0)
						{

								_.each(c.avales_ids, function(aval){
										console.log(aval.aval_id)
										Meteor.call("getAval",aval.aval_id,function(error,result){
											
											if(error){
												console.log(error);

											}
											if (result)
											{
												console.log(result);
												rc.avalesH.push(result);
												$scope.$apply();
											}
												
										})
								});		
						}	
					});
					console.log("AVALE:", rc.avalesH);
						
				
			}	

		}	
*/		
		
	});
	
	this.nuevoPago = function()
	{
		this.nuevoBotonPago = !this.nuevoBotonPago;
		this.nuevoBotonReestructuracion = true;
		this.nuevoBotonCredito = true;
		this.action = !this.action;
		this.pago = {};
		$('#collapseReestructuracion').collapse('hide');
		$('#collapseNuevoCredito').collapse('hide');
	};
  
	this.nuevaReestructuracion = function()
	{
		this.nuevoBotonPago = true;
		this.nuevoBotonReestructuracion = !this.nuevoBotonReestructuracion;
		this.nuevoBotonCredito = true;
		this.modificacion = {};		
		this.action = false;
		$('#collapseNuevoPago').collapse('hide');
		$('#collapseNuevoCredito').collapse('hide');
	};
  
	this.nuevoCredito = function()
	{
		this.nuevoBotonPago = true;
		this.nuevoBotonReestructuracion = true;
		this.nuevoBotonCredito = !this.nuevoBotonCredito;
		this.modificacion = {};
		this.action = false;
		$('#collapseNuevoPago').collapse('hide');
		$('#collapseReestructuracion').collapse('hide');
	};

	
	/*
this.tieneFoto = function(sexo, foto){
		if(foto === undefined){
			if(sexo === "Masculino")
				return "img/badmenprofile.jpeg";
			else if(sexo === "Femenino"){
				return "img/badgirlprofile.jpeg";
			}else{
				return "img/badprofile.jpeg";
			}
		}else{
			return foto;
		}
	}
*/
	  
	this.generarPlanPagos = function(credito, form){

		if(form.$invalid){
			toastr.error('Error al calcular el nuevo plan de pagos, llene todos los campos.');
			return;
		}
		rc.planPagos = [];
		this.tablaAmort = true;
		if (rc.cliente.roles == "Distribuidor") {
			this.credito.periodoPago = "Quincenal"
		}
		if(rc.credito.requiereVerificacion == true)
			rc.credito.estatus = 0;
		else
			rc.credito.estatus = 1;
			
		if (!this.credito.requiereVerificacion)
				this.credito.turno = "";
			  Meteor.call("getSucursal",rc.cliente.profile.sucursal_id, function(error,result){
			if (result)
			{
					//console.log(result,"sucursal bebe");
					//rc.sucursalCliente.push(result);
					//console.log(rc.sucursalCliente,"sucursal del cliente");
						if (rc.cliente.roles == "Distribuidor") {
						console.log("distri")
						rc.credito.tasa = result.tasaVales
						
						console.log(rc.credito.tipoCredito_id)
					}else if (rc.cliente.roles == "Cliente") {
						console.log("clientaso")
						rc.credito.tasa = rc.credito.tasa
						
			
					}
			
			if (rc.cliente.roles == "Distribuidor") {
				rc.credito.tipoCredito_id = rc.tiposCredito[0]._id

			}

			var _credito = {
				cliente_id : rc.cliente._id,
				tipoCredito_id : rc.credito.tipoCredito_id,
				fechaSolicito : new Date(),
				duracionMeses : rc.credito.duracionMeses,
				capitalSolicitado : rc.credito.capitalSolicitado,
				adeudoInicial : rc.credito.capitalSolicitado,
				saldoActual : rc.credito.capitalSolicitado,
				periodoPago : rc.credito.periodoPago,
				fechaPrimerAbono : rc.credito.primerAbono,
				multasPendientes : 0,
				saldoMultas : 0.00,
				saldoRecibo : 0.00,
				estatus : 1,
				requiereVerificacion: rc.credito.requiereVerificacion,
				turno : rc.credito.turno,
				sucursal_id : Meteor.user().profile.sucursal_id,
				fechaVerificacion: rc.credito.fechaVerificacion,
				turno: rc.credito.turno,
				tasa: rc.credito.tasa,
				conSeguro : rc.credito.conSeguro,
				seguro: rc.credito.seguro
			};  
			 console.log(_credito,"creditoJaime")
			 Meteor.call("generarPlanPagos",_credito,rc.cliente,function(error,result){
		
			if(error){
				console.log(error);
				toastr.error('Error al calcular el nuevo plan de pagos.');
			}
			else{
				_.each(result,function (pago) {
					rc.planPagos.push(pago)
					$scope.$apply();
				});
			}
				
		})

		}

		
		});
		

		
		
		return rc.planPagos;
	}
	
// 	this.generarCredito = function(form){
		
// 		if(form.$invalid){
// 				toastr.error("Error al guardar la solicitud de crédito, llene todos los campos.");
// 				return;
// 		}	
// 		if (rc.cliente.profile.renta == true && this.avales.length == 0 && rc.cliente.roles != "Distribuidor")		
// 		{
// 				toastr.error("Error, el cliente es de renta favor de agregar un AVAL.");
// 				return;
// 		}	

// 		if (rc.cliente.roles == "Distribuidor") {
// 			this.credito.periodoPago = "Quincenal"

// 		}
// 	    Meteor.call("getSucursal",rc.cliente.profile.sucursal_id, function(error,result){
// 		if (result)
// 		{
// 			//console.log(result,"sucursal bebe");
// 			//rc.sucursalCliente.push(result);
// 			//console.log(rc.sucursalCliente,"sucursal del cliente");
		
// 		if (rc.cliente.roles == "Distribuidor") {
// 			rc.credito.tasa = result.tasaVales
// 			rc.credito.tiposCredito_id = rc.tiposCredito[0]._id
// 		}else if (rc.cliente.roles == "Cliente") {
// 			rc.credito.tasa = rc.credito.tasa
// 			rc.credito.tiposCredito_id = rc.credito.tiposCredito_id 

// 		}

// 		}
// 	/*
	
// 		this.credito.periodoPago = "Quincenal";
// 	  Meteor.call("getSucursal",rc.cliente.profile.sucursal_id, function(error,result){
// 		if (result)
// 		{
// */

		
// 		var credito = {
// 			cliente_id : rc.cliente._id,
// 			tipoCredito_id : rc.credito.tipoCredito_id,
// 			fechaSolicito : new Date(),
// 			duracionMeses : rc.credito.duracionMeses,
// 			capitalSolicitado : rc.credito.capitalSolicitado,
// 			adeudoInicial : rc.credito.capitalSolicitado,
// 			saldoActual : rc.credito.capitalSolicitado,
// 			periodoPago : rc.credito.periodoPago,
// 			fechaPrimerAbono : rc.credito.primerAbono,
// 			multasPendientes : 0,
// 			saldoMultas : 0.00,
// 			saldoRecibo : 0.00,
// 			estatus : 1,
// 			requiereVerificacion: rc.credito.requiereVerificacion,
// 			sucursal_id : Meteor.user().profile.sucursal_id,
// 			fechaVerificacion: rc.credito.fechaVerificacion,
// 			turno : rc.credito.turno,
// 			tipoGarantia : rc.credito.tipoGarantia,
// 			tasa: rc.credito.tasa,
// 			conSeguro : rc.credito.conSeguro,
// 			seguro: rc.credito.seguro,
// 		//};
			
			
// 		//console.log(credito);
				
// 		credito.avales = angular.copy(rc.avales);
		
// 		//Duda se guardan los dos???
		
// 		if (rc.credito.tipoGarantia == "mobiliaria")
// 				credito.garantias = angular.copy(rc.garantias);
// 		else
// 				credito.garantias = angular.copy(rc.garantiasGeneral);
				
				
// 				if (Meteor.user().roles = "Distribuidor") {
// 					credito.tipo = "vale"
// 				}else if (Meteor.user().roles = "Cliente") {
// 					credito.tipo == "creditoP"
// 				}
// 		//Cambie el metodo	

// 		Meteor.apply('generarCreditoPeticion', [rc.cliente, credito], function(error, result){
// 			if(result == "hecho"){
// 				toastr.success('Se ha guardado la solicitud de crédito correctamente');
// 				rc.planPagos = [];
// 				rc.avales = [];
// 				if (rc.cliente.roles == "Distribuidor") {
// 					$state.go("root.distribuidoresDetalle",{objeto_id : rc.cliente._id});
// 				}
// 				if (rc.cliente.roles == "Cliente") {
// 					$state.go("root.clienteDetalle",{objeto_id : rc.cliente._id});
// 				}
				
// 			}
// 			$scope.$apply();
// 			/////////////////AQUI
// 		});
// 			}
						
// 				})
// 	}
	this.generarCredito = function(form){
		
		if(form.$invalid){
				toastr.error("Error al guardar la solicitud de crédito, llene todos los campos.");
				return;
		}	
		if (rc.cliente.profile.renta == true && this.avales.length == 0 && rc.cliente.roles != "Distribuidor")		
		{
				toastr.error("Error, el cliente es de renta favor de agregar un AVAL.");
				return;
		}	
		if (rc.cliente.roles == "Distribuidor") {
			this.credito.periodoPago = "Quincenal"
		}
	  Meteor.call("getSucursal",rc.cliente.profile.sucursal_id, function(error,result){
			if (result)
			{
					console.log(result,"sucursal bebe");
					rc.sucursalCredito = result
					//////////////////////// EL METODO DEBE IR ASI PAPU

	  	if (rc.cliente.roles == "Distribuidor") {
			console.log("distri")
			rc.credito.tasa = rc.sucursalCredito.tasaVales
			rc.credito.tipo = "vale"
			rc.credito.tipoCredito_id = rc.tiposCredito[0]._id
			console.log(rc.credito.tipoCredito_id)
		}else if (rc.cliente.roles == "Cliente") {
			console.log("clientaso")
			rc.credito.tipo = "creditoP"
			rc.credito.tasa = rc.credito.tasa

		}
	 
		
		var credito = {
			cliente_id : rc.cliente._id,
			tipoCredito_id : rc.credito.tipoCredito_id,
			fechaSolicito : new Date(),
			duracionMeses : rc.credito.duracionMeses,
			capitalSolicitado : rc.credito.capitalSolicitado,
			adeudoInicial : rc.credito.capitalSolicitado,
			saldoActual : rc.credito.capitalSolicitado,
			periodoPago : rc.credito.periodoPago,
			fechaPrimerAbono : rc.credito.primerAbono,
			multasPendientes : 0,
			saldoMultas : 0.00,
			saldoRecibo : 0.00,
			estatus : 1,
			requiereVerificacion: rc.credito.requiereVerificacion,
			sucursal_id : Meteor.user().profile.sucursal_id,
			fechaVerificacion: rc.credito.fechaVerificacion,
			turno : rc.credito.turno,
			tipoGarantia : rc.credito.tipoGarantia,
			tasa: rc.credito.tasa,
			conSeguro : rc.credito.conSeguro,
			seguro: rc.credito.seguro,
			tipo : rc.credito.tipo,
			beneficiado : rc.credito.beneficiado
		};
		
		//console.log(credito,"mi credito")
		
		if (rc.cliente.roles == "Distribuidor") {

			rc.credito.tipo = "vale"
			rc.credito.tipoCredito_id = rc.tiposCredito[0]._id ///No me gusta

			credito.estatus = 2;
		}
		else if (rc.cliente.roles == 'Cliente') {

			rc.credito.tipo = "creditoP"
		}
		
				
		credito.avales = angular.copy(rc.avales);
		
		//Duda se guardan los dos???
		
		if (rc.credito.tipoGarantia == "mobiliaria")
				credito.garantias = angular.copy(rc.garantias);
		else
				credito.garantias = angular.copy(rc.garantiasGeneral);
				

		//Cambie el metodo	

			Meteor.apply('generarCreditoPeticion', [rc.cliente, credito], function(error, result){
				if(result == "hecho"){
					toastr.success('Se ha guardado la solicitud de crédito correctamente');
					rc.planPagos = [];
					rc.avales = [];
					if (rc.cliente.roles == "Distribuidor") {
						$state.go("root.distribuidoresDetalle",{objeto_id : rc.cliente._id});
					}
					if (rc.cliente.roles == "Cliente") {
						$state.go("root.clienteDetalle",{objeto_id : rc.cliente._id});
					}
					
				}
				$scope.$apply();
				/////////////////AQUI
			});
		}
		
		});
		
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////
	this.insertarAval = function()
	{
			if (rc.aval.nombre == undefined || rc.aval.parentesco == undefined || rc.aval.tiempoConocerlo == undefined || rc.aval.parentesco == "" || rc.aval.tiempoConocerlo == "")
			{
					toastr.warning("Favor de agregar al datos del Aval, Parentesco y Tiempo de Conocerlo...");
					return;					

			}
		
			rc.aval.num = this.avales.length + 1;
			rc.aval.estatus = "N";
			this.avales.push(rc.aval);
			
			rc.aval={};
	};
	
	this.actualizarAval = function(a)
	{
		a.num = this.num;
		_.each(this.avales, function(av){
			if (av.num == a.num)
			{
				av.nombre 							= a.nombre;
				av.estadoCivil 					= a.estadoCivil;
				av.ocupacion 						= a.ocupacion;
				av.calle 								= a.calle;
			  av.numero 							= a.numero;
				av.codigoPostal 				= a.codigoPostal;			
				av.direccion 						= a.direccion;
				av.empresa 							= a.empresa;
				av.puesto 							= a.puesto;
				av.tiempoLaborando 			= a.tiempoLaborando;
				av.calleEmpresa 				= a.calleEmpresa;
			  av.numeroEmpresa 				= a.numeroEmpresa;
				av.codigoPostalEmpresa 	= a.codigoPostalEmpresa;
				av.parentesco 					= a.parentesco;
				av.tiempoConocerlo 			= a.tiempoConocerlo;
			}
		})
		this.aval={};
		this.num = 0;
		this.actionAval = true;
	};
	
	this.cancelarAval = function()
	{
		rc.aval={};
		this.num = -1;
		this.actionAval = true;
	};
	
	this.quitarAval = function(numero)
	{
		pos = functiontofindIndexByKeyValue(this.avales, "num", numero);
		this.avales.splice(pos, 1);
		if (this.avales.length == 0)
			this.con = 0;
 
	    functiontoOrginiceNum(this.avales, "num");
	};
	
	this.editarAval = function(a)
	{
		
		rc.aval.nombre = a.nombre;
		rc.aval.apellidoPaterno = a.apellidoPaterno;
		rc.aval.apellidoMaterno = a.apellidoMaterno;
		rc.aval.estadoCivil = a.estadoCivil;
		rc.aval.estadoCivil_id = a.estadoCivil_id;
		
		rc.aval.ocupacion = a.ocupacion;			
		rc.aval.ocupacion_id = a.ocupacion_id;			
		
		rc.aval.calle = a.calle;
		rc.aval.numero = a.numero;
		rc.aval.codigoPostal = a.codigoPostal;
		rc.aval.empresa = a.empresa;
		rc.aval.calleEmpresa = a.calleEmpresa;
		rc.aval.numeroEmpresa = a.numeroEmpresa;
		rc.aval.codigoPostalEmpresa = a.codigoPostalEmpresa;
		rc.aval.puesto = a.puesto;
		rc.aval.tiempoLaborando = a.tiempoLaborando;
		rc.aval.direccionEmpresa = a.direccionEmpresa;
		rc.aval.parentesco = a.parentesco;
		rc.aval.tiempoConocerlo = a.tiempoConocerlo;
		
		this.num = a.num;
	  this.actionAval = false;
	};
	
	this.verAval = function(a)
	{
		//console.log(a,"aval p")
		$("#modalAval").modal('show');
		rc.aval.nombre = a.nombre;
		if (a.apellidoPaterno == undefined) {
			a.apellidoPaterno = ""
		}
		if (a.apellidoMaterno == undefined) {
			a.apellidoMaterno = ""
		}
		rc.aval.nombreCompleto= a.nombre + " " + a.apellidoPaterno + " " + a.apellidoMaterno
		rc.aval.estadoCivil = a.estadoCivil;
		rc.aval.ocupacion = a.ocupacion;			
		rc.aval.calle = a.calle;
		rc.aval.numero = a.numero;
		rc.aval.codigoPostal = a.codigoPostal;
		rc.aval.empresa = a.empresa;
		rc.aval.puesto = a.puesto;
		rc.aval.tiempoLaborando = a.tiempoLaborando;
		rc.aval.direccionEmpresa = a.direccionEmpresa;
		rc.aval.parentesco = a.parentesco;
		rc.aval.tiempoConocerlo = a.tiempoConocerlo;
		rc.aval.foto =a.foto
	
	};
	
	this.borrarReferencia = function()
	{
			rc.aval.nombre = "";
			rc.aval.apellidoPaterno = "";
			rc.aval.apellidoMaterno = "";
			rc.aval.estadoCivil = "";
			rc.aval.ocupacion = "";
			rc.aval.calle = "";
			rc.aval.numero = "";
			rc.aval.codigoPostal = "";
			rc.aval.parentesco = "";
			rc.aval.tiempoLaborando = "";
			rc.aval.empresa = "";
			rc.aval.puesto = "";
			rc.aval.antiguedad = "";
			rc.aval.direccionEmpresa = "";
			rc.aval.tiempoConocerlo = "";
			delete rc.aval["_id"];

	};
	
	this.AgregarAval = function(a){
		
		
		rc.aval.nombre = a.profile.nombre;
		rc.aval.apellidoPaterno = a.profile.apellidoPaterno;
		rc.aval.apellidoMaterno = a.profile.apellidoMaterno;
		
		var nombre = a.profile.nombre != undefined ? a.profile.nombre + " " : "";
    var apPaterno = a.profile.apellidoPaterno != undefined ? a.profile.apellidoPaterno + " " : "";
    var apMaterno = a.profile.apellidoMaterno != undefined ? a.profile.apellidoMaterno : "";
    
		
		Meteor.call('getAval', a._id, function(error, result){
			if(result){		
					
					rc.aval.nombreCompleto 			= nombre + apPaterno + apMaterno;						
					rc.aval.ocupacion 					= result.ocupacion;
					rc.aval.ocupacion_id 				= result.ocupacion_id;
					rc.aval.calle 							= result.calle;
					rc.aval.numero 							= result.numero;
					rc.aval.codigoPostal 				= result.codigoPostal;
					rc.aval.estadoCivil 				= result.estadoCivil;
					rc.aval.estadoCivil_id 			= result.estadoCivil_id;
					rc.aval.empresa 						= result.empresa.nombre;
					rc.aval.calleEmpresa 				= result.empresa.calle;
					rc.aval.numeroEmpresa 			= result.empresa.numero;
					rc.aval.codigoPostalEmpresa = result.empresa.codigoPostal;
					rc.aval.direccionEmpresa 		= result.empresa.calle + " Num:" + result.empresa.numero + " CP:" + result.empresa.codigoPostal;
					rc.aval.puesto 							= result.puesto;
					rc.aval.tiempoLaborando 		= result.tiempoLaborando;
					$scope.$apply();
			}
		});
		
		this.buscar.nombre = ""
		rc.aval._id = a._id;
		
	};
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
	this.insertarGarantia = function(tipo)
	{
			if (tipo == "mobiliaria")
			{				
					this.conG = this.conG + 1;
					this.garantia.num = this.conG;
					
					this.garantias.push(this.garantia);	
					this.garantia={};
			}
			else
			{
					this.conGen = this.conGen + 1;
					this.garantia.num = this.conGen;
					
					this.garantiasGeneral.push(this.garantia);	
					this.garantia={};
			}
				
	};
	
	this.actualizarGarantia = function(tipo, a)
	{
			if (tipo == "mobiliaria")
			{
					a.num = this.numG;
			
					_.each(this.garantias, function(av){
						if (av.num == a.num)
						{
							av.descripcion = a.descripcion;
							av.caracteristicas = a.caracteristicas;
							av.avaluo = a.avaluo;			
							av.prestamoPorcentaje = a.prestamoPorcentaje;
							av.prestamo = a.prestamo;
							av.monto = a.monto;
							av.porcentaje = a.porcentaje;
							av.fechaComercializacion = a.fechaComercializacion;
							av.fechaFiniquito = a.fechaFiniquito;
						}
					})
				
					this.garantia = {};
					this.numG = 0;
					this.actionGarantia = true;
			}
			else
			{
					a.num = this.numGen;
			
					_.each(this.garantiasGeneral, function(av){
						if (av.num == a.num)
						{
							

							av.medidasColindancias = a.medidasColindancias
						    av.terrenoYconstruccion = a.terrenoYconstruccion
						    av.prestamoSobreAvaluo = a.prestamoSobreAvaluo
						    av.prestamo = a.prestamo
						    av.num = a.num
						    av.montoAvaluo = a.montoAvaluo
							av.avaluo = a.avaluo;
							av.comisionGastos = a.comisionGastos;
							av.escrituracion = a.escrituracion;
							av.porcentajePrestamo = a.porcentajePrestamo;
						}
					})
				
					this.garantia = {};
					this.numGen = 0;
					this.actionGarantia = true;		
			}
					
	};
	
	this.cancelarGarantia = function(tipo)
	{
			if (tipo == "mobiliaria")
			{
					this.garantia={};
					this.numG = -1;
					this.actionGarantia = true;
			}
			else
			{
					this.garantia={};
					this.numGen = -1;
					this.actionGarantia = true;
			}		
	};
	
	this.quitarGarantia = function(tipo, numero)
	{
			if (tipo == "mobiliaria")
			{
					pos = functiontofindIndexByKeyValue(this.garantias, "num", numero);
					this.garantias.splice(pos, 1);
					if (this.garantias.length == 0) 
						this.con = 0;
			 
					functiontoOrginiceNum(this.garantias, "num");
			}
			else
			{
					pos = functiontofindIndexByKeyValue(this.garantiasGeneral, "num", numero);
					this.garantiasGeneral.splice(pos, 1);
					if (this.garantiasGeneral.length == 0) 
						this.con = 0;
			 
					functiontoOrginiceNum(this.garantiasGeneral, "num");		
				
			}
					
	};
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
	this.fechaPago = function(diaSeleccionado, periodoPago)
	{		
			
			var date = moment();
			var diaActual = date.day();		
			var fecha = new Date();
			var dif = diaActual - diaSeleccionado;
			
			if (periodoPago == "Semanal")
			{
					if (diaActual > diaSeleccionado)
					{
							if (dif < 4)
							{
									if (dif == 1)
											fecha.setDate(fecha.getDate() + 6);
									else if (dif == 2)
											fecha.setDate(fecha.getDate() + 5);					
									else if (dif == 3)
											fecha.setDate(fecha.getDate() + 4);
							}
							else
							{
									if (dif == 4)
											fecha.setDate(fecha.getDate() + 10);
									else if (dif == 5)
											fecha.setDate(fecha.getDate() + 9);
							}
		
					} 
					else if (diaSeleccionado > diaActual)
					{
							if (Math.abs(dif) < 4)
							{
									if (dif == 1 || dif == -1)
											fecha.setDate(fecha.getDate() + 8);
									else if (dif == 2 || dif ==-2)
											fecha.setDate(fecha.getDate() + 9);					
									else if (dif == 3 || dif ==-3)
											fecha.setDate(fecha.getDate() + 10);
							}
							else 
									fecha.setDate(fecha.getDate() + Math.abs(dif));
						
					} else
							fecha.setDate(fecha.getDate() + 7);
							
					rc.credito.primerAbono = fecha;
			}
			else if (periodoPago == "Quincenal")
			{
						//Hacer los calculos
			}
			else if (periodoPago == "Mensual")
			{
					//Hacer los calculos
			}	
	};
	
	this.editarGarantia = function(tipo, a)
	{ 

			if (tipo == "mobiliaria")
			{
					this.garantia.descripcion = a.descripcion;
					this.garantia.caracteristicas = a.caracteristicas;
					this.garantia.avaluo = a.avaluo;			
					this.garantia.prestamoPorcentaje = a.prestamoPorcentaje;
					this.garantia.prestamo = a.prestamo;
					this.garantia.monto = a.monto;
					this.garantia.porcentaje = a.porcentaje;
					this.garantia.fechaComercializacion = a.fechaComercializacion;
					this.garantia.fechaFiniquito = a.fechaFiniquito;					
				
					this.actionGarantia = false;
			}
			else
			{
				    this.garantia.medidasColindancias = a.medidasColindancias
				    this.garantia.terrenoYconstruccion = a.terrenoYconstruccion
				    this.garantia.prestamoSobreAvaluo = a.prestamoSobreAvaluo
				    this.garantia.prestamo = a.prestamo
				    this.garantia.num = a.num
				    this.garantia.montoAvaluo = a.montoAvaluo
					this.garantia.avaluo = a.avaluo;
					this.garantia.comisionGastos = a.comisionGastos;
					this.garantia.escrituracion = a.escrituracion;
					this.garantia.porcentajePrestamo = a.porcentajePrestamo;
					
					this.actionGarantia = false;
			}		
	};

	this.verGarantia = function(tipo,a)
	{
		//console.log(a,"aval p")
		$("#modalGarantia").modal('show');
				if (tipo == "mobiliaria")
			{
				this.mob = true
					this.garantia.descripcion = a.descripcion;
					this.garantia.caracteristicas = a.caracteristicas;
					this.garantia.avaluo = a.avaluo;			
					this.garantia.prestamoPorcentaje = a.prestamoPorcentaje;
					this.garantia.prestamo = a.prestamo;
					this.garantia.monto = a.monto;
					this.garantia.porcentaje = a.porcentaje;
					this.garantia.fechaComercializacion = a.fechaComercializacion;
					this.garantia.fechaFiniquito = a.fechaFiniquito;					
				
					this.actionGarantia = false;
			}
			else
			{		this.general = true
				    this.garantia.medidasColindancias = a.medidasColindancias
				    this.garantia.terrenoYconstruccion = a.terrenoYconstruccion
				    this.garantia.prestamoSobreAvaluo = a.prestamoSobreAvaluo
				    this.garantia.prestamo = a.prestamo
				    this.garantia.num = a.num
				    this.garantia.montoAvaluo = a.montoAvaluo
					this.garantia.avaluo = a.avaluo;
					this.garantia.comisionGastos = a.comisionGastos;
					this.garantia.escrituracion = a.escrituracion;
					this.garantia.porcentajePrestamo = a.porcentajePrestamo;
					
					this.actionGarantia = false;
			}	
	
	};
	
	//busca un elemento en el arreglo
	function functiontofindIndexByKeyValue(arraytosearch, key, valuetosearch) {
	    for (var i = 0; i < arraytosearch.length; i++) {
	    	if (arraytosearch[i][key] == valuetosearch) {
				return i;
			}
	    
	  }
	    return null;
  };
    
    //Obtener el mayor
	function functiontoOrginiceNum(arraytosearch, key) {
		var mayor = 0;
	    for (var i = 0; i < arraytosearch.length; i++) {
	    	arraytosearch[i][key] = i + 1;	
	    }
  };

  this.borrarBotonImprimir= function()
	{
		var printButton = document.getElementById("printpagebutton");
		 printButton.style.visibility = 'hidden';
		 window.print()
		 printButton.style.visibility = 'visible';
		
	};

	this.imprecion = function(print){

		  var printContents = document.getElementById(print).innerHTML;
		  var popupWin = window.open('', '_blank', 'width=300,height=300');
		  popupWin.document.open();
		  popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
		  popupWin.document.close();
		 // setTimeout(function(){popupWin.print();},1000);

    };
  
  this.cerrarGArantia = function(tipo){
    	if (tipo == "mobiliaria")
			{
					this.garantia={};
					this.numG = -1;
					this.actionGarantia = true;
			}
			else
			{
					this.garantia={};
					this.numGen = -1;
					this.actionGarantia = true;
			}	

		  

    };
	
	
	

};