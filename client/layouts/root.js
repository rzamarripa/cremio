angular.module("creditoMio").controller("RootCtrl", ['$scope', '$meteor', '$reactive', function ($scope, $meteor, $reactive)
{
	let root = $reactive(this).attach($scope);
	this.buscar = {};
	this.buscar.nombre = "";
	this.buscando = false;
	this.clientesRoot = [];
	this.clientes_ids = [];
	this.hoy = new Date();
	this.caja = {};
	
	this.subscribe('creditos', () => {
		return [{estatus : 2, cliente_id : { $in : this.getReactively("clientes_ids")}}];
	})
	
	this.subscribe('cajas',()=>{
		//console.log(Meteor.user())
		return [{sucursal_id: Meteor.user() != undefined ? Meteor.user().profile? Meteor.user().profile.sucursal_id : "":""}]
	})

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
	  	caja : () =>{
		  		return Cajas.findOne(Meteor.user() != undefined ? Meteor.user().profile? Meteor.user().profile.caja_id : "":"");
	  	},
		clientesRoot : () => {
			var clientes = Meteor.users.find({
		  	"profile.nombreCompleto": { '$regex' : '.*' + this.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' },
		  	roles : ["Cliente"]
			}, { sort : {"profile.nombreCompleto" : 1 }}).fetch();
			if(clientes){
				this.clientes_ids = _.pluck(clientes, "_id");
			
				_.each(clientes, function(cliente){
					cliente.profile.creditos = Creditos.find({cliente_id : cliente._id, estatus : 2}).fetch();
				})
			}
						
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
  }    
}])