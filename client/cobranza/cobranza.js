angular.module("creditoMio")
.controller("CobranzaCtrl", CobranzaCtrl);
 function CobranzaCtrl($scope, $meteor, $reactive, $state, toastr){
 	
 	let rc = $reactive(this).attach($scope);
 	window.rc = rc;
 	  
  this.fechaInicial = new Date();
  this.fechaInicial.setHours(0,0,0,0);
  this.fechaFinal = new Date();
  this.fechaFinal.setHours(23,0,0,0);
  rc.buscar = {};
  rc.buscar.nombre = "";
  
  var FI, FF;
  rc.cliente = {};
  rc.credito = {};
  rc.cobranza = {};

  rc.avales = [];
	rc.ihistorialCrediticio = [];
 
  rc.cobranza_id = "";
  rc.notaCobranza = {};

  
  this.selected_credito = 0;
  this.ban = false;
  
  this.subscribe("tiposCredito", ()=>{
		return [{}]
	});
	this.subscribe("estadoCivil", ()=>{
		return [{}]
	});
	this.subscribe("nacionalidades", ()=>{
		return [{}]
	});
	this.subscribe("ocupaciones", ()=>{
		return [{}]
	});
	this.subscribe("paises", ()=>{
		return [{}]
	});
	this.subscribe("estados", ()=>{
		return [{}]
	});
	this.subscribe("municipios", ()=>{
		return [{}]
	});
	this.subscribe("ciudades", ()=>{
		return [{}]
	});
	this.subscribe("colonias", ()=>{
		return [{}]
	});
	this.subscribe("empresas", ()=>{
		return [{}]
	});
		  

  this.subscribe('notas',()=>{
		return [{estatus:true}]
	});
	
	this.helpers({
		tiposCredito : () => {
			return TiposCredito.find();
		},
		cobranzas : () => {
			return rc.cobranza;
		},
		notas : () => {
			return Notas.find().fetch();
		},
		usuario : () => {
			return Meteor.users.findOne();
		},
	});

	
	this.calcularSemana = function(w, y) 
	{
			var ini, fin;
		
	    var simple = new Date(y, 0, 1 + (w - 1) * 7);
	    FI = new Date(simple);
	    FF = new Date(moment(simple).add(7,"days"));
	    
	    FF.setHours(23,59,59,999);
	    
	}
	
	this.calcularMes = function(m, y) 
	{
	    var startDate = moment([y, m]);
			var endDate = moment(startDate).endOf('month');
	    FI = startDate.toDate();
	    FF = endDate.toDate();
	    FF.setHours(23,59,59,999);
	}
	
	this.AsignaFecha = function(op)
	{	
			this.selected_credito = 0;
			this.ban = false;
			
			if (op == 0) //Vencimiento Hoy
			{
					FI = new Date();
				  FI.setHours(0,0,0,0);
				  FF = new Date();
				  FF.setHours(23,59,59,999);
				  //console.log("FI:",FI);
					//console.log("FF:",FF);
				  
			}	
			else if (op == 1) //Día
			{
					this.fechaInicial.setHours(0,0,0,0);
				  this.fechaFinal = new Date(this.fechaInicial.getTime());
				  this.fechaFinal.setHours(23,59,59,999);
				  FI = this.fechaInicial;
				  FF = this.fechaFinal;
				  
				  //console.log("FI:", FI);
					//console.log("FF:", FF);
					
			}	
			else if (op == 2) //Semana
			{					
					
					FI = new Date();
				  FI.setHours(0,0,0,0);
				  FF = new Date(FI.getTime());
				  FF.setHours(23,59,59,999);
					
					var semana = moment().isoWeek();
					var anio = FI.getFullYear();
					this.calcularSemana(semana, anio);
					//console.log("FI:", FI);
					//console.log("FF:", FF);
				
			}
			else if (op == 3) //Mes
			{
				
					FI = new Date();
					FI.setHours(0,0,0,0);
					var anio = FI.getFullYear();
					var mes = FI.getMonth();
					//console.log(mes);
					this.calcularMes(mes,anio);
					//console.log("FI:", FI);
					//console.log("FF:", FF);
				
			}
			else if (op == 4) //Siguiente Mes
			{
					FI = new Date();
					var anio = FI.getFullYear();
					var mes = FI.getMonth();
					if (mes == 11) 
					{
							mes = 0;
							anio = anio + 1; 
					}
					else
							mes = mes + 1;	
					
					this.calcularMes(mes,anio);
					//console.log("FI:", FI);
					//console.log("FF:", FF);
			}
			
			Meteor.call('getCobranza', FI, FF, op, Meteor.user().profile.sucursal_id, function(error, result) {
						//console.log(result);						
						if (result)
						{
								rc.cobranza = result;
								$scope.$apply();
						}
				
			});	
	}
	
  this.selCredito=function(objeto)
  {
	  	this.ban = !this.ban;
	  	
	  	//Información del Cliente
	  	rc.cliente = objeto.cliente;
	  	console.log(rc.cliente);
	  	var ec = EstadoCivil.findOne(rc.cliente.profile.estadoCivil_id);
	  	if (ec != undefined) rc.cliente.profile.estadoCivil = ec.nombre; 
	  	var nac = Nacionalidades.findOne(rc.cliente.profile.nacionalidad_id);
	  	if (nac != undefined) rc.cliente.profile.nacionalidad = nac.nombre;
	  	var ocu = Ocupaciones.findOne(rc.cliente.profile.ocupacion_id);
	  	if (ocu != undefined) rc.cliente.profile.ocupacion = ocu.nombre;
	  	
	  	var pais = Paises.findOne(rc.cliente.profile.pais_id);
	  	if (pais != undefined) rc.cliente.profile.pais = pais.nombre; 
	  	var edo = Estados.findOne(rc.cliente.profile.estado_id);
	  	if (edo != undefined) rc.cliente.profile.estado = edo.nombre;
	  	var mun = Municipios.findOne(rc.cliente.profile.municipio_id);
	  	if (mun != undefined) rc.cliente.profile.municipio = mun.nombre;
	  	var ciu = Ciudades.findOne(rc.cliente.profile.ciudad_id);
	  	if (ciu != undefined) rc.cliente.profile.ciudad = ciu.nombre;
	  	var col = Colonias.findOne(rc.cliente.profile.colonia_id);
	  	if (col != undefined) rc.cliente.profile.colonia = col.nombre;
	  	
	  	var emp = Empresas.findOne(rc.cliente.profile.empresa_id);
	  	if (emp != undefined) rc.cliente.profile.empresa = emp;
	  	
	  	pais = Paises.findOne(rc.cliente.profile.empresa.pais_id);
	  	if (pais != undefined) rc.cliente.profile.empresa.pais = pais.nombre; 
	  	edo = Estados.findOne(rc.cliente.profile.empresa.estado_id);
	  	if (edo != undefined) rc.cliente.profile.empresa.estado = edo.nombre;
	  	mun = Municipios.findOne(rc.cliente.profile.empresa.municipio_id);
	  	if (mun != undefined) rc.cliente.profile.empresa.municipio = mun.nombre;
	  	ciu = Ciudades.findOne(rc.cliente.profile.empresa.ciudad_id);
	  	if (ciu != undefined) rc.cliente.profile.empresa.ciudad = ciu.nombre;
	  	//-----------------------------------------------------------------------------
	  	
	  	
	  	//Información del Crédito
	  	rc.credito = objeto.credito;	  
	  	console.log(rc.credito);
	  	var tc = TiposCredito.findOne(rc.credito.tipoCredito_id);
	  	if (tc != undefined) rc.credito.tipoCredito = tc.nombre;
	  	
	  	rc.avales = [];
	  	_.each(rc.credito.avales_ids,function(aval_id){
						Meteor.call('getPersona', aval_id, function(error, result){						
									if (result)
									{
											rc.avales.push(result);
									}
						});	
	  	});
	  	//-----------------------------------------------------------------------------
	  	
	  	//Historial Crediticio
	  	
			
			
			//-----------------------------------------------------------------------------
	  	
      this.selected_credito=objeto.credito.folio;
  };
  
  this.isSelected=function(objeto){
      return this.selected_credito===objeto;

  };
  
  this.buscarNombre=function()
  {
      Meteor.call('getcobranzaNombre', rc.buscar.nombre, function(error, result) {
						if (result)
						{
								rc.cobranza = result;
								$scope.$apply();
						}
			});
  };	





	var fecha = moment();
	this.guardarNotaCobranza=function(nota){
			console.log(nota);
			
			nota.estatus = true;
			nota.fecha = new Date()
			nota.hora = moment(nota.fecha).format("hh:mm:ss a")
			rc.notaCobranza.usuario = rc.usuario.profile.nombreCompleto
			Notas.insert(nota);
			this.notaCobranza = {}
			$('#myModal').modal('hide');
			toastr.success('Guardado correctamente.');
	}
	this.mostrarNotaCobranza=function(objeto){
		console.log(objeto)
		rc.notaCobranza.cliente= objeto.cliente.profile.nombreCompleto 
		rc.notaCobranza.folioCredito = objeto.credito.folio 
		rc.notaCobranza.recibo= objeto.planPagos[0].numeroPago
		
		 rc.cobranza_id = objeto.credito._id
		 console.log("rc.cobranza_id",rc.cobranza_id)
		 $("#myModal").modal();


	}


};