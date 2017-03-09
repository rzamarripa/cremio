angular.module("creditoMio")
.controller("TiposNotasCreditoCtrl", TiposNotasCreditoCtrl);
 function TiposNotasCreditoCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	$reactive(this).attach($scope);
	this.action = true;
	this.nuevo = true;	 
	this.objeto = {}; 
	
	this.subscribe('tiposNotasCredito',()=>{
		return [{
			
		}]
	 });
	 
	this.helpers({
		tiposNotas : () => {
			return TiposNotasCredito.find({});
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
			TiposNotasCredito.insert(objeto);
			toastr.success('Guardado correctamente.');
			this.objeto = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
			form.$setUntouched();
		
	};

	this.editar = function(id)
	{
			this.objeto = TiposNotasCredito.findOne({_id:id});
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
			TiposNotasCredito.update({_id:idTemp},{$set : objeto});
			toastr.success('Actualizado correctamente.');
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
			form.$setUntouched();
	};

	this.cambiarEstatus = function(id)
	{
			var objeto = TiposNotasCredito.findOne({_id:id});
			if(objeto.estatus == true)
				objeto.estatus = false;
			else
				objeto.estatus = true;
			
			TiposNotasCredito.update({_id: id},{$set :	{estatus : objeto.estatus}});
	};	
};