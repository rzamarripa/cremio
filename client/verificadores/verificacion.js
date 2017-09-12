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



    this.garantia = {};
    rc.objeto = {};
	
	this.garantiasGeneral = [];
	this.garantias = [];
	
	
	if ($stateParams.verificacion_id == "-1")
		 this.action = true;
	else
		 this.action = false;		 	
	
	this.subscribe('verificaciones',()=>{
			return [{_id : $stateParams.verificacion_id }]
	});
	
	
	this.subscribe('creditos',()=>{
			return [{_id : $stateParams.id }]
	});
	
  this.helpers({
	  verificaciones : () => {		  
		  
		  rc.objeto = Verificaciones.findOne();
		  
		  if (rc.objeto != undefined)
		  {
				  if (rc.objeto.tipoGarantia == "general")
				  	 this.garantiasGeneral = angular.copy(rc.objeto.garantias);
				  else if (rc.objeto.tipoGarantia == "mobiliario")	 
				  	 this.garantias = angular.copy(rc.objeto.garantias); 
		  }
	  }, 
	  credito : () => {
			return Creditos.findOne();
		},
  });


  
  this.guardar = function(obj, form)
	{	
			
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
		  
			obj.estatus = true;
			obj.credito_id = $stateParams.id;
			obj.usuarioVerifico = Meteor.userId();
			obj.tipoVerificacion = "solicitante o aval";
			obj.fechaVerificacion = new Date();
			obj.sucursal_id = Meteor.user().profile.sucursal_id;
			obj.cliente_id = rc.credito.cliente_id;
			
			if (this.objeto.tipoGarantia == "mobiliaria")
					obj.garantias = angular.copy(this.garantias);
			else
					obj.garantias = angular.copy(this.garantiasGeneral);	
									
			var credito = Creditos.findOne($stateParams.id);
			
			if (credito.tipoGarantia == undefined )
					credito.tipoGarantia = [];
			
			credito.tipoGarantia = this.objeto.tipoGarantia;
			
			Verificaciones.insert(obj);
			
			if (this.objeto.tipoGarantia == "mobiliaria")
					Creditos.update({_id: obj.credito_id}, {$set:{garantias: angular.copy(this.garantias), tipoGarantia: this.objeto.tipoGarantia}})
			else
					Creditos.update({_id: obj.credito_id}, {$set:{garantias: angular.copy(this.garantiasGeneral), tipoGarantia: this.objeto.tipoGarantia}})

		
			toastr.success('Guardado correctamente.');
			this.objeto = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	    $state.go('root.panelVerificador');
			
	}
  
  
  this.insertarGarantia = function(tipo)
	{
			console.log(tipo);
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



	this.editarGarantia = function(tipo, a)
	{ console.log(tipo,"tipo")
	console.log("a",a)

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

  
};