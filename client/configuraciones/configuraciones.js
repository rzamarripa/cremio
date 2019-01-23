angular.module("creditoMio")
.controller("ConfiguracionesCtrl", ConfiguracionesCtrl);
 function ConfiguracionesCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
 	window.rc = rc;
	
	this.action = true;
	this.nuevo 	= true;
	
	this.actionArreglo 					= true;
	this.actionArregloComision 	= true;
		 
	this.objeto 		= {}; 
	this.objeto_id 	= "";
	
	rc.renglonTasa			= {};
	rc.renglonComision	= {};

/*
	rc.comisionesVales.valor1 = {valor1: 3, valor2:18, porcentaje: 15 };
	rc.comisionesVales.valor2 = {valor1: 4, valor2:19, porcentaje: 14 };
	rc.comisionesVales.valor3 = {valor1: 5, valor2:20, porcentaje: 13 };
	rc.comisionesVales.valor4 = {valor1: 6, valor2:21, porcentaje: 9 };
	rc.comisionesVales.valor5 = {valor1: 7, valor2:22, porcentaje: 7 };
*/

/*
	rc.comisionesVales.valor5 = {valor1: 3, valor2:16, porcentaje: 15 };
	rc.comisionesVales.valor6 = {valor1: 3, valor2:16, porcentaje: 15 };
	rc.comisionesVales.valor7 = {valor1: 3, valor2:16, porcentaje: 15 };
*/
			
	rc.arregloTasa  			= [];
	rc.arregloComisiones  = [];
	
			
	this.subscribe('configuraciones',()=>{
		return [{}]
	});
	
		 
	this.helpers({
		objeto : () => {
			
			var connfiguraciones = Configuraciones.findOne();
			
			if (connfiguraciones != undefined)
			{
					rc.arregloTasa 				= connfiguraciones.arregloTasa;
					rc.arregloComisiones	= connfiguraciones.arregloComisiones
			}
			
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
			
			_.each(rc.arregloComisiones, function(elemento){					
					delete elemento.$$hashKey;
			});
			
			objeto.arregloTasa 				= rc.arregloTasa;
			objeto.arregloComisiones	= rc.arregloComisiones;
			
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
			this.actionArregloComision = true;
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
	
	this.cancelarArreglo = function()
	{
			this.actionArreglo 	= true;
			rc.renglonTasa 			= {};;
	}
	
	this.quitar = function(objeto){
			
			
	}
	
	
	this.agregarComision = function(objeto)
	{
			
			if (objeto.valor1 == undefined || objeto.valor1 === "" || objeto.valor1 < 0){ toastr.warning("Teclee día 1."); return; }
			if (objeto.valor2 == undefined || objeto.valor2 === "" || objeto.valor2 < 0){ toastr.warning("Teclee día 1."); return; }
			if (objeto.porcentaje == undefined || objeto.porcentaje === "" || objeto.porcentaje < 0 ){ toastr.warning("Teclee el porcentaje."); return; }
					
			if (rc.arregloComisiones == undefined)
					rc.arregloComisiones = [];
			
			rc.renglonComision.numero	= rc.arregloComisiones.length + 1;
			
			rc.arregloComisiones.push(rc.renglonComision);
			rc.renglonComision = {};						
	}
	
	this.editarArregloComision = function(objeto)
	{
			this.actionArregloComision = false;
			
			rc.renglonComision.numero			= objeto.numero;
			rc.renglonComision.valor1			= objeto.valor1;
			rc.renglonComision.valor2			= objeto.valor2;
			rc.renglonComision.porcentaje	= objeto.porcentaje;
	}
	
	this.actualizarArregloComision = function(objeto)
	{
			
			
			if (objeto.valor1 == undefined || objeto.valor1 === "" || objeto.valor1 < 0){ toastr.warning("Teclee día 1."); return; }
			if (objeto.valor2 == undefined || objeto.valor2 === "" || objeto.valor2 < 0){ toastr.warning("Teclee día 1."); return; }
			if (objeto.porcentaje == undefined || objeto.porcentaje === "" || objeto.porcentaje < 0 ){ toastr.warning("Teclee el porcentaje."); return; }
			
			_.each(rc.arregloComisiones, function(elemento){					
					if (elemento.numero == objeto.numero)
					{
							elemento.valor1			= objeto.valor1;
							elemento.valor2			= objeto.valor2;
							elemento.porcentaje	= objeto.porcentaje;
							return;
					}
			});
			
			rc.renglonComision = {};
			this.actionArregloComision 	= true;
	}
	
	this.cancelarArregloComision = function()
	{
			this.actionArregloComision = true;
			rc.renglonComision = {};;
	}
	
	
	
	
};