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
	this.beneficiario = {};

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
	this.buscar.nombreBeneficiario = "";
	this.buscando = false;
	this.personasTipos = [];
	this.personas_ids = [];
	
	rc.editarBeneficiario = false;
	
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
  
  this.subscribe('buscarBeneficiarios', () => {
		if(this.getReactively("buscar.nombreBeneficiario").length > 3){
			this.buscando = true;
			return [{
		    options : { limit: 20 },
		    where : { 
					nombreCompleto : this.getReactively('buscar.nombreBeneficiario')
				} 		   
	    }];
		}
		else if (this.getReactively("buscar.nombreBeneficiario").length  == 0 )
		{
			this.buscando = false;
			rc.beneficiarios = [];
		}	
  });
	
	this.subscribe("configuraciones", ()=>{
		return [{}]
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
		beneficiarios : () => {
			var b = Beneficiarios.find({
		  	"nombreCompleto": { '$regex' : '.*' + this.getReactively('buscar.nombreBeneficiario') || '' + '.*', '$options' : 'i' }
			}, { sort : {"nombreCompleto" : 1 }}).fetch();
						
			return b;
		},
		cliente : () => {
			var c = Meteor.users.findOne($stateParams.objeto_id);
			
			if (c != undefined) {
				
				
				if (c.roles[0] == "Distribuidor")
				{
						//console.log(c);
						this.credito.conSeguro = true;
						this.credito.seguro = 8;
				}
				
				return  c;
			}
			
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

	this.generarPlanPagos = function(credito, form){

		if(form.$invalid){
			toastr.error('Error al calcular el nuevo plan de pagos, llene todos los campos.');
			return;
		}
		rc.planPagos = [];
		this.tablaAmort = true;
		
		var usuario = Meteor.users.findOne(Meteor.userId());
		if (usuario.roles[0] == "Cajero" && (credito.tasa < usuario.profile.tasaMinima || credito.tasa > usuario.profile.tasaMaxima) && rc.cliente.roles != "Distribuidor")
		{
				toastr.warning('La tasa no es válida. debe ser entre ' + usuario.profile.tasaMinima + " y " +  usuario.profile.tasaMaxima);
				return;	
		}
		
		if (rc.cliente.roles == "Distribuidor") {
			this.credito.periodoPago = "Quincenal"
		}
		if(rc.credito.requiereVerificacion == true)
			rc.credito.estatus = 0;
		else
			rc.credito.estatus = 1;
			
		if (!this.credito.requiereVerificacion)
				this.credito.turno = "";
				
		var fechaPrimerAbono = new Date();
	
		if (rc.cliente.roles == "Distribuidor") {
				
				var configuracion = Configuraciones.findOne();
				
				_.each(configuracion.arregloTasa, function(elemento){

						if (rc.credito.capitalSolicitado == elemento.cantidad){
								
								switch(rc.credito.duracionMeses){
									case "3": rc.credito.tasa = elemento.seis; break;
									case "4": rc.credito.tasa = elemento.ocho; break;
									case "5": rc.credito.tasa = elemento.diez; break;
									case "6": rc.credito.tasa = elemento.doce; break;
									case "7": rc.credito.tasa = elemento.catorce; break;
									case "8": rc.credito.tasa = elemento.dieciseis; break;
								}										
						}	
						
				});
				
				if (rc.credito.tasa == 0)
				{
						toastr.warning("No se puede hacer un vale con tasa 0");
						return;
				}
				
				_.each(rc.tiposCredito, function(tc){
						if (tc.tipoInteres == "Simple")
								rc.credito.tipoCredito_id = tc._id;
				});
				
				var n = fechaPrimerAbono.getDate();
				if (n >= 5 && n < 20)
				{
						fechaPrimerAbono = new Date(fechaPrimerAbono.getFullYear(),fechaPrimerAbono.getMonth(),1,0,0,0,0);		
				}
				else 
				{
						if (n < 5)
								fechaPrimerAbono = new Date(fechaPrimerAbono.getFullYear(),fechaPrimerAbono.getMonth(),16,0,0,0,0);
						else if (n >= 20)
						   	fechaPrimerAbono = new Date(fechaPrimerAbono.getFullYear(),fechaPrimerAbono.getMonth() + 1,16,0,0,0,0);								
				}
			
		}else if (rc.cliente.roles == "Cliente") {
				rc.credito.tasa = rc.credito.tasa;
		}

		var _credito = {
			cliente_id 							: rc.cliente._id,
			tipoCredito_id 					: rc.credito.tipoCredito_id,
			fechaSolicito  					: new Date(),
			duracionMeses  					: Number(rc.credito.duracionMeses),
			capitalSolicitado 			: Number(rc.credito.capitalSolicitado),
			adeudoInicial 					: Number(rc.credito.capitalSolicitado),
			saldoActual 						: Number(rc.credito.capitalSolicitado),
			periodoPago 						: rc.credito.periodoPago,
			fechaPrimerAbono 				: fechaPrimerAbono,
			multasPendientes 				: 0,
			saldoMultas 						: 0.00,
			saldoRecibo 						: 0.00,
			estatus 								: 1,
			requiereVerificacion		: rc.credito.requiereVerificacion,
			turno 									: rc.credito.turno,
			sucursal_id 						: Meteor.user().profile.sucursal_id,
			fechaVerificacion				: rc.credito.fechaVerificacion,
			turno										: rc.credito.turno,
			tasa 										: rc.credito.tasa,
			conSeguro 							: rc.credito.conSeguro,
			seguro									: rc.credito.seguro
		};  

		 //console.log(_credito,"creditoJaime")Para no mandarle todos los datos del cliente
		 
		var cli = {};
		cli._id = rc.cliente._id; 
		 
		Meteor.call("generarPlanPagos",_credito, cli, function(error,result){
	
				if(error){
					console.log(error);
					toastr.error('Error al calcular el nuevo plan de pagos.');
				}
				else{
					/*
_.each(result,function (pago) {
						
						rc.planPagos.push(pago)
						$scope.$apply();
					});
*/

					_.each(result,function (pago) {
							var pag = pago
							var pa = _.toArray(pag);
		
							var all = pa[pa.length - 1]
							rc.total = all
		
							rc.planPagos.push(pago)
							$scope.$apply();
						});
						
						var total = rc.total;
						//console.log(total,"total")
						_.each(rc.planPagos,function (pago) {
							
							pago.liquidar = total;  						
							total -= Number(parseFloat(pago.importeRegular).toFixed(2));
							
							total = Number(parseFloat(total).toFixed(2));
							
							//console.log(total,"liquidar")
										
							$scope.$apply();
						});
					
					
				}
		});

		return rc.planPagos;
	}
	
	this.generarCredito = function(form){
		
		if(form.$invalid){
				toastr.error("Error al guardar la solicitud, llene todos los campos.");
				return;
		}	
		if (rc.cliente.profile.renta == true && this.avales.length == 0 && rc.cliente.roles != "Distribuidor")		
		{
 				customConfirm('El Cliente es de renta, O sin Avales, ¿Desea continuar con la solicitud?', function() {		    	
		    		 rc.credentials = {};
   				 	 $("#modalActivarFecha").modal();
 		    });
  		  return;
		}	
		
		
		var usuario = Meteor.users.findOne(Meteor.userId());
		if (usuario.roles[0] == "Cajero" && (rc.credito.tasa < usuario.profile.tasaMinima || rc.credito.tasa > usuario.profile.tasaMaxima) && rc.cliente.roles != "Distribuidor")
		{
				toastr.warning('La tasa no es válida. debe ser entre ' + usuario.profile.tasaMinima + " y " +  usuario.profile.tasaMaxima);
				return;	
		}
		
		if (rc.cliente.roles == "Distribuidor") {
			this.credito.periodoPago = "Quincenal";
			
			if (rc.beneficiario == undefined || rc.beneficiario.nombreCompleto == undefined)
			{
					toastr.error("Seleccione un beneficiario.");
					return;					
			}
			
		}

		loading(true);
  	if (rc.cliente.roles == "Distribuidor") {
	  	
			var configuracion = Configuraciones.findOne();
	
			_.each(configuracion.arregloTasa, function(elemento){
					
					if (rc.credito.capitalSolicitado == elemento.cantidad){
								
							switch(rc.credito.duracionMeses){
								case "3": rc.credito.tasa = elemento.seis; break;
								case "4": rc.credito.tasa = elemento.ocho; break;
								case "5": rc.credito.tasa = elemento.diez; break;
								case "6": rc.credito.tasa = elemento.doce; break;
								case "7": rc.credito.tasa = elemento.catorce; break;
								case "8": rc.credito.tasa = elemento.dieciseis; break;
							}										
					}	
			});
			
			rc.credito.tipo = "vale";
			
			if (rc.credito.tasa == 0)
			{
					toastr.warning("No se puede hacer un vale con tasa 0");
					return;
			}
			
			_.each(rc.tiposCredito, function(tc){
						if (tc.tipoInteres == "Simple")
								rc.credito.tipoCredito_id = tc._id;
			});
			
			//rc.credito.tipoCredito_id = rc.tiposCredito[0]._id;
			
			var fechaPrimerAbono = new Date();
			var n = fechaPrimerAbono.getDate();
			if (n >= 5 && n < 20)
			{
					fechaPrimerAbono = new Date(fechaPrimerAbono.getFullYear(),fechaPrimerAbono.getMonth(),1,0,0,0,0);		
			}
			else 
			{
					if (n < 5)
							fechaPrimerAbono = new Date(fechaPrimerAbono.getFullYear(),fechaPrimerAbono.getMonth(),16,0,0,0,0);
					else if (n >= 20)
					   	fechaPrimerAbono = new Date(fechaPrimerAbono.getFullYear(),fechaPrimerAbono.getMonth() + 1,16,0,0,0,0);								
			}
			
			rc.credito.primerAbono = fechaPrimerAbono;

		}else if (rc.cliente.roles == "Cliente") {

			rc.credito.tipo = "creditoP";
			rc.credito.tasa = rc.credito.tasa;

		}

		var credito = {
			cliente_id 								: rc.cliente._id,
			tipoCredito_id 						: rc.credito.tipoCredito_id,
			fechaSolicito 						: new Date(),
			duracionMeses 						: Number(rc.credito.duracionMeses),
			capitalSolicitado 				: Number(rc.credito.capitalSolicitado),
			adeudoInicial 						: Number(rc.credito.capitalSolicitado),
			saldoActual 							: Number(rc.credito.capitalSolicitado),
			periodoPago 							: rc.credito.periodoPago,
			fechaPrimerAbono 					: rc.credito.primerAbono,
			multasPendientes 					: 0,
			saldoMultas 							: 0.00,
			saldoRecibo 							: 0.00,
			estatus 									: 1,
			requiereVerificacion			: rc.credito.requiereVerificacion,
			requiereVerificacionAval	: rc.credito.requiereVerificacionAval,
			sucursal_id 							: Meteor.user().profile.sucursal_id,
			fechaVerificacion					: rc.credito.fechaVerificacion,
			turno 										: rc.credito.turno,
			tipoGarantia 							: rc.credito.tipoGarantia,
			tasa											: rc.credito.tasa,
			conSeguro 								: rc.credito.conSeguro,
			seguro										: rc.credito.seguro,
			tipo 											: rc.credito.tipo,
			beneficiario_id 					: rc.beneficiario._id
		};

		if (rc.cliente.roles == "Distribuidor") {

			rc.credito.tipo = "vale"
			//rc.credito.tipoCredito_id = rc.tiposCredito[0]._id ///No me gusta
			
			_.each(rc.tiposCredito, function(tc){
						if (tc.tipoInteres == "Simple")
								rc.credito.tipoCredito_id = tc._id;
			});

			credito.estatus = 1;
		}
		else if (rc.cliente.roles == 'Cliente') {

			rc.credito.tipo = "creditoP";
			
			credito.avales = angular.copy(rc.avales);
		
			//Duda se guardan los dos???
			
			if (rc.credito.tipoGarantia == "mobiliaria")
					credito.garantias = angular.copy(rc.garantias);
			else
					credito.garantias = angular.copy(rc.garantiasGeneral);
				
		}

		//Cambie el metodo	
		
		Meteor.apply('generarCreditoPeticion', [credito], function(error, result){
			if(result == "hecho"){
				toastr.success('Se ha guardado la solicitud correctamente');
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
			
			loading(false);

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
					//a.num = this.numG;
			
					_.each(this.garantias, function(av){
						if (av.num == a.num)
						{
							av.almacenaje = a.almacenaje;
							av.comercializacion = a.comercializacion;
							av.desempenioExtemporaneo = a.desempenioExtemporaneo;
							av.reposicionContrato = a.reposicionContrato;
							av.descripcion = a.descripcion;
							av.caracteristicas = a.caracteristicas;
							av.avaluoMobiliaria = a.avaluoMobiliaria;			
							av.porcentajePrestamoMobiliria = a.porcentajePrestamoMobiliria;
							/*
							av.prestamo = a.prestamo;
							av.monto = a.monto;
							av.porcentaje = a.porcentaje;
							av.fechaComercializacion = a.fechaComercializacion;
							av.fechaFiniquito = a.fechaFiniquito;
							*/
						}
					})
				
					this.garantia = {};
					this.numG = 0;
					this.actionGarantia = true;
			}
			else
			{
					//a.num = this.numGen;
			
					_.each(this.garantiasGeneral, function(av){
						if (av.num == a.num)
						{
							//av.num = a.num;
							av.terrenoYconstruccion = a.terrenoYconstruccion;
							av.avaluoGeneral = a.avaluoGeneral;
							av.ubicacion = a.ubicacion;
							av.porcentajePrestamoGeneral = a.porcentajePrestamoGeneral;
							av.medidasColindancias = a.medidasColindancias;						  
							av.comisionGastos = a.comisionGastos;
							
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
						this.conG = 0;
					else
						this.conG = this.conG - 1;	
			 
					functiontoOrginiceNum(this.garantias, "num");
			}
			else
			{
					pos = functiontofindIndexByKeyValue(this.garantiasGeneral, "num", numero);
					this.garantiasGeneral.splice(pos, 1);
					if (this.garantiasGeneral.length == 0) 
						this.conGen = 0;
					else
						this.conGen = this.conGen - 1;
						
					functiontoOrginiceNum(this.garantiasGeneral, "num");		
				
			}
					
	};
	
	this.copiarGarantia = function(tipo, garantia)
	{
			
			if (tipo == "mobiliaria")
			{				
					this.conG = this.conG + 1;
					garantia.num = this.conG;
					
					this.garantias.push(garantia);	
					this.garantia={};
			}
			else
			{
					this.conGen = this.conGen + 1;
					garantia.num = this.conGen;
					
					this.garantiasGeneral.push(garantia);	
					this.garantia={};
			}
			
			$("#modalCopiarRespaldos").modal('hide');	
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
					
					this.garantia.num 												= a.num;
					this.garantia.almacenaje 									= a.almacenaje;
					this.garantia.comercializacion 						= a.comercializacion;
					this.garantia.desempenioExtemporaneo 			= a.desempenioExtemporaneo;
					this.garantia.reposicionContrato 					= a.reposicionContrato;
																										
					this.garantia.descripcion 								= a.descripcion;
					this.garantia.caracteristicas 						= a.caracteristicas;
					this.garantia.avaluoMobiliaria 						= a.avaluoMobiliaria;			
					this.garantia.porcentajePrestamoMobiliria = a.porcentajePrestamoMobiliria;
					/*

					this.garantia.prestamo = a.prestamo;
					this.garantia.monto = a.monto;
					this.garantia.porcentaje = a.porcentaje;
					this.garantia.fechaComercializacion = a.fechaComercializacion;
					this.garantia.fechaFiniquito = a.fechaFiniquito;					
				
					*/
					this.actionGarantia = false;
			}
			else
			{
					this.garantia.num = a.num;
			    this.garantia.medidasColindancias = a.medidasColindancias;
			    this.garantia.terrenoYconstruccion = a.terrenoYconstruccion;
			    this.garantia.ubicacion = a.ubicacion;
			    this.garantia.avaluoGeneral = a.avaluoGeneral;
			    this.garantia.porcentajePrestamoGeneral = a.porcentajePrestamoGeneral;
			    this.garantia.comisionGastos = a.comisionGastos;
			    
					/*
				 	this.garantia.prestamoSobreAvaluo = a.prestamoSobreAvaluo
			    this.garantia.prestamo = a.prestamo
			    
			    this.garantia.montoAvaluo = a.montoAvaluo
					
					*/
					
					//this.garantia.escrituracion = a.escrituracion;
					
					
					this.actionGarantia = false;
			}		
	}; 

	this.verGarantia = function(tipo,a)
	{
		//console.log(tipo)
		$("#modalGarantia").modal('show');
			
			if (tipo == "mobiliaria")
			{
					this.mob = true;
					this.general = false;
					
					this.garantia.num 												= a.num;
					this.garantia.almacenaje 									= a.almacenaje;
					this.garantia.comercializacion 						= a.comercializacion;
					this.garantia.desempenioExtemporaneo 			= a.desempenioExtemporaneo;
					this.garantia.reposicionContrato 					= a.reposicionContrato;
					
					
					this.garantia.descripcion 								= a.descripcion;
					this.garantia.caracteristicas 						= a.caracteristicas;
					this.garantia.avaluoMobiliaria 						= a.avaluoMobiliaria;			
					this.garantia.porcentajePrestamoMobiliria = a.porcentajePrestamoMobiliria;

					this.actionGarantia = false;
			}
			else
			{		
					this.general = true;
					this.mob = false;
			    this.garantia.num = a.num
			    this.garantia.terrenoYconstruccion = a.terrenoYconstruccion;
			    this.garantia.ubicacion = a.ubicacion;
			    this.garantia.medidasColindancias = a.medidasColindancias;
			    this.garantia.avaluoGeneral = a.avaluoGeneral;
			    this.garantia.porcentajePrestamoGeneral = a.porcentajePrestamoGeneral;
			    
			    this.garantia.comisionGastos = a.comisionGastos;
					
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
	
	this.calcularPorcentajeGeneral = function(){

    	if (rc.garantia.avaluoGeneral != undefined)
					rc.garantia.porcentajePrestamoGeneral = Number(parseFloat(rc.credito.capitalSolicitado * 100 / rc.garantia.avaluoGeneral).toFixed(2));
			else 
					rc.garantia.porcentajePrestamoGeneral = 0;

  };
  
  this.calcularPorcentajeMobiliaria = function(){

    	if (rc.garantia.avaluoMobiliaria != undefined)
					rc.garantia.porcentajePrestamoMobiliria = Number(parseFloat(rc.credito.capitalSolicitado * 100 / rc.garantia.avaluoMobiliaria).toFixed(2));
			else 
					rc.garantia.porcentajePrestamoMobiliria = 0;
  };
	
	this.mostrarModalValidarBeneficiado = function()
	{
		$("#modalvalidaBeneficiario").modal();
	};
	
	this.validaCredenciales = function(credenciales)
	{
			var usuario = Meteor.users.findOne(Meteor.userId());
	    Meteor.call('validarCredenciales', credenciales, usuario.profile.sucursal_id , function(err, result) {
	      if (result) {
	        
	        	//var usuario = Meteor.users.findOne(Meteor.userId());
						if (usuario.roles[0] == "Cajero" && (rc.credito.tasa < usuario.profile.tasaMinima || rc.credito.tasa > usuario.profile.tasaMaxima) && rc.cliente.roles != "Distribuidor")
						{
								toastr.warning('La tasa no es válida. debe ser entre ' + usuario.profile.tasaMinima + " y " +  usuario.profile.tasaMaxima);
								return;	
						}
						
						if (rc.cliente.roles == "Distribuidor") {
							this.credito.periodoPago = "Quincenal";
							
							if (rc.beneficiario == undefined || rc.beneficiario.nombreCompleto == undefined)
							{
									toastr.error("Seleccione un beneficiario.");
									return;					
							}
							
						}
				
						loading(true);
				  	if (rc.cliente.roles == "Distribuidor") {
					  	
							var configuracion = Configuraciones.findOne();
					
							_.each(configuracion.arregloTasa, function(elemento){
									
									if (rc.credito.capitalSolicitado == elemento.cantidad){
												
											switch(rc.credito.duracionMeses){
												case "3": rc.credito.tasa = elemento.seis; break;
												case "4": rc.credito.tasa = elemento.ocho; break;
												case "5": rc.credito.tasa = elemento.diez; break;
												case "6": rc.credito.tasa = elemento.doce; break;
												case "7": rc.credito.tasa = elemento.catorce; break;
												case "8": rc.credito.tasa = elemento.dieciseis; break;
											}										
									}	
							});
							
							rc.credito.tipo = "vale";
							
							if (rc.credito.tasa == 0)
							{
									toastr.warning("No se puede hacer un vale con tasa 0");
									return;
							}
							
							_.each(rc.tiposCredito, function(tc){
										if (tc.tipoInteres == "Simple")
												rc.credito.tipoCredito_id = tc._id;
							});
							
							//rc.credito.tipoCredito_id = rc.tiposCredito[0]._id;
							
							var fechaPrimerAbono = new Date();
							var n = fechaPrimerAbono.getDate();
							if (n >= 5 && n < 20)
							{
									fechaPrimerAbono = new Date(fechaPrimerAbono.getFullYear(),fechaPrimerAbono.getMonth(),1,0,0,0,0);		
							}
							else 
							{
									if (n < 5)
											fechaPrimerAbono = new Date(fechaPrimerAbono.getFullYear(),fechaPrimerAbono.getMonth(),16,0,0,0,0);
									else if (n >= 20)
									   	fechaPrimerAbono = new Date(fechaPrimerAbono.getFullYear(),fechaPrimerAbono.getMonth() + 1,16,0,0,0,0);								
							}
							
							rc.credito.primerAbono = fechaPrimerAbono;
				
						}
				  	else if (rc.cliente.roles == "Cliente") {
				
							rc.credito.tipo = "creditoP";
							rc.credito.tasa = rc.credito.tasa;
				
						}
				
						var credito = {
							cliente_id 								: rc.cliente._id,
							tipoCredito_id 						: rc.credito.tipoCredito_id,
							fechaSolicito 						: new Date(),
							duracionMeses 						: Number(rc.credito.duracionMeses),
							capitalSolicitado 				: Number(rc.credito.capitalSolicitado),
							adeudoInicial 						: Number(rc.credito.capitalSolicitado),
							saldoActual 							: Number(rc.credito.capitalSolicitado),
							periodoPago 							: rc.credito.periodoPago,
							fechaPrimerAbono 					: rc.credito.primerAbono,
							multasPendientes 					: 0,
							saldoMultas 							: 0.00,
							saldoRecibo 							: 0.00,
							estatus 									: 1,
							requiereVerificacion			: rc.credito.requiereVerificacion,
							requiereVerificacionAval	: rc.credito.requiereVerificacionAval,
							sucursal_id 							: Meteor.user().profile.sucursal_id,
							fechaVerificacion					: rc.credito.fechaVerificacion,
							turno 										: rc.credito.turno,
							tipoGarantia 							: rc.credito.tipoGarantia,
							tasa											: rc.credito.tasa,
							conSeguro 								: rc.credito.conSeguro,
							seguro										: rc.credito.seguro,
							tipo 											: rc.credito.tipo,
							beneficiario_id 					: rc.beneficiario._id
						};
				
						if (rc.cliente.roles == "Distribuidor") {
				
							rc.credito.tipo = "vale"
							rc.credito.tipoCredito_id = rc.tiposCredito[0]._id ///No me gusta
				
							credito.estatus = 1;
						}
						else if (rc.cliente.roles == 'Cliente') {
				
							rc.credito.tipo = "creditoP";
							
							credito.avales = angular.copy(rc.avales);
						
							//Duda se guardan los dos???
							
							if (rc.credito.tipoGarantia == "mobiliaria")
									credito.garantias = angular.copy(rc.garantias);
							else
									credito.garantias = angular.copy(rc.garantiasGeneral);
								
						}
				
						//Cambie el metodo	
						
						Meteor.apply('generarCreditoPeticion', [credito], function(error, result){
							if(result == "hecho"){
								
								$('#modalActivarFecha').modal('hide');
								if ($('.modal-backdrop').is(':visible')) {
								  $('body').removeClass('modal-open'); 
								  $('.modal-backdrop').remove(); 
								};
								
								toastr.success('Se ha guardado la solicitud correctamente');
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
							
							loading(false);
				
				});
	        	
	        	
	        /*
var usuario = Meteor.users.findOne(Meteor.userId());
					if (usuario.roles[0] == "Cajero" && (rc.credito.tasa < usuario.profile.tasaMinima || rc.credito.tasa > usuario.profile.tasaMaxima) && rc.cliente.roles != "Distribuidor")
					{
							toastr.warning('La tasa no es válida. debe ser entre ' + usuario.profile.tasaMinima + " y " +  usuario.profile.tasaMaxima);
							return;	
					}
					
					if (rc.cliente.roles == "Distribuidor") {
						this.credito.periodoPago = "Quincenal"
					}
					
					//loading(true);
			
			  	if (rc.cliente.roles == "Distribuidor") {
				  	
				  	var configuracion = Configuraciones.findOne();

						_.each(configuracion.arregloTasa, function(elemento){
								
								if (credito.duracionMeses == elemento.mes){
										rc.credito.tasa = elemento.tasa;												
								}	
								
						});
				  	
						//rc.credito.tasa = rc.sucursalCredito.tasaVales;
						
						
						rc.credito.tipo = "vale";
						rc.credito.tipoCredito_id = rc.tiposCredito[0]._id;
						
						var fechaPrimerAbono = new Date();
						var n = fechaPrimerAbono.getDate();
						if (n >= 5 && n < 20)
						{
								fechaPrimerAbono = new Date(fechaPrimerAbono.getFullYear(),fechaPrimerAbono.getMonth(),1,0,0,0,0);		
						}
						else 
						{
								if (n < 5)
										fechaPrimerAbono = new Date(fechaPrimerAbono.getFullYear(),fechaPrimerAbono.getMonth(),16,0,0,0,0);
								else if (n >= 20)
								   	fechaPrimerAbono = new Date(fechaPrimerAbono.getFullYear(),fechaPrimerAbono.getMonth() + 1,16,0,0,0,0);								
						}
						
						rc.credito.primerAbono = fechaPrimerAbono;

					}
			  	else if (rc.cliente.roles == "Cliente") {

						rc.credito.tipo = "creditoP";
						rc.credito.tasa = rc.credito.tasa;
					}
		
					var credito = {
						cliente_id 								: rc.cliente._id,
						tipoCredito_id 						: rc.credito.tipoCredito_id,
						fechaSolicito 						: new Date(),
						duracionMeses 						: Number(rc.credito.duracionMeses),
						capitalSolicitado 				: Number(rc.credito.capitalSolicitado),
						adeudoInicial 						: Number(rc.credito.capitalSolicitado),
						saldoActual 							: Number(rc.credito.capitalSolicitado),
						periodoPago 							: rc.credito.periodoPago,
						fechaPrimerAbono 					: rc.credito.primerAbono,
						multasPendientes 					: 0,
						saldoMultas 							: 0.00,
						saldoRecibo 							: 0.00,
						estatus 									: 1,
						requiereVerificacion			: rc.credito.requiereVerificacion,
						requiereVerificacionAval	: rc.credito.requiereVerificacionAval,
						sucursal_id 							: Meteor.user().profile.sucursal_id,
						fechaVerificacion					: rc.credito.fechaVerificacion,
						turno 										: rc.credito.turno,
						tipoGarantia 							: rc.credito.tipoGarantia,
						tasa											: rc.credito.tasa,
						conSeguro 								: rc.credito.conSeguro,
						seguro										: rc.credito.seguro,
						tipo 											: rc.credito.tipo,
						beneficiado 							: rc.credito.beneficiado
					};
		
 					if (rc.cliente.roles == "Distribuidor") {
			
						rc.credito.tipo = "vale"
						rc.credito.tipoCredito_id = rc.tiposCredito[0]._id ///No me gusta
			
						credito.estatus = 1;
					}
					else if (rc.cliente.roles == 'Cliente') {
			
						rc.credito.tipo = "creditoP";
						
						credito.avales = angular.copy(rc.avales);
					
						//Duda se guardan los dos???
						
						if (rc.credito.tipoGarantia == "mobiliaria")
								credito.garantias = angular.copy(rc.garantias);
						else
								credito.garantias = angular.copy(rc.garantiasGeneral);
							
					}

				//Cambie el metodo	
		
					Meteor.apply('generarCreditoPeticion', [rc.cliente, credito], function(error, result){
						if(result == "hecho"){
							//$("#modalActivarFecha").modal('hide');
							
							$('#modalActivarFecha').modal('hide');
							if ($('.modal-backdrop').is(':visible')) {
							  $('body').removeClass('modal-open'); 
							  $('.modal-backdrop').remove(); 
							};
							
							toastr.success('Se ha guardado la solicitud correctamente');
							rc.planPagos = [];
							rc.avales = [];
							if (rc.cliente.roles == "Distribuidor") {
								$state.go("root.distribuidoresDetalle",{objeto_id : rc.cliente._id});
							}
							if (rc.cliente.roles == "Cliente") {
								$state.go("root.clienteDetalle",{objeto_id : rc.cliente._id});
							}
							
						}
							
					});
*/
	        //loading(false);
	        
	      }
	      else if (result == false)
	      {
		      	console.log("FAL:", result);
 		      	toastr.warning("No concide con la clave de desbloqueo")
	      }
	    });  
		 	
	}
	
	this.mostrarRespaldos = function(tipo)
	{
								
			Meteor.call('getRespaldosCliente', tipo, $stateParams.objeto_id, function(error, result){           					
				if (result)
				{
						rc.respaldos = result;
						console.log(result)
						$scope.$apply();
            $("#modalCopiarRespaldos").modal('show');
			  }
		  });
			
	};
	
	this.mostrarModalBeneficiario = function(tipo)
	{
			if (tipo == 1)
			{
					rc.beneficiario = {};
					rc.editarBeneficiario = false;
			}
			else
					rc.editarBeneficiario = true;

			$("#modalBeneficiario").modal();
	};

	this.guardarBeneficiario = function(objeto, form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			
			objeto.estatus 	= true;
			objeto.saldo 		= 0;
			
			var nombre = objeto.nombre != undefined ? objeto.nombre + " " : "";
      var apPaterno = objeto.apellidoPaterno != undefined ? objeto.apellidoPaterno + " " : "";
      var apMaterno = objeto.apellidoMaterno != undefined ? objeto.apellidoMaterno : "";
      objeto.nombreCompleto = nombre + apPaterno + apMaterno;
      
      objeto.saldoActualVales	= 0;	//Saldo con Capital, Intereses, IVA y Seguro
      objeto.saldoActual			= 0;  //Saldo solo Capital
      
      rc.beneficiario._id = Beneficiarios.insert(objeto);
			
			
			$("#modalBeneficiario").modal('hide');
	};
	
	this.actualizarBeneficiario = function(objeto, form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		  }

			var nombre = objeto.nombre != undefined ? objeto.nombre + " " : "";
      var apPaterno = objeto.apellidoPaterno != undefined ? objeto.apellidoPaterno + " " : "";
      var apMaterno = objeto.apellidoMaterno != undefined ? objeto.apellidoMaterno : "";
      objeto.nombreCompleto = nombre + apPaterno + apMaterno;
      
      var tempId = objeto._id;
      delete objeto._id;
      
			Beneficiarios.update({_id: tempId}, {$set: objeto});
			
			$("#modalBeneficiario").modal('hide');
	};
	
	this.AgregarBeneficiario = function(objeto)
	{
		rc.beneficiario = objeto;
	};
	
	$(document).ready(function() {
		
		//Quita el mouse wheels 
		try
		{
				var cs = document.getElementById('capitalSolicitado').onwheel = function(){ return false; }
				//console.log(cs);
				document.getElementById('tasa').onwheel = function(){ return false; }
				document.getElementById('meses').onwheel = function(){ return false; }	
		}
		catch(error)
		{
				console.log(error);
				
		}


	});
 
	

};