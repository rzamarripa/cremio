angular.module("creditoMio")
.controller("CajasActivasCtrl", CajasActivasCtrl);
 function CajasActivasCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
	
	this.action = true;
	this.nuevo = true;	 
	this.objeto = {}; 
	this.buscar = {};
	

	this.subscribe('cajas',()=>{
		return [{sucursal_id: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "", estadoCaja:"Abierta"}]
	});

	this.subscribe('tiposIngreso',()=>{
		return [{
			estatus : true
		}]
	});
	this.subscribe('cuentas',()=>{
		return [{
			estatus : 1
		}]
	});
	this.subscribe('allCajeros',()=>{
		return [{
		}]
	});



	this.helpers({
		cajas : () => {
			return Cajas.find();
		},
		tiposIngreso : () => {
			return TiposIngreso.find()
		},
		cajeros : () =>{
			return Meteor.users.find({roles : ["Cajero"]});
		},
		cuentas : () =>{
			var cuentas  = Cuentas.find({}).fetch();
			var retorno = {};
			_.each(cuentas,function(cuenta){
				if(!retorno[cuenta.tipoIngreso_id])
					retorno[cuenta.tipoIngreso_id]=[]
				retorno[cuenta.tipoIngreso_id].push(cuenta);
			})
		
			return retorno;
		}

	});

	this.getMontos=(objeto)=>{
		var r = '<table class="table table-bordered"> <tbody>';
		for(i in objeto.cuenta){
			r+="<tr>"
			try{
				c=Cuentas.findOne(objeto.cuenta[i].cuenta_id)
				
				r+="<td>"+c.nombre+"</td>";
				r+='<td class="text-right">'+ ((objeto.cuenta[i].saldo+"").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"))+"</td>";
			}catch(e){

			}
			r+="</tr>"
		}
		r+="</tbody></table>"
		return r;
	}
	this.getCajero = (objeto) => {
		c=Meteor.users.findOne(objeto.usuario_id)
		if(c && c.profile && c.profile.nombreCompleto)
			return c.profile.nombreCompleto
		return ""
	}

	
	
};