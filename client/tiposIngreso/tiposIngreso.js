angular.module("creditoMio")
.controller("TiposIngresoCtrl", TiposIngresoCtrl);
 function TiposIngresoCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);

	this.action = true;
	this.nuevo = true;	 
	this.objeto = {}; 
	
	this.subscribe('tiposIngreso',()=>{
		return [{}]
	});
	
	this.subscribe('cajas',()=>{
		return [{estatus : true}]
	}); 
	 
	this.helpers({
		tiposIngreso : () => {
			return TiposIngreso.find();
		},
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
		
		//Validación para que no agrege tipos de Ingreso si existe una caja abierta
		var ban = false;
		_.each(rc.cajas, function(caja){
				if (caja.estadoCaja == "Abierta")
				{
						toastr.warning('La ventanilla ' + caja.nombre + ' esta abierta es necesario cerrarla entes de crear un tipo de ingreso');		
						ban = true;	
						return;
				}
		});
		if (!ban)
		{		
				objeto.estatus = true;
				objeto.usuarioInserto = Meteor.userId();
				TiposIngreso.insert(objeto);
				toastr.success('Guardado correctamente.');
				this.objeto = {}; 
				$('.collapse').collapse('hide');
				this.nuevo = true;
				form.$setPristine();
				form.$setUntouched();
		}		
		
	};

	this.editar = function(id)
	{
		this.objeto = TiposIngreso.findOne({_id:id});
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
		TiposIngreso.update({_id:idTemp},{$set : objeto});
		toastr.success('Actualizado correctamente.');
		$('.collapse').collapse('hide');
		this.nuevo = true;
		form.$setPristine();
		form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
		var objeto = TiposIngreso.findOne({_id:id});
		if(objeto.estatus == true)
			objeto.estatus = false;
		else
			objeto.estatus = true;
		
		TiposIngreso.update({_id: id},{$set :	{estatus : objeto.estatus}});
	};	
};