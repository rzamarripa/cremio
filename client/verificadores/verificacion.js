angular
.module("creditoMio")
.controller("VerificacionCtrl", VerificacionCtrl);
function VerificacionCtrl($scope, $meteor, $reactive,  $state, $stateParams, toastr) {

	let rc = $reactive(this).attach($scope);
	
	window = rc;
	this.actionGarantia = true;
	this.conG = 0;
	this.numG = 0;
	this.garantias = [];
  this.garantia = {};
	
  //this.action = true;
	let Cred = this.subscribe('creditos',()=>{
			return [{requiereVerificacion : true }]
	});
		
  this.helpers({
	  creditos : () => {
		  return Creditos.find();
	  },
	  datosCreditos : () => {
			if(Cred.ready()){
				_.each(rc.creditos, function(credito){
					
						var cliente = {};
						Meteor.call('getUsuario', credito.cliente_id, function(error, result) {
						   if(error)
						   {
							    console.log('ERROR :', error);
							    return;
						   }
						   if(result)
						   {	
								 		cliente = result;
										credito.nombreCliente = cliente.nombreCompleto;
										//$scope.$apply();
							 }
						});
				})
			}
	  }
  });
  
  this.guardar = function(objeto, form)
	{	
			if(form.$invalid){
		        toastr.error('Error al guardar los datos.');
		        return;
		  }
			objeto.estatus = true;
			objeto.credito_id = $stateParams.id;
			objeto.garantias = angular.copy(this.garantias);
			
			Verificaciones.insert(objeto);
			Creditos.update({_id: objeto.credito_id}, {$set:{estatus: "1"}})
			
			
			var idTemp = objeto.credito_id;
			delete objeto.credito_id;		
			Creditos.update({_id:idTemp},{$set : objeto});
			
			
			toastr.success('Guardado correctamente.');
			this.objeto = {}; 
			$('.collapse').collapse('hide');
			this.nuevo = true;
			form.$setPristine();
	    form.$setUntouched();
			
			
			
		
	}
  
  
  
  
  this.insertarGarantia = function()
	{
			/*
			//Validar que no venga vacio
			if (this.mes==null) 
			{
				toastr.error('Seleccionar Mes.');
				return;
			}	
			//validar que vengan mes y cantidad
			if (this.mes.nombre == null || this.mes.cantidad == null) 
			{
				toastr.error('Seleccionar Mes y Cantidad');
				return;
			}	
			
			*/
			
			//incremeneto
			this.conG = this.conG + 1;
			this.garantia.num = this.conG;
			
			this.garantias.push(this.garantia);	
			this.garantia={};
	};
	
	this.actualizarGarantia = function(a)
	{
			a.num = this.numG;

			_.each(this.garantias, function(av){
							if (av.num == a.num)
							{
									av.tipo = a.tipo;
									av.marca = a.marca;
									av.modelo = a.modelo;			
									av.serie = a.serie;
									av.color = a.color;
									av.estadoActual = a.estadoActual;
							}
			})
		
			this.garantia = {};
			this.numG = 0;
			this.actionGarantia = true;
	};
	
	this.cancelarGarantia = function()
	{
			this.garantia={};
			this.numG = -1;
			this.actionGarantia = true;
	};
	
	this.quitarGarantia = function(numero)
	{
			pos = functiontofindIndexByKeyValue(this.garantias, "num", numero);
	    this.garantias.splice(pos, 1);
	    if (this.garantias.length == 0) this.con = 0;
	    //reorganiza el consecutivo     
	    functiontoOrginiceNum(this.garantias, "num");
	};
	
	this.editarGarantia = function(a)
	{
			this.garantia.tipo = a.tipo;
			this.garantia.marca = a.marca;
			this.garantia.modelo = a.modelo;			
			this.garantia.serie = a.serie;
			this.garantia.color = a.color;
			this.garantia.estadoActual = a.estadoActual;
			
			this.numG = a.num;
	    this.actionGarantia = false;
	};
	
	//busca un elemento en el arreglo
	function functiontofindIndexByKeyValue(arraytosearch, key, valuetosearch) {
	    for (var i = 0; i < arraytosearch.length; i++) {
	    	if (arraytosearch[i][key] == valuetosearch) {
				return i;
			}
	    
	  }
	    return null;
  };
    
    //Obtener el mayor
	function functiontoOrginiceNum(arraytosearch, key) {
		var mayor = 0;
	    for (var i = 0; i < arraytosearch.length; i++) {
	    	arraytosearch[i][key] = i + 1;	
	    }
  };

  
};