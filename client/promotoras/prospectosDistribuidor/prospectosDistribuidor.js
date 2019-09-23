angular.module("creditoMio")
.controller("ProspectosDistribuidorCtrl", ProspectosDistribuidorCtrl);
 function ProspectosDistribuidorCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
 	window = rc;
 
  rc.action = true;
  rc.nuevo = true;	 
  rc.objeto = {}; 
  rc.buscar = {};
  rc.arreglo = [];
  
  rc.avance 			= 20;
  rc.numeroPagina = 0;
	
/*
	this.subscribe("prospectos", ()=>{
		return [{distribuidor_id: Meteor.userId()}]
	});
*/

	this.subscribe("prospectosDistribuidorListado", ()=>{
		return [{options 	: { skip				 	: rc.getReactively("numeroPagina") , limit: rc.avance },
    				where 		: { promotora_id	: Meteor.userId() } }];
	});
	
	 
	this.helpers({
	  arreglo : () => {
		  return ProspectosDistribuidor.find({},{sort: {fecha: -1} }).fetch();
	  },	  
  });
  
 /*
 this.Nuevo = function()
  {
    this.action = true;
    this.nuevo = !this.nuevo;
    this.objeto = {};		
  };

  this.guardar = function(objeto,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			
			objeto.estatus = 1;	//1.- Solicitado, 2.- Aceptado, 3.- Rechazado
			objeto.usuarioInserto = Meteor.userId();
			objeto.saldo 		= 0;
			
			objeto.promotora_id = Meteor.userId();
			objeto.sucursal_id	= Meteor.user().profile.sucursal_id;
			
			var nombre = objeto.nombre != undefined ? objeto.nombre + " " : "";
      var apPaterno = objeto.apellidoPaterno != undefined ? objeto.apellidoPaterno + " " : "";
      var apMaterno = objeto.apellidoMaterno != undefined ? objeto.apellidoMaterno : "";
      objeto.nombreCompleto = nombre + apPaterno + apMaterno;
      
      objeto.saldoActualVales	= 0;	//Saldo con Capital, Intereses, IVA y Seguro
      objeto.saldoActual			= 0;  //Saldo solo Capital
      
      objeto.fecha = new Date();
      			
			ProspectosDistribuidor.insert(objeto);
			toastr.success('Guardado correctamente.');
			this.objeto = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
		
	};

	this.editar = function(id)
	{
	    this.objeto = Prospectos.findOne({_id:id});
	    this.action = false;
	    $('.collapse').collapse('show');
	    this.nuevo = false;
	};
	
	this.actualizar = function(objeto,form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		  }
		  
		  var nombre = objeto.nombre != undefined ? objeto.nombre + " " : "";
      var apPaterno = objeto.apellidoPaterno != undefined ? objeto.apellidoPaterno + " " : "";
      var apMaterno = objeto.apellidoMaterno != undefined ? objeto.apellidoMaterno : "";
      objeto.nombreCompleto = nombre + apPaterno + apMaterno;
		  
			var idTemp = objeto._id;
			delete objeto._id;		
			objeto.usuarioActualizo = Meteor.userId(); 
			Prospectos.update({_id:idTemp},{$set : objeto});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
      form.$setUntouched();
	};
*/
 /*
	this.cambiarEstatus = function(id)
	{
			var objeto = Prospectos.findOne({_id:id});
			if(objeto.estatus == true)
				objeto.estatus = false;
			else
				objeto.estatus = true;
			
			Prospectos.update({_id: id},{$set :  {estatus : objeto.estatus}});
  };	
*/
	
	this.izq = function()
  {
	 		if (rc.numeroPagina > 0)
	 			 rc.numeroPagina -= rc.avance;
	}

	this.der = function()
  {
	  	if (rc.arreglo.length == rc.avance)
			  	rc.numeroPagina += rc.avance;
	}
	
};