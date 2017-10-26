angular
.module("creditoMio")
.controller("VerificacionCtrl", VerificacionCtrl);
function VerificacionCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {

	let rc = $reactive(this).attach($scope);
	
	window = rc;
	
	this.action = true;	
	this.actionGarantia = true;
	this.conG = 0;
	this.numG = 0;
	this.conGen = 0;
	this.numGen = 0;
	
	//rc.credito = {};
  rc.objeto = {};
	
	this.garantias = [];
	this.garantiasGeneral = [];
	this.garantia = {};
	
	this.tipo = $stateParams.tipo;
	
	this.actualizarNo = false;
	if ($stateParams.persona == -1)
		 this.actualizarNo = true;	 
	
	if ($stateParams.verificacion_id == "-1")
	{
		 this.action = true;
	}	 
	else
	{
		 this.action = false;
	}	 
	
	this.subscribe('verificaciones',()=>{
			if ($stateParams.verificacion_id != -1)
					return [{_id : $stateParams.verificacion_id }]
	});
	
	
	if ($stateParams.tipo == "CP")
	{	
		
		this.subscribe('creditos',()=>{
				return [{_id : $stateParams.id }]
		});	
	}
	else if($stateParams.tipo == "V")
	{
		this.subscribe('cliente',()=>{
				return [{_id : $stateParams.id }]
		});
	}
	
  this.helpers({
	  verificaciones : () => {		  
		  
		  
		  if ($stateParams.verificacion_id != -1)
		  {
				  rc.objeto = Verificaciones.findOne();
				  if (rc.objeto != undefined)
				  {
					  	
						  if (rc.objeto.tipoGarantia == "general")
						  { 
						  	 this.garantiasGeneral = angular.copy(rc.objeto.garantias);
						  	  if (this.garantias.length > 0)
						  	  {
						  	  		var ele = this.garantias[this.garantias.length - 1];
						  	  		this.conGen = ele.num;
						  	  }
						  }	 
						  else if (rc.objeto.tipoGarantia == "mobiliaria")	 
						  {
						  	 this.garantias = angular.copy(rc.objeto.garantias); 
						  	 if (this.garantias.length > 0)
						  	 {
						  	  		var ele = this.garantias[this.garantias.length - 1];
						  	  		this.conG = ele.num;
						  	 }
						  }				  	
				  }
			}	  

	  }, 
	  credito : () => {
		  var c = Creditos.findOne();
		  
		  if (c != undefined)
		  {
					
			 		if (c.tipoGarantia == "mobiliaria") 	
			 				this.garantias = c.garantias;
			 		else if (c.tipoGarantia == "general") 	
			 				this.garantiasGeneral = c.garantias;
			 		
			 	 	return c;  	
		  }	
		
		},
  });
  
    
  this.guardar = function(obj, form)
	{	
			
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
		  
			obj.estatus = true;
			obj.usuarioVerifico = Meteor.userId();
			obj.tipoVerificacion = "solicitante o aval";
			obj.fechaVerificacion = new Date();
			obj.sucursal_id = Meteor.user().profile.sucursal_id;
			obj.verificacionPersona = $stateParams.persona;
				
			//console.clear();
				
			if ($stateParams.tipo == "CP")
			{
				obj.cliente_id = rc.credito.cliente_id;
				obj.credito_id = $stateParams.id;
				obj.tipo 			= "Crédito Personal";
			
				obj.garantias = [];
				var credito = Creditos.findOne($stateParams.id);
				
				if (obj.tipoGarantia == "mobiliaria")
				{
					//console.log("Entro");
					obj.garantias = angular.copy(this.garantias)
					Creditos.update({_id: credito._id}, {$set:{garantias: angular.copy(this.garantias), tipoGarantia: this.objeto.tipoGarantia}})
 				}	
				else
				{
					
					obj.garantias = angular.copy(this.garantiasGeneral);	
					Creditos.update({_id: credito._id}, {$set:{garantias: angular.copy(this.garantiasGeneral), tipoGarantia: this.objeto.tipoGarantia}})

				}						 						
				
			}
			else if ($stateParams.tipo == "V")	
			{
				obj.cliente_id = $stateParams.id;
				obj.tipo 			= "Distribuidor";
			}
			
			Verificaciones.insert(obj);

		
			toastr.success('Guardado correctamente.');
			this.objeto = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	    $state.go('root.panelVerificador');
			
	}
	
	this.actualizar = function(obj, form)
	{	
			
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		  }
		  

			if ($stateParams.tipo == "CP")
			{

				obj.cliente_id = rc.credito.cliente_id;
				obj.credito_id = $stateParams.id;
				obj.tipo 			= "Crédito Personal";
				
				if (this.objeto.tipoGarantia == "mobiliaria")
						obj.garantias = angular.copy(this.garantias);
				else
						obj.garantias = angular.copy(this.garantiasGeneral);	
										
				var credito = Creditos.findOne($stateParams.id);
				
				if (credito.tipoGarantia == undefined )
						credito.tipoGarantia = [];
				
				credito.tipoGarantia = this.objeto.tipoGarantia;
								
				if (credito.tipoGarantia == "mobiliaria")
						Creditos.update({_id: $stateParams.id}, {$set:{garantias: angular.copy(this.garantias), tipoGarantia: "mobiliaria"}})
				else
						Creditos.update({_id: $stateParams.id}, {$set:{garantias: angular.copy(this.garantiasGeneral), tipoGarantia: "general"}})
				
			}
			else if ($stateParams.tipo == "V")	
			{
				obj.cliente_id = $stateParams.id;
				obj.tipo 			= "Distribuidor";
			}
			
					
			var idTemp = obj._id;
			delete obj._id;		
			obj.usuarioActualizo = Meteor.userId(); 
			Verificaciones.update({_id:idTemp},{$set : obj});
	
			toastr.success('Actulizado correctamente.');
			this.objeto = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	    $state.go('root.panelVerificador');
			
	}
    
  ////////////////////////////////////////////////////////////////////////////////////////////////////
	
	this.insertarGarantia = function(tipo, form)
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
	
	this.actualizarGarantia = function(tipo, a, form)
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
			 
					functiontoOrginiceNum(this.garantias, "num");
			}
			else
			{
					pos = functiontofindIndexByKeyValue(this.garantiasGeneral, "num", numero);
					this.garantiasGeneral.splice(pos, 1);
					if (this.garantiasGeneral.length == 0) 
						this.conGen = 0;
			 
					functiontoOrginiceNum(this.garantiasGeneral, "num");		
				
			}
					
	};
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	
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
	
	this.calcularPorcentajeGeneral = function(){

    	if (rc.garantia.avaluoGeneral != undefined)
					rc.garantia.porcentajePrestamoGeneral = Math.round(rc.garantia.avaluoGeneral / rc.credito.capitalSolicitado * 100);
			else 
					rc.garantia.porcentajePrestamoGeneral = 0;

  };
  
  this.calcularPorcentajeMobiliaria = function(){

    	if (rc.garantia.avaluoMobiliaria != undefined)
					rc.garantia.porcentajePrestamoMobiliria = Math.round(rc.garantia.avaluoMobiliaria / rc.credito.capitalSolicitado * 100);
			else 
					rc.garantia.porcentajePrestamoMobiliria = 0;
  };

	/*
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
*/

  
};