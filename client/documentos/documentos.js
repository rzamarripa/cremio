angular.module("creditoMio")
.controller("DocumentosCtrl", DocumentosCtrl);
 function DocumentosCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  
	this.subscribe('documentos',()=>{
		return [{
			
		}]
	 });
	 
	this.helpers({
	  documentos : () => {
		  return Documentos.find({},{sort :{ nombre: 1} });
	  }
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
			objeto.usuarioInserto = Meteor.userId();
			objeto.fechaCreacion = new Date();
			Documentos.insert(objeto);
			toastr.success('Guardado correctamente.');
			this.objeto = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
	    console.log(objeto,"objeto")
		
	};

	this.editar = function(id)
	{
	    this.objeto = Documentos.findOne({_id:id});
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
			objeto.fechaUltimaModificación = new Date();
			Documentos.update({_id:idTemp},{$set : objeto});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
      form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
			var objeto = Documentos.findOne({_id:id});
			if(objeto.estatus == true)
				objeto.estatus = false;
			else
				objeto.estatus = true;
			
			Documentos.update({_id: id},{$set :  {estatus : objeto.estatus}});
  };

};