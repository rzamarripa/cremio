angular
.module("creditoMio")
.controller("ActualizarPlanCtrl", ActualizarPlanCtrl);
function ActualizarPlanCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	window.rc = rc;
	
	this.nuevoBotonPago = true;
	this.action = false;
	this.actionAval = true;
	this.actionGarantia = true;
	this.fechaActual = new Date();
	this.nuevoBotonReestructuracion = true;
	this.nuevoBotonCredito = true;
	//this.buscar = {};
	//this.buscar.nombre = "";
	this.cliente_id = "";
	this.planPagos = [];
	this.credito = {};
	//this.credito.primerAbono = new Date(moment().add(1, "weeks"));
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
  
	this.buscar = {};
	this.buscar.nombre = "";
	this.buscando = false;
	this.personasTipos = [];
	this.personas_ids = [];
	
	
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
			this.buscando = false;
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
	this.subscribe('pagos', () => {
		return [{ estatus:true}];
	});
	this.subscribe('creditos', () => {
		return [{ _id:$stateParams.credito_id}];
	},{
		onReady:()=>{
			rc.credito = Creditos.findOne($stateParams.credito_id);
			
			//console.log(rc.credito);
			rc.avales = [];
	  	
	  	_.each(rc.credito.avales_ids,function(aval){
						Meteor.call('getAval', aval.aval_id, rc.credito.cliente_id, function(error, result){						
									if (result)
									{
											//Recorrer las relaciones 
											console.log("Aval Get Persona:",aval);
											
											rc.avales.push({aval_id						: aval.aval_id,
																		  nombreCompleto		: result.nombreCompleto,
																		  nombre						: result.nombre,
																		  apellidoPaterno	  : result.apellidoPaterno,
																		  apellidoMaterno		: result.apellidoMaterno,
																		  estadoCivil				: result.estadoCivil,
																		  ocupacion					: result.ocupacion,
																		  direccion					: result.calle + " Num:" + result.numero + " CP:" + result.codigoPostal,
																		  empresa						: result.empresa.nombre,
																		  puesto						: result.puesto,
																		  tiempoLaborando		: result.tiempoLaborando,
																		  direccionEmpresa	: result.empresa.calle + " Num:" + result.empresa.numero + " CP:" + result.empresa.codigoPostal, 
																		  parentesco				: aval.parentesco,
																		  tiempoConocerlo		: aval.tiempoConocerlo,
																		  num								: aval.num,
																		  //cliente_id				: result.cliente_id,
																		  estatus						: aval.estatus
											});
											$scope.$apply();
									}
						});	
	  	});
			
			
			rc.garantias = rc.credito.garantias;
			rc.credito.primerAbono = rc.credito.fechaPrimerAbono;
		}
	});
	
	this.helpers({
		avalesHelper : () => {
			var aval = Avales.find({
		  	"profile.nombreCompleto": { '$regex' : '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' }
			}, { sort : {"nombreCompleto" : 1 }}).fetch();
			return aval;
		},
		cliente : () => {
			return Meteor.users.findOne({roles : ["Cliente"]});
		},
		tiposCredito : () => {
			return TiposCredito.find();
		},
		pagos : () => {
			return Pagos.find();
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
	  
/*
  this.generarPlanPagos = function(credito, form){
  		var tipoCredito = TiposCredito.findOne(this.credito.tipoCredito_id);
  		if(!tipoCredito || credito.capitalSolicitado>tipoCredito.montoMaximon){
  			toastr.error("El monto solicitado es mayor al permitido.");
  			return;
  		}
		if(form.$invalid){
			toastr.error('Error al calcular el nuevo plan de pagos, llene todos los campos.');
			return;
		}
		rc.planPagos = [];
			
		if(rc.credito.requiereVerificacion == true)
			rc.credito.estatus = 0;
		else
			rc.credito.estatus = 1;
			
		if (!this.credito.requiereVerificacion)
				this.credito.turno = "";	

		var _credito = {
			cliente_id : this.cliente._id,
			tipoCredito_id : this.credito.tipoCredito_id,
			fechaSolicito : new Date(),
			duracionMeses : this.credito.duracionMeses,
			capitalSolicitado : this.credito.capitalSolicitado,
			adeudoInicial : this.credito.capitalSolicitado,
			saldoActual : this.credito.capitalSolicitado,
			periodoPago : this.credito.periodoPago,
			fechaPrimerAbono : this.credito.primerAbono,
			multasPendientes : 0,
			saldoMultas : 0.00,
			saldoRecibo : 0.00,
			//estatus : 1,
			requiereVerificacion: this.credito.requiereVerificacion,
			turno : this.credito.turno,
			sucursal_id : Meteor.user().profile.sucursal_id,
			fechaVerificacion: this.credito.fechaVerificacion
		};

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
				//console.log("Prueba",rc.planPagos)
			}
				
		})
		
		return rc.planPagos;
	}
*/
	
	this.actualizarCredito = function(){
				
		if (!this.credito.requiereVerificacion)
				this.credito.turno = "";	
		
		var credito = {
			cliente_id 						: this.cliente._id,
			tipoCredito_id 				: this.credito.tipoCredito_id,
			duracionMeses 				: this.credito.duracionMeses,
			capitalSolicitado 		: this.credito.capitalSolicitado,
			adeudoInicial 				: this.credito.capitalSolicitado,
			saldoActual 					: this.credito.capitalSolicitado,
			periodoPago 					: this.credito.periodoPago,
			fechaPrimerAbono 			: this.credito.primerAbono,
			multasPendientes 			: 0.00,
			saldoMultas 					: 0.00,
			saldoRecibo 					: 0.00,
			estatus 							: this.credito.estatus,
			requiereVerificacion	: this.credito.requiereVerificacion,
			turno 								: this.credito.turno,
			sucursal_id 					: Meteor.user().profile.sucursal_id,
			fechaVerificacion			: this.credito.fechaVerificacion,
			tipoGarantia 					: this.credito.tipoGarantia,
			tasa									: this.credito.tasa,
			conSeguro 						: this.credito.conSeguro,
			seguro								: this.credito.seguro
		};
				
		credito.avales = angular.copy(this.avales);
		
		if (this.credito.tipoGarantia == "mobiliaria")
				credito.garantias = angular.copy(this.garantias);
		else
				credito.garantias = angular.copy(this.garantiasGeneral);
				
		Meteor.apply('actualizarCredito', [this.cliente, credito, $stateParams.credito_id], function(error, result){
			//console.log(result,error)
			if(result == "hecho"){
				toastr.success('Se actualizó correctamente la solicitud de crédito');
				rc.planPagos = [];
				this.avales = [];
				$state.go("root.clienteDetalle",{objeto_id : rc.cliente._id});
			}
			$scope.$apply();
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
			this.avales.push(rc.aval);
			rc.aval.estatus = "N";
			rc.aval={};
	};
	
	this.actualizarAval = function(a)
	{
		a.num = this.num;
		_.each(this.avales, function(av){
			if (av.num == a.num)
			{
				av.nombre = a.nombre;
				av.estadoCivil = a.estadoCivil;
				av.ocupacion = a.ocupacion;			
				av.direccion = a.direccion;
				av.empresa = a.empresa;
				av.puesto = a.puesto;
				av.tiempoLaborando = a.tiempoLaborando;
				av.direccionEmpresa = a.direccionEmpresa;
				av.parentesco = a.parentesco;
				av.tiempoConocerlo = a.tiempoConocerlo;
				av.estatus = "A";
			}
		})
		
		this.aval={};
		this.num=0;
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
		//Eliminar el Aval del credito y del AVAl
		
		console.log("Eliminar:", this.avales[pos]);
		
/*
		this.avales.splice(pos, 1);
		if (this.avales.length == 0)
			this.con = 0;
*/
 
	  //functiontoOrginiceNum(this.avales, "num");
	};
	
	this.editarAval = function(a)
	{
		rc.aval.nombre = a.nombre;
		rc.aval.estadoCivil = a.estadoCivil;
		rc.aval.ocupacion = a.ocupacion;			
		rc.aval.direccion = a.direccion;
		rc.aval.empresa = a.empresa;
		rc.aval.puesto = a.puesto;
		rc.aval.tiempoLaborando = a.tiempoLaborando;
		rc.aval.direccionEmpresa = a.direccionEmpresa;
		rc.aval.parentesco = a.parentesco;
		rc.aval.tiempoConocerlo = a.tiempoConocerlo;
		
		this.num = a.num;
	  this.actionAval = false;
	};
	
	this.borrarReferencia = function()
	{
			rc.aval.nombre = "";
			rc.aval.apellidoPaterno = "";
			rc.aval.apellidoMaterno = "";
			rc.aval.estadoCivil = "";
			rc.aval.ocupacion = "";
			rc.aval.direccion = "";
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
		
		Meteor.call('getAval', a._id, function(error, result){
			if(result){					
					rc.aval.ocupacion = result.ocupacion;
					rc.aval.direccion = result.calle + " Num:" + result.numero + " CP:" + result.codigoPostal;
					rc.aval.estadoCivil = result.estadoCivil;
					rc.aval.empresa = result.empresa.nombre;
					rc.aval.direccionEmpresa = result.empresa.calle + " Num:" + result.empresa.numero + " CP:" + result.empresa.codigoPostal;;
					rc.aval.puesto = result.puesto;
					rc.aval.tiempoLaborando = result.tiempoLaborando;
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
							av.tipo = a.tipo;
							av.marca = a.marca;
							av.modelo = a.modelo;			
							av.serie = a.serie;
							av.color = a.color;
							av.estadoActual = a.estadoActual;
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
							av.descripcion = a.descripcion;
							av.valorEstimado = a.valorEstimado;
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
	
	this.fechaPago = function(diaSeleccionado)
	{
			var date = moment();
			var diaActual = date.day();		
			var fecha = new Date();
			var dif = diaActual - diaSeleccionado;
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
					if (dif < 4)
					{
							if (dif == 1)
									fecha.setDate(fecha.getDate() + 8);
							else if (dif == 2)
									fecha.setDate(fecha.getDate() + 9);					
							else if (dif == 3)
									fecha.setDate(fecha.getDate() + 10);
					}
					else 
							fecha.setDate(fecha.getDate() + dif);
				
			} else
					fecha.setDate(fecha.getDate() + 7);
			rc.credito.primerAbono = fecha;
	};
	
	this.editarGarantia = function(tipo, a)
	{
			if (tipo == "mobiliaria")
			{
					this.garantia.tipo = a.tipo;
					this.garantia.marca = a.marca;
					this.garantia.modelo = a.modelo;			
					this.garantia.serie = a.serie;
					this.garantia.color = a.color;
					this.garantia.estadoActual = a.estadoActual;
					
					this.numG = a.num;
					this.actionGarantia = false;
			}
			else
			{
					this.garantia.descripcion = a.descripcion;
					this.garantia.valorEstimado = a.valorEstimado;
					
					this.numGen = a.num;
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
	
	this.generarPlanPagos = function(credito, form){
		
		/*
var tipoCredito = TiposCredito.findOne(this.credito.tipoCredito_id);
		if(!tipoCredito || credito.capitalSolicitado>tipoCredito.montoMaximon){
			toastr.error("El monto solicitado es mayor al permitido.");
			return;
		}
*/
		
		
		if(form.$invalid){
			toastr.error('Error al calcular el nuevo plan de pagos, llene todos los campos.');
			return;
		}
		rc.planPagos = [];
		this.tablaAmort = true;
			
		if(rc.credito.requiereVerificacion == true)
			rc.credito.estatus = 0;
		else
			rc.credito.estatus = 1;
			
		if (!this.credito.requiereVerificacion)
				this.credito.turno = "";

		var _credito = {
			cliente_id : this.cliente._id,
			tipoCredito_id : this.credito.tipoCredito_id,
			fechaSolicito : new Date(),
			duracionMeses : this.credito.duracionMeses,
			capitalSolicitado : this.credito.capitalSolicitado,
			adeudoInicial : this.credito.capitalSolicitado,
			saldoActual : this.credito.capitalSolicitado,
			periodoPago : this.credito.periodoPago,
			fechaPrimerAbono : this.credito.primerAbono,
			multasPendientes : 0,
			saldoMultas : 0.00,
			saldoRecibo : 0.00,
			estatus : 1,
			requiereVerificacion: this.credito.requiereVerificacion,
			turno : this.credito.turno,
			sucursal_id : Meteor.user().profile.sucursal_id,
			fechaVerificacion: this.credito.fechaVerificacion,
			turno: this.credito.turno,
			tasa: this.credito.tasa,
			conSeguro : this.credito.conSeguro,
			seguro: this.credito.seguro
		};

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
				console.log("Prueba",rc.planPagos)
			}
				
		})
		
		return rc.planPagos;
	}
	
	

};