angular.module("creditoMio")
.controller("EstadosCtrl", EstadosCtrl);
 function EstadosCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  
	this.subscribe('estados',()=>{
		return [{
			
		}]
	 });
	this.subscribe('paises',()=>{
		return [{
			
		}]
	 });
	 
	this.helpers({
	  estados : () => {
		  return Estados.find();
	  },
		paises : () => {
		 var paises = Paises.find().fetch();
		  	if (paises) {
		  		_.each(rc.estados, function(estado){
		  			estado.pais = Paises.findOne(estado.pais_id)
		  	});
	  	}
	  	console.log(paises);
		  return paises;
	  },
  }); 
  
  this.Nuevo = function()
  {
    this.action = true;
    this.nuevo = false;
    this.objeto = {};		
  };

  this.guardar = function(objeto,form)
	{
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			console.log(objeto);
			objeto.estatus = true;
			objeto.usuarioInserto = Meteor.userId();
			Estados.insert(objeto);
			toastr.success('Guardado correctamente.');
			this.objeto = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
		
	};

	this.editar = function(id)
	{
	    this.objeto = Estados.findOne({_id:id});
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
			Estados.update({_id:idTemp},{$set : objeto});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
      form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
			var objeto = Estados.findOne({_id:id});
			if(objeto.estatus == true)
				objeto.estatus = false;
			else
				objeto.estatus = true;
			
			Estados.update({_id: id},{$set :  {estatus : objeto.estatus}});
  };	
};