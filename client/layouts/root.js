angular.module("creditoMio").controller("RootCtrl", ['$scope', '$meteor', '$reactive','$state', function ($scope, $meteor, $reactive, $state)
{
	let root = $reactive(this).attach($scope);
	window.root = root;
	this.buscar = {};
	this.buscar.nombre = "";
	this.buscando = false;
	this.clientesRoot = [];
	this.clientes_ids = [];
	this.referencias = [];
	this.hoy = new Date();
	this.caja = {};
	this.nombreCliente = "";
	//var cmd = require('node-cmd');
	
	

	this.subscribe('buscarClientes', () => {
		if(this.getReactively("buscar.nombre").length > 3){
			//console.log(root.buscar.nombre);
			root.buscando = true;
			return [{
		    options : { limit: 20 },
		    where : { 
					nombreCompleto : this.getReactively('buscar.nombre')
				} 		   
	    }];
		}
		else if (this.getReactively("buscar.nombre").length  == 0 )
			this.buscando = false;		
  });  
  	this.helpers({
		clientesRoot : () => {
			var clientes = Meteor.users.find({
		  	"profile.nombreCompleto": { '$regex' : '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' },
		  	roles : ["Cliente"]
			}, { sort : {"profile.nombreCompleto" : 1 }}).fetch();
			if(clientes){
				this.clientes_ids = _.pluck(clientes, "_id");
			
				_.each(clientes, function(cliente){
					cliente.profile.creditos = Creditos.find({cliente_id : cliente._id, estatus : 4}).fetch();
				})
			}
						
			return clientes;
			
		},
		clienteUsuario: () => {
			var clientes = Meteor.users.find().fetch()
			_.each(clientes, function(cliente){
				root.nombreCliente = cliente.profile.nombreCompleto

			});
			console.log(clientes)
						
			return clientes;
			
		}
	});

	this.verMenu =()=>{
		var user= Meteor.user();
		//console.log("usuario",user);
		if( user && user.roles && user.roles[0]=="Cajero"){
			
			var caja = this.caja;
			//console.log("caja",caja);
			if (caja && caja.estadoCaja=="Cerrada")
				return false;
		}
		return true;
	}

	this.tieneFoto = function(foto, sexo){
		
	  if(foto === undefined){
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
 

	this.diarioCobranza= function(objeto) {

		//console.log(objeto,"objetillo")
		objeto.fechaInicial = objeto[0].fechaSolicito
		objeto.objetoFinal = objeto[objeto.length - 1];
		objeto.fechaFinal = objeto.objetoFinal.fechaSolicito
		//console.log(objeto,"actualizado")


	};

	//Funcion Evalua la sessión del usuario
	this.autorun(function() {
    if(!Meteor.user()){	    
    	$state.go('anon.login');
    }    
  });	




}])