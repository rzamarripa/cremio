angular.module("creditoMio")
.controller("ColoniasCtrl", ColoniasCtrl);
 function ColoniasCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
 	window = rc;
 
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  this.buscar = {};
  
  this.subscribe('paises',()=>{
		return [{estatus: true}]
	});
	this.subscribe('estados',()=>{
		return [{estatus: true}]
	});
	this.subscribe('municipios',()=>{
		return [{estatus: true}]
	});
	this.subscribe('ciudades',()=>{
		return [{estatus: true}]
	});
  
	this.subscribe('colonias',()=>{	
		return [{estatus:true}]
	});	
		
	 
	this.helpers({
	  colonias : () => {
		  return Colonias.find({},{sort: {nombre: 1}});
	  },
	  paises : () => {
		  return Paises.find();
	  },
	  estadosBuscar : () => {
		  return Estados.find({pais_id: this.getReactively('buscar.pais_id')? this.getReactively('buscar.pais_id'):""});
	  },
	  estados : () => {
		  return Estados.find({pais_id: this.getReactively('objeto.pais_id')? this.getReactively('objeto.pais_id'):""});
	  },
	  municipiosBuscar : () => {
		  return Municipios.find({estado_id: this.getReactively('buscar.estado_id')? this.getReactively('buscar.estado_id'):""});
	  },
	  municipios : () => {
		  return Municipios.find({estado_id:this.getReactively('objeto.estado_id')? this.getReactively('objeto.estado_id'):""});
	  },
	  ciudadesBuscar : () => {
		  return Ciudades.find({municipio_id: this.getReactively('buscar.municipio_id')? this.getReactively('buscar.municipio_id'):""});
	  },
	  ciudades : () => {
		  return Ciudades.find({municipio_id: this.getReactively('objeto.municipio_id')? this.getReactively('objeto.municipio_id'):""});
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
			objeto.usuarioInserto = Meteor.userId();
			Colonias.insert(objeto);
			toastr.success('Guardado correctamente.');
			this.objeto = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
		
	};

	this.editar = function(id)
	{
	    this.objeto = Colonias.findOne({_id:id});
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
			Colonias.update({_id:idTemp},{$set : objeto});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
      form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
			var objeto = Colonias.findOne({_id:id});
			if(objeto.estatus == true)
				objeto.estatus = false;
			else
				objeto.estatus = true;
			
			Colonias.update({_id: id},{$set :  {estatus : objeto.estatus}});
  };	
};