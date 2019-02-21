angular.module("creditoMio")
.controller("EmpresasCtrl", EmpresasCtrl);
 function EmpresasCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
 	windows = rc;
  this.action = true;
  this.nuevo = true;
   this.objeto = {};	 

  
	this.subscribe('empresas',()=>{
		return [{estatus:true}]
	 });
  
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

    if (this.getReactively("pais_id") !=  "")
    {
        //console.log("Cambio pais:", this.pais_id);    
        return [{pais_id: this.getReactively("pais_id"), estatus: true}];
        
    }   

    else 
        return [{estatus: true}];

  });


  this.subscribe('municipios',()=>{
    if (this.getReactively("estado_id") !=  "")
    { 
        //console.log("Cambio Estado");
        return [{estado_id: this.getReactively("estado_id"), estatus: true}];
        
    }   

    else 
        return [{estatus: true}]; 

  });

  

  this.subscribe('ciudades',()=>{
    if (this.getReactively("municipio_id") !=  "")
    {
        //console.log("Cambio Muni");
        return [{municipio_id: this.getReactively("municipio_id"), estatus: true}];
        
    }   

    else 
        return [{estatus: true}];

  });

  this.subscribe('colonias',()=>{
    if (this.getReactively("ciudad_id") !=  "")
        return [{ciudad_id: this.getReactively("ciudad_id"), estatus: true}];

    else 
        return [{estatus: true}];

  });
  

	 
	this.helpers({
	  empresas : () => {
		  return Empresas.find({},{sort :{ nombre: 1} }).fetch();
	  },
    nacionalidades : () => {
      return Nacionalidades.find();
    },
    ocupaciones : () => {
      return Ocupaciones.find();
    },

    paises : () => {
      return Paises.find({},{sort :{ nombre: 1} });
    },

    estados : () => {
          return Estados.find({},{sort :{ nombre: 1} });
    },
    municipios : () => {
      return Municipios.find({},{sort :{ nombre: 1} });
    },
    ciudades : () => {
      return Ciudades.find({},{sort :{ nombre: 1} });
    },
    colonias : () => {
      return Colonias.find({},{sort :{ nombre: 1} });
    },
 
    documentos : () => {
      return Documentos.find({},{sort :{ nombre: 1} });
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
			//console.log(objeto);
			objeto.estatus = true;
			objeto.usuarioInserto = Meteor.userId();
			Empresas.insert(objeto);
			toastr.success('Guardado correctamente.');
			console.log(objeto)
			this.objeto = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
		
	};

	this.editar = function(id)
	{
	    this.objeto = Empresas.findOne({_id:id});
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
			Empresas.update({_id:idTemp},{$set : objeto});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
      form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
			var objeto = Empresas.findOne({_id:id});
			if(objeto.estatus == true)
				objeto.estatus = false;
			else
				objeto.estatus = true;
			
			Empresas.update({_id: id},{$set :  {estatus : objeto.estatus}});
  };	
};