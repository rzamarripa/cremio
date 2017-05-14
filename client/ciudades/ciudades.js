angular.module("creditoMio")
.controller("CiudadesCtrl", CiudadesCtrl);
 function CiudadesCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
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
		return [{pais_id: this.getReactively('buscar.pais_id')? this.getReactively('buscar.pais_id'):""
						,estado_id: this.getReactively('buscar.estado_id')? this.getReactively('buscar.estado_id'):""
						,municipio_id: this.getReactively('buscar.municipio_id')? this.getReactively('buscar.municipio_id'):""
		}]
	});	 
	this.helpers({
	  ciudades : () => {
		  return Ciudades.find({pais_id: this.getReactively('buscar.pais_id'),
			  										estado_id: this.getReactively('buscar.estado_id'),
			  										municipio_id: this.getReactively('buscar.municipio_id')});
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
			Ciudades.insert(objeto);
			toastr.success('Guardado correctamente.');
			this.objeto = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
		
	};

	this.editar = function(id)
	{
	    this.objeto = Ciudades.findOne({_id:id});
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
			Ciudades.update({_id:idTemp},{$set : objeto});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
      form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
			var objeto = Ciudades.findOne({_id:id});
			if(objeto.estatus == true)
				objeto.estatus = false;
			else
				objeto.estatus = true;
			
			Ciudades.update({_id: id},{$set :  {estatus : objeto.estatus}});
  };	
};