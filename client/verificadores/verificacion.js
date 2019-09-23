angular
.module("creditoMio")
.controller("VerificacionCtrl", VerificacionCtrl);
function VerificacionCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {
	
	let rc = $reactive(this).attach($scope);
	window.rc = rc;
	
	rc.action = true;
	rc.firmar = true;
	
	this.actionGarantia = true;
	this.conG = 0;
	this.numG = 0;
	this.conGen = 0;
	this.numGen = 0;
	
	rc.tipoVerificacion 				= "";
	rc.tipoClienteDistribuidor	= "";
	
	//rc.credito = {};
  rc.objeto = {};
  
	
	this.garantias = [];
	this.garantiasGeneral = [];
	this.garantia = {};
	
	this.tipo = $stateParams.tipo;
	
	rc.persona = 0;
		
	if ($stateParams.verificacion_id == "-1")
	{
		 rc.action = true;
		 rc.actualizarNo = false;
		 rc.firmar = true;
	}	 
	else
	{
		 rc.action = false;
		 rc.firmar = false;
		 rc.actualizarNo = true;
	}
	
	if ($stateParams.verificacion_id != "-1")
	{
			this.subscribe('verificaciones',()=>{					
							return [{_id : $stateParams.verificacion_id }]
			});
	}

	if ($stateParams.tipo == "CP")
	{	
		
		this.subscribe('creditos',()=>{
				return [{_id : $stateParams.id}]
		});	
		
		//Ir por los datos Generals del Cliente o Aval si tiene
		rc.tipoVerificacion = "Crédito Personal";
		rc.persona = 	$stateParams.persona;
		if ($stateParams.persona == 1)
				rc.tipoClienteDistribuidor	= "Cliente";	
		else if ($stateParams.persona == 2)
				rc.tipoClienteDistribuidor	= "Aval";
		
		rc.objeto.tipo = "creditoP";
	}
	else if($stateParams.tipo == "V")
	{
		this.subscribe('cliente',()=>{
				return [{_id : $stateParams.id }]
		},
		{
				onReady: function () {
					
					rc.tipoVerificacion = "Distribuidor";
					rc.persona = $stateParams.persona;
					
					if ($stateParams.persona == 1)
					{
							Meteor.call('getUsuarioVerificacion', $stateParams.id, function(error, result){
									if(result)
									{
											rc.objeto.cliente = result;
											$scope.$apply();
									}
							});
							rc.tipoClienteDistribuidor	= "Distribuidor";
					}
							
					else if ($stateParams.persona == 2)
					{
							var dis = Meteor.users.findOne({_id: $stateParams.id});				
							if (dis != undefined)
							{
									Meteor.call('getAvalVerificacion', dis.profile.avales_ids[0]._id, function(error, result){
											if(result)
											{		
													rc.objeto.cliente = result;
													$scope.$apply();
											}
									});
							}
							rc.tipoClienteDistribuidor	= "Aval";
					}
					
				}	
		});
	}
	
  this.helpers({
	  verificaciones : () => {		  		  
		  if ($stateParams.verificacion_id != -1)
		  {
				  rc.objeto = Verificaciones.findOne($stateParams.verificacion_id);
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
							
							if ($stateParams.tipo == "CP")	
							{							
							  var c = Creditos.findOne({_id: $stateParams.id});	 
							  if (c !== undefined)
								{
										rc.objeto.tipoGarantia = c.tipoGarantia;
										rc.objeto.tipo 				 = c.tipo;
								}	 
							}
						  
				  }
			}	
	  }, 
	  credito : () => {
		  if ($stateParams.tipo == "CP")
		  {
				  var c = Creditos.findOne({_id: $stateParams.id});	  
				  if (c !== undefined)
				  { 
					  	
							if (rc.tipoClienteDistribuidor == "Cliente")
							{
									Meteor.call('getUsuarioVerificacion', c.cliente_id, function(error, result){
											if(result)
											{
													rc.objeto.cliente = result;
													$scope.$apply();
											}
									});
							}
							else if (rc.tipoClienteDistribuidor == "Aval")
							{
									Meteor.call('getAvalVerificacion', c.avales_ids[0].aval_id, function(error, result){
											if(result)
											{
													rc.objeto.cliente = result;
													$scope.$apply();
											}
									});
							}					
					 		if (c.tipoGarantia == "mobiliaria")	
					 		{
						 		 this.garantias = c.garantias;
					 		}
					 		else if (c.tipoGarantia == "general")
					 		{
						 		 rc.objeto.tipoGarantia = "general";
					 		}
					 	 	return c;  	
				  }	
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
			obj.usuarioVerifico 		= Meteor.userId();
			
			obj.tipoVerificacion 		= rc.tipoClienteDistribuidor;
			obj.rolVerificacion 		= rc.tipoClienteDistribuidor;
			obj.fechaVerificacion 	= new Date();
			obj.sucursal_id 				= Meteor.user().profile.sucursal_id;
			obj.verificacionPersona = $stateParams.persona;
			var dataUrl 						= canvas.toDataURL();			
			obj.firma 							= dataUrl;	
				
			if ($stateParams.tipo == "CP")
			{
				obj.cliente_id = rc.credito.cliente_id;
				obj.credito_id = $stateParams.id;
				obj.tipo 			= "Crédito Personal";
			
				obj.garantias = [];
				var credito = Creditos.findOne($stateParams.id);
				if (obj.tipoGarantia == "mobiliaria")
				{
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
	    $state.go('root.panelVerificador');
			
	}
	
	this.actualizar = function(obj, form)
	{	
			
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		  }
		  
			if (rc.firmar)
			{
					var dataUrl = canvas.toDataURL();			
					obj.firma 	= dataUrl;
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
	
	
	//Elementos para la Pizarra
	
	$(document).ready(function() {
			
			rc.ctx = {};
			var lienzo = document.getElementById('canvas');
	    rc.ctx = lienzo.getContext('2d');	    
	    rc.ctx.strokeStyle = "#222222";
			rc.ctx.lineWith = 1;
			
	 	  rc.drawing = false;
	    rc.mousePos = { x:0, y:0 };
			rc.lastPos = rc.mousePos;
	    
	    ///////////////Mouse---------------------------------
	    canvas.addEventListener('mousedown', function (e) {
        rc.drawing = true;
			  rc.lastPos = rc.getMousePos(canvas, e);
			}, false);
			canvas.addEventListener('mouseup', function (e) {
			  rc.drawing = false;
			}, false);
			canvas.addEventListener('mousemove', function (e) {
			  rc.mousePos = rc.getMousePos(canvas, e);
			}, false);
			//---------------------------------------------------
			///////////////Touch---------------------------------
			canvas.addEventListener("touchstart", function (e) {
        rc.mousePos = rc.getTouchPos(canvas, e);
			  var touch = e.touches[0];
			  var mouseEvent = new MouseEvent("mousedown", {
			    clientX: touch.clientX,
			    clientY: touch.clientY
			  });
			  canvas.dispatchEvent(mouseEvent);
			}, false);
			canvas.addEventListener("touchend", function (e) {
			  var mouseEvent = new MouseEvent("mouseup", {});
			  canvas.dispatchEvent(mouseEvent);
			}, false);
			canvas.addEventListener("touchmove", function (e) {
			  var touch = e.touches[0];
			  var mouseEvent = new MouseEvent("mousemove", {
			    clientX: touch.clientX,
			    clientY: touch.clientY
			  });
			  canvas.dispatchEvent(mouseEvent);
			}, false);
			//---------------------------------------------------
			//Prevenir el scroll en el canvas
			window.addEventListener('touchmove', ev => {
			  if (ev.target == canvas) {
			    ev.preventDefault();
			    ev.stopImmediatePropagation();
			  };
			}, { passive: false });
			//---------------------------------------------------	    
	    window.requestAnimFrame = (function (callback) {
			        return window.requestAnimationFrame || 
			           window.webkitRequestAnimationFrame ||
			           window.mozRequestAnimationFrame ||
			           window.oRequestAnimationFrame ||
			           window.msRequestAnimaitonFrame ||
			           function (callback) {
			        window.setTimeout(callback, 1000/60);
			           };
			})();
	    
	    // Allow for animation
			(function drawLoop () {
			  requestAnimFrame(drawLoop);
			  rc.renderCanvas();
			})();
	});
	
	
	rc.getMousePos = function(canvasDom, mouseEvent)
	{
	  var rect = canvasDom.getBoundingClientRect();
	  return {
	    x: mouseEvent.clientX - rect.left,
			y: mouseEvent.clientY - rect.top
	  };
	}
	
	rc.getTouchPos = function(canvasDom, touchEvent)
	{
	  var rect = canvasDom.getBoundingClientRect();
	  return {
	    x: touchEvent.touches[0].clientX - rect.left,
	    y: touchEvent.touches[0].clientY - rect.top
	  };
	}
	
	rc.renderCanvas = function()
	{
	  if (rc.drawing) 
	  {
	    rc.ctx.moveTo(rc.lastPos.x, rc.lastPos.y);
	    rc.ctx.lineTo(rc.mousePos.x, rc.mousePos.y);
	    rc.ctx.stroke();
	    rc.lastPos = rc.mousePos;
	  }
	}
	
	rc.clearCanvas = function()
	{
    	canvas.width = canvas.width;
	}
	
	rc.activaFirma = function()
	{
    	canvas.width = canvas.width;
    	rc.firmar = true;
    	
	}
	
	
	
	  
};