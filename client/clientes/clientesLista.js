angular.module("creditoMio")
.controller("ClientesListaCtrl", ClientesListaCtrl);
 function ClientesListaCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
  this.action = true;
  this.nuevo = true;	 
  this.objeto = {}; 
  this.buscar = {};
  this.buscar.nombre = "";
  this.tipoBusqueda = "numero"; 
 
  window.rc = rc;
  rc.clientes = [];
  
  
  this.subscribe('buscarClientes', () => 
  {
		if (this.getReactively("tipoBusqueda") == "nombre")
		{  			 
			if(this.getReactively("buscar.nombre").length > 4){
				return [{
			    options : { limit: 20 },
			    where : { 
						nombreCompleto : this.getReactively('buscar.nombre')
					} 		   
		    }];
			}
		}	
  });
  	
  this.subscribe('buscarClientesNumero', () => 
  {
		if (this.getReactively("tipoBusqueda") == "numero")
		{			
			rc.clientesRoot = [];
			rc.nc = rc.getReactively("buscar.nombre");
			rc.nd = rc.getReactively("buscar.nombre");
			
			var sucursal = Sucursales.findOne(Meteor.user().profile.sucursal_id); 
			if (sucursal == undefined) return;
			
			var clave = sucursal.clave;
			var numero = parseInt(rc.nc);

			if (isNaN(numero) == false) //es Número
			{

				if (numero < 10)
				{
					 rc.nc = clave + '-C000' + numero.toString();
					 rc.nd = clave + '-D000' + numero.toString();
				}	 
				else if (numero < 100)
				{
	  			 rc.nc = clave + '-C00' + numero.toString();
					 rc.nd = clave + '-D00' + numero.toString();
	  		}	 
	  		else if (numero < 1000)
	  		{
	  			 rc.nc = clave + '-C0' + numero.toString();	 
					 rc.nd = clave + '-D0' + numero.toString();	 
	  		}	 
	  		else
	  		{
	  			 rc.nc = clave + '-C' + numero.toString();
					 rc.nd = clave + '-D' + numero.toString();
	  		}	 

			}			
			if(rc.getReactively("buscar.nombre").length > 0 )
			{
					return [{
				    options : { limit: 20 },
				    where : { 
							numeroCliente : [rc.nc, rc.nd]
						} 		   
			    }];
			}
		}	
  }); 
 	 
  
  this.helpers({
		clientes : () => {

			if (this.getReactively("tipoBusqueda") == "nombre")
			{
				var cli = Meteor.users.find({
			  	"profile.nombreCompleto": { '$regex' : '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' },
			  	roles : {$in : ["Cliente", "Distribuidor"]}
				}, { sort : {"profile.nombreCompleto" : 1 }}).fetch();
			}
			else if (this.getReactively("tipoBusqueda") == "numero")
			{
				var cli = Meteor.users.find({roles : {$in : ["Cliente", "Distribuidor"]}}).fetch();
			}	
				
			if (cli != undefined)
			{
					_.each(cli, function(c){
						if (c.profile.sucursal_id != undefined)	
							 Meteor.call("getSucursal", c.profile.sucursal_id,  function(error,result){
						     	if (result){
						      		c.profile.sucursal = result.nombreSucursal;
						      		$scope.$apply()
						      }
							});							
					});
			}
			return cli;
		},	
	});
	
	this.tieneFoto = function(sexo, foto){
		//console.log(sexo)
	  if(foto === undefined || foto === "")
	  {
		  if(sexo === "Masculino")
			  return "img/badmenprofile.png";
			else if(sexo === "Femenino"){
				return "img/badgirlprofile.png";
			}else{
				return "img/badprofile.png";
			}
			  
	  }else{
		  return foto;
	  }
  };
    
  this.convertir = function(tipo, objeto) {
	  
	  if (tipo == "Aval")
	  {
	    	customConfirm('¿Estás seguro de convertir a Aval ?', function() {		    	
		    		loading(true);
		    		Meteor.call('setClienteAval', objeto._id, function(e,r){
		          if (r)
		          {
			           	toastr.success('Guardado correctamente.');
			           	loading(false);
 
 		          }
		      });
		    
		    });
		}   
		
		 	
  }
   
};