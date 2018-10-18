angular.module("creditoMio")
.controller("ConfiguracionesCtrl", ConfiguracionesCtrl);
 function ConfiguracionesCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
 	window.rc = rc;
	
	this.action = true;
	this.nuevo 	= true;
	
	this.actionArreglo = true;
		 
	this.objeto 		= {}; 
	this.objeto_id 	= "";
	
	rc.renglonTasa	= {};
			
	rc.arregloTasa  = [];
	
			
	this.subscribe('configuraciones',()=>{
		return [{}]
	});
	
		 
	this.helpers({
		objeto : () => {
			
			var connfiguraciones = Configuraciones.findOne();
			
			if (connfiguraciones != undefined)
					rc.arregloTasa = connfiguraciones.arregloTasa;
			
			
			return connfiguraciones;
		},
	}); 
	
	this.editar = function()
	{
		this.action = false;	
	};
	
	this.cancelar = function()
	{
		this.action = true;	
		rc.renglonTasa = {};
		
	};
	

	this.actualizar = function(objeto,form)
	{
			if(form.$invalid){
				toastr.error('Error al actualizar los datos.');
				return;
			}
	
			_.each(rc.arregloTasa, function(elemento){					
					delete elemento.$$hashKey;
			});
	
			objeto.arregloTasa = rc.arregloTasa;
			
			var datos = Configuraciones.findOne();
			if (datos == undefined)
					Configuraciones.insert(objeto);		
			else
			{
					var idTemp = objeto._id;
					delete objeto._id;		
					Configuraciones.update({_id:idTemp},{$set : objeto});
					toastr.success('Actualizado correctamente.');
			}		
			
			this.action = true;
			this.actionArreglo = true;
	};
	
	this.agregar = function(objeto)
	{
			
			if (objeto.cantidad == undefined || objeto.cantidad === "" || objeto.cantidad < 0){ toastr.warning("Teclee la cantidad."); return; }
			if (objeto.seis == undefined || objeto.seis === "" || objeto.seis < 0){ toastr.warning("Teclee la tasa para 6."); return; }
			if (objeto.ocho == undefined || objeto.ocho === "" || objeto.ocho < 0 ){ toastr.warning("Teclee la tasa para 8."); return; }
			if (objeto.diez == undefined || objeto.diez === "" || objeto.diez < 0 ){ toastr.warning("Teclee la tasa para 10."); return; }
			if (objeto.doce == undefined || objeto.doce === "" || objeto.doce < 0 ){ toastr.warning("Teclee la tasa para 12."); return; }
			if (objeto.catorce == undefined || objeto.catorce === "" || objeto.catorce < 0 ){ toastr.warning("Teclee la tasa para 14."); return; }
			if (objeto.dieciseis == undefined || objeto.dieciseis === "" || objeto.dieciseis < 0 ){ toastr.warning("Teclee la tasa para 16."); return; }
					
			if (rc.arregloTasa == undefined)
					rc.arregloTasa = [];
			
			rc.renglonTasa.numero	= rc.arregloTasa.length + 1;
			
			rc.arregloTasa.push(rc.renglonTasa);
			rc.renglonTasa = {};
			
	}
	
	this.editarArreglo = function(objeto)
	{
			this.actionArreglo = false;
			
			rc.renglonTasa.numero			= objeto.numero;
			rc.renglonTasa.cantidad		= objeto.cantidad;
			rc.renglonTasa.seis				= objeto.seis;
			rc.renglonTasa.ocho				= objeto.ocho;
			rc.renglonTasa.diez				= objeto.diez;
			rc.renglonTasa.doce				= objeto.doce;
			rc.renglonTasa.catorce		= objeto.catorce;
			rc.renglonTasa.dieciseis	= objeto.dieciseis;			
			
	}
	
	this.actualizarArreglo = function(objeto)
	{

			if (objeto.cantidad == undefined || objeto.cantidad === "" || objeto.cantidad < 0 ){ toastr.warning("Teclee la cantidad."); return; }
			if (objeto.seis == undefined || objeto.seis === "" || objeto.seis < 0){ toastr.warning("Teclee la tasa para 6."); return; }
			if (objeto.ocho == undefined || objeto.ocho === "" || objeto.ocho < 0 ){ toastr.warning("Teclee la tasa para 8."); return; }
			if (objeto.diez == undefined || objeto.diez === "" || objeto.diez < 0 ){ toastr.warning("Teclee la tasa para 10."); return; }
			if (objeto.doce == undefined || objeto.doce === "" || objeto.doce < 0 ){ toastr.warning("Teclee la tasa para 12."); return; }
			if (objeto.catorce == undefined || objeto.catorce === "" || objeto.catorce < 0 ){ toastr.warning("Teclee la tasa para 14."); return; }
			if (objeto.dieciseis == undefined || objeto.dieciseis === "" || objeto.dieciseis < 0 ){ toastr.warning("Teclee la tasa para 16."); return; }
			
			_.each(rc.arregloTasa, function(elemento){
					
					if (elemento.numero == objeto.numero)
					{
							elemento.cantidad		= objeto.cantidad;
							elemento.seis				= objeto.seis;
							elemento.ocho				= objeto.ocho;
							elemento.diez				= objeto.diez;
							elemento.doce				= objeto.doce;
							elemento.catorce		= objeto.catorce;
							elemento.dieciseis	= objeto.dieciseis;
							return;
					}
			});
			
			rc.renglonTasa = {};
			this.actionArreglo 	= true;
	}
	
	this.quitar = function(objeto){
			
			
	}
	
	
};