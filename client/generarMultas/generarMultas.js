angular.module("creditoMio")
.controller("GenerarMultasCtrl", GenerarMultasCtrl);
 function GenerarMultasCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	$reactive(this).attach($scope);
  
  this.subscribe('bitacoraCron',()=>{
		return [{}]
	});	
	
	this.helpers({
	  arreglo : () => {
		  return BitacoraCron.find({});
	  },
	});  

  this.generaMultas = function(form)
	{
			if(form.$invalid){
		        toastr.error('Error .');
		        return;
		  }
		  //console.log("ir por multas");
			Meteor.call('generaMultasManual', function(error, result){           
            if (result)
            {
	            	toastr.success("Multas Generadas");
            }
      }); 
	};

	this.actualizarMultas = function(form)
	{
			if(form.$invalid){
		        toastr.error('Error .');
		        return;
		  }
			Meteor.call('actualizarMultasManual', function(error, result){
            if (result)
            {
	            	console.log(result);
	            	toastr.success("Multas Actualizadas");
            }
      }); 
	};

	this.restarMultas = function(form)
	{
			if(form.$invalid){
		        toastr.error('Error .');
		        return;
		  }
			Meteor.call('actualizarMultasRestarUnDia', function(error, result){           
					//console.log(result);
            if (result)            
            {
	            	console.log(result);
	            	toastr.success("Multas Restadas");
            }
      }); 
	};
	
	this.generaMultasVales = function(form)
	{
			if(form.$invalid){
		        toastr.error('Error .');
		        return;
		  }
		  //console.log("ir por multas vales");
			Meteor.call('generaMultasValesManual', function(error, result){           
            if (result)
            {
	            	toastr.success("Multas Vales Generadas");
            }
      }); 
	};

	this.actualizarMultasVales = function(form)
	{
			if(form.$invalid){
		        toastr.error('Error .');
		        return;
		  }
			Meteor.call('actualizarMultasValesManual', function(error, result){
            if (result)
            {
	            	toastr.success("Multas Vales Actualizadas");
            }
      }); 
	};

	this.restarMultasVales = function(form)
	{
			if(form.$invalid){
		        toastr.error('Error .');
		        return;
		  }
			Meteor.call('actualizarMultasValesRestarUnDia', function(error, result){           
					//console.log(result);
            if (result)            
            {
	            	console.log(result);
	            	toastr.success("Multas Vales Restadas");
            }
      }); 
	};

	this.deprecarNC = function(form)
	{
			if(form.$invalid){
		        toastr.error('Error .');
		        return;
		  }
			Meteor.call('deprecarNotasDeCreditoManual', function(error, result){       
            if (result)
            {
	            	toastr.success("notas de Crédito Deprecadas");
            }
      }); 
	};
	
	this.CopiarDocumentos = function(form)
	{
			if(form.$invalid){
		        toastr.error('Error .');
		        return;
		  }
			Meteor.call('copiarDocumentos', function(error, result){       
            if (result)
            {
	            	toastr.success("Documentos Copiados");
            }
      }); 
	};

	
};