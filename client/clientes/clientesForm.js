angular.module("creditoMio")
.controller("ClientesFormCtrl", ClientesFormCtrl);
 function ClientesFormCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	$reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  
	this.subscribe('estadoCivil',()=>{
		return [{estatus: true}]
	});
	
	this.subscribe('nacionalidades',()=>{
		return [{estatus: true}]
	});
	
	this.subscribe('ocupaciones',()=>{
		return [{estatus: true}]
	});
	
	this.subscribe('paises',()=>{
		return [{estatus: true}]
	});
	
	this.subscribe('estados',()=>{
		return [{pais_id: this.getReactively("objeto.pais_id"), estatus: true}]
	});
	
	this.subscribe('municipios',()=>{
		return [{municipio_id: this.getReactively("objeto.municipio_id"), estatus: true}]
	});
	
	this.subscribe('ciudades',()=>{
		return [{estado_id: this.getReactively("objeto.estado_id"), estatus: true}]
	});
	
	this.subscribe('colonias',()=>{
		return [{ciudad_id: this.getReactively("objeto.ciudad_id"), estatus: true}]
	});
	 
	this.helpers({
	  estadosCiviles : () => {
		  return EstadoCivil.find();
	  },
	  nacionalidades : () => {
		  return Nacionalidades.find();
	  },
	  ocupaciones : () => {
		  return Ocupaciones.find();
	  },
	  paises : () => {
		  return Paises.find();
	  },
	  estados : () => {
		  return Estados.find();
	  },
	  municipios : () => {
		  return Municipios.find();
	  },
	  ciudades : () => {
		  return Ciudades.find();
	  },
	  colonias : () => {
		  return Colonias.find();
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
			
			objeto.profile.estatus = true;
			objeto.profile.usuarioInserto = Meteor.userId();
			Meteor.call('createUsuario', objeto, "Cliente");
			toastr.success('Guardado correctamente.');
			this.usuario = {};
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
			$state.go('root.clientesLista');
		
	};

	this.actualizar = function(objeto,form)
	{
			if(form.$invalid){
		        toastr.error('Error al actualizar los datos.');
		        return;
		  }
		  
		  /*
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
      
      */
	};

};