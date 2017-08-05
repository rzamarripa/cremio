angular.module("creditoMio")
.controller("diasInhabilesCtrl", diasInhabilesCtrl);
 function diasInhabilesCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  this.buscar = {};
  
	this.subscribe('diasInhabiles',()=>{
		return [{}]
		
	});	 
	this.helpers({
	  diasInhabiles : () => {
		  return DiasInhabiles.find({}, {sort: {dia:  -1,fecha: -1}}).fetch();
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
			
			if (objeto.tipo == "FECHA")
			{
					var f = new Date(objeto.fecha);
					console.log(f);
					objeto.fecha = f;
					console.log(objeto.fecha);
			}
				
			
			DiasInhabiles.insert(objeto);
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
			DiasInhabiles.update({_id:idTemp},{$set : objeto});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
      form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
			var objeto = DiasInhabiles.findOne({_id:id});
			if(objeto.estatus == true)
				objeto.estatus = false;
			else
				objeto.estatus = true;
			
			DiasInhabiles.update({_id: id},{$set :  {estatus : objeto.estatus}});
  };	
  
  this.getDia = function(numeroDia)
	{
			var nombreDia = "";
			switch(numeroDia){
				case	1: nombreDia = "LUNES";		 break;
				case	2: nombreDia = "MARTES";	 break;
				case	3: nombreDia = "MIÉRCOLES";break;
				case	4: nombreDia = "JUEVES";	 break;
				case	5: nombreDia = "VIERNES";	 break;
				case	6: nombreDia = "SÁBADO";	 break;
				case	7: nombreDia = "DOMINGO";	 break;
				
			}
			return nombreDia;
	}	
  
};