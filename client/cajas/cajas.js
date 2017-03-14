angular.module("creditoMio")
.controller("CajasCtrl", CajasCtrl);
 function CajasCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  this.buscar = {};
  

	this.subscribe('cajas',()=>{
		return [{sucursal_id: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : ""}]
	});



	this.helpers({
	  cajas : () => {
		  return Cajas.find();
	  },
  });

  
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
			objeto.estatus = true;
			objeto.usuarioResponsable = "";
			objeto.estadoCaja = "Cerrado";
			objeto.sucursal_id = Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "";
			objeto.usuarioInserto = Meteor.userId(); 
			
			Cajas.insert(objeto);
			toastr.success('Guardado correctamente.');
			this.objeto = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
		
	};

	this.editar = function(id)
	{
	    this.objeto = Cajas.findOne({_id:id});
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
			var idTemp = objeto._id;
			delete objeto._id;		
			objeto.usuarioActualizo = Meteor.userId(); 
			Cajas.update({_id:idTemp},{$set : objeto});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
      form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
			var objeto = Cajas.findOne({_id:id});
			if(objeto.estatus == true)
				objeto.estatus = false;
			else
				objeto.estatus = true;
			
			Cajas.update({_id: id},{$set :  {estatus : objeto.estatus}});
  };	
};