angular.module("creditoMio")
.controller("RootCtrl", RootCtrl);
 function RootCtrl($scope, $meteor, $reactive,  $state, toastr) {

	let rc = $reactive(this).attach($scope);
	window.rc = rc;
	
	this.buscar = {};
	this.buscar.nombre = "";
	this.buscar.numeroCliente = "";
	this.buscando = false;
	
	rc.porNumero = false;
	rc.porCliente = false;
	
	//this.clientesRoot = [];
	this.clientes_ids = [];

	this.hoy = new Date();
	
	rc.nc = "";
	rc.nd = "";
	rc.sucursal 		= {};
	rc.sucursal_id	= "";
	rc.sucursales 	= [];
	
	rc.vales 						= 0;
	rc.valesAcreditados = 0;
	rc.prospectos 			= 0;
	
	//this.caja = {};
	//this.nombreCliente = "";
	var user = Meteor.users.findOne();
	
	if (user != undefined && user.username != "admin")
	{
		
			this.subscribe('sucursales', () => {
					 return [{}]
			});	
			
			this.subscribe('creditos', () => {
		 		if (user.username != "admin" && user.roles[0] != "Distribuidor")
					 return [{sucursal_id :	 Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
					 					tipo 				: "vale",
					 					estatus			: {$in: [1,2]} }]
			});
			
			this.subscribe('prospectos', () => {
		 		if (user.username != "admin" && user.roles[0] != "Distribuidor")
					 return [{sucursal_id :	 Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
					 					estatus			: 1 }]
			});	
			
			this.subscribe('buscarRootClientesDistribuidores', () => {
				
				if(rc.getReactively("buscar.nombre").length > 4){
					
					var rol = rc.porCliente == true ? 'Distribuidor' : 'Cliente';	
								
					rc.clientesRoot = [];
					rc.buscando = true;			
					return [{
				    options : { limit: 20 },
				    where : { 
					    sucursal_id		 : rc.sucursal_id, 
							nombreCompleto : rc.getReactively('buscar.nombre'),
							rol						 : rol
						} 		   
			    }];
				}
				else if (rc.getReactively("buscar.nombre").length  == 0 )
				{
					this.buscando = false;	
				}
		
		  });  
		
			this.subscribe('buscarRootClientesDistribuidoresNumero', () => {
					
					rc.clientesRoot = [];
					rc.nc = rc.getReactively("buscar.numeroCliente");
					rc.nd = rc.getReactively("buscar.numeroCliente");
		
					var sucursal = Sucursales.findOne(rc.getReactively("sucursal_id")); 
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
					
					if(rc.getReactively("buscar.numeroCliente").length > 0 )
					{
						 rc.buscando = true;	
						return [{
					    options : { limit: 20 },
					    where : { 
								numeroCliente 			: (rc.porCliente ? rc.nd : rc.nc)
							} 		   
				    }];
					}
					else if (rc.getReactively("buscar.numeroCliente").length  == 0 ){
						this.buscando = false;		
					}
		
		  }); 
		  
		  this.helpers({
				clientesRoot : () => {
					
					if (rc.getReactively('buscar.nombre').length > 4)
					{
						var clientes = Meteor.users.find({
							"profile.nombreCompleto": { '$regex' : '.*' + rc.getReactively('buscar.nombre') || '' + '.*', '$options' : 'i' },
					  	roles : {$in : ["Cliente", "Distribuidor"]}
						}, { sort : {"profile.nombreCompleto" : 1 }}).fetch();
					}
					
					if(rc.getReactively("buscar.numeroCliente").length > 0 )
					{
						
						var clientes = Meteor.users.find({$or: [{"profile.numeroCliente": (rc.porCliente ? rc.nd : rc.nc)}]}).fetch();
						
					}
						
			
					if(clientes){
						this.clientes_ids = _.pluck(clientes, "_id");
					
						_.each(clientes, function(cliente){
							cliente.profile.creditos = Creditos.find({cliente_id : cliente._id, estatus : 4}).fetch();
						})
					}
								
					return clientes;
					
				},
				sucursal : () => {			
					if (user.username != "admin")
					{	 
						var s = Sucursales.findOne({_id: Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : ""});
						if (s != undefined){
								rc.sucursal 		= s;
								rc.sucursal_id 	= s._id;
						}
						return rc.sucursal;
					}	
				},	
				sucursales : () => {	
					if (user.username != "admin")
					{	 
						 return Sucursales.find();
					}	
				},
				vales : () =>{
					return Creditos.find({sucursal_id :	 Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
											 					tipo 				: "vale",
											 					estatus			: 1 }).count();
				},
				valesAcreditados : () =>{
					return Creditos.find({sucursal_id :	 Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
											 					tipo 				: "vale",
											 					estatus			: 2 }).count();
				},
				prospectos : () =>{
					return Prospectos.find({sucursal_id :	 Meteor.user() != undefined ? Meteor.user().profile.sucursal_id : "",
					 												estatus			: 1 }).count();
				},
			});
  
  }
 
	//Funcion Evalua la sessión del usuario
	
	this.autorun(function() {
    if(!Meteor.user()){	    
    	$state.go('anon.login');
    }    
  });	

	this.descargarFormato = function(op) 
  {	
	  if (op == 5)
	  {
		  	var datos = {};
				loading(true);
				Meteor.call('report', {
		      templateNombre: "TablaAmortizacionBigBale",
		      reportNombre: "TablaAmortizacionBigBaleOut",
		      type: 'pdf',  
		      datos: datos,
			    }, function(err, file) {
			      if(!err){
			        downloadFile(file);		 
			        loading(false);       
			      }else{
			        toastr.warning("Error al generar el reporte");
			        loading(false);
			      }
			  });	
	  }
	  else
	  {
		  loading(true);
	    Meteor.call('formaSolicitud',op, function(error, response) {     
	       if(error)
	       {
	        console.log('ERROR :', error);
	        loading(false);
	        return;
	       }
	       else
	       {
		       		downloadFile(response);
					 		loading(false);
			    }  
	    });
		}
  };
  
  this.cambiarNumero = function() 
  {
	  this.buscar.nombre = "";
		this.buscar.numeroCliente = "";
  	rc.porNumero = false;
  };
  this.cambiarNombre = function() 
  {
  	this.buscar.nombre = "";
		this.buscar.numeroCliente = "";
  	rc.porNumero = true;

  };
  
  
  this.cambiarCliente = function() 
  {
  	rc.porCliente = false;
  };
  this.cambiarDistribuidor = function() 
  {
  	rc.porCliente = true;

  };
  
 

};