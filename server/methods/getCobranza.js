Meteor.methods({
  getCobranza: function (fechaInicial, fechaFinal, op, sucursal_id) {
			
			var planPagos = {};
 
 			if (op == 0)
					var planPagos = PlanPagos.find({fechaLimite: {$lte: fechaFinal}, tipoCredito: "creditoP", importeRegular: {$gt:0}, estatus: { $in: [0,2] }}).fetch();
			else if (op == 1)
					var planPagos = PlanPagos.find({fechaLimite: {$gte: fechaInicial, $lte: fechaFinal}, tipoCredito: "creditoP", descripcion: "Recibo", estatus:{$in: [0,2]}}).fetch();
			else
					var planPagos = PlanPagos.find({fechaLimite: {$gte: fechaInicial, $lte: fechaFinal}, tipoCredito: "creditoP", estatus: { $in: [0,2] }}).fetch();
			
			
			//console.log(planPagos);
					
			var hoy = new Date();
			var fechaActual = moment();
			
			_.each(planPagos, function(planPago){
				var classPago = "";
					
					if (planPago.descripcion == "Cargo Moratorio")	
						 classPago = "text-danger";	
					
										
					if (planPago.importeRegular != 0 )
					{
				 			
							var u = Meteor.users.findOne({_id: planPago.cliente_id});
							var c = Creditos.findOne({_id: planPago.credito_id});

				 			//planPago.cliente = u.profile.nombreCompleto;
				 			planPago.cliente = Meteor.users.findOne({_id: planPago.cliente_id}, {fields: {"profile.documentos" : 0}});
 
				 			planPago.nombreCompleto = planPago.cliente != undefined ? planPago.cliente.profile.nombreCompleto : "";				 					
				 			
				 			planPago.credito = Creditos.findOne({_id: planPago.credito_id});
				 			
				 			planPago.imprimir = false;
				 			planPago.classPago = classPago;
				 			planPago.numeroPagos = c.numeroPagos;		

					}

			});
			
			//return _.toArray(arreglo);
			return planPagos;
	},
	getPersona: function (idPersona, idCliente) {
		
			var persona = Personas.findOne(idPersona);

			var p = {};

			if (persona != undefined && persona.relaciones !== undefined)
			{
					_.each(persona.relaciones, function(relacion){
							if (relacion.cliente_id == idCliente){
									
									p 								 	= relacion;
									p.nombre				 		= persona.nombre;
									p.apellidoPaterno		= persona.apellidoPaterno;
									p.apellidoMaterno		= persona.apellidoMaterno; 
									p.nombreCompleto 		= persona.nombreCompleto;
							}
					});	
					return p;
			}
			
	},
	getcobranzaNombre: function (nombre) {
			
			var arreglo = {};

			//Ir por los clientes
			let selector = {
	  	"profile.nombreCompleto": { '$regex' : '.*' + nombre || '' + '.*', '$options' : 'i' },
			  	roles : ["Cliente"]
			}
			var clientes = Meteor.users.find(selector).fetch();
			var clientes_ids = _.pluck(clientes,"_id");			


			//Ir por los creditos
			var creditos = Creditos.find({cliente_id :{ $in: clientes_ids }}).fetch(); //estatus 2 creditos autorizados
			var creditos_ids = _.pluck(creditos, '_id'); // [45, 3]

			
			//Ir por los pagos que ha hecho
			var planPagos = PlanPagos.find({credito_id: { $in: creditos_ids }, estatus: { $ne: 1 }}).fetch();
			
			var hoy = new Date();
			var fechaActual = moment();
			
			_.each(planPagos, function(planPago){
				var classPago = "";

					if (planPago.descripcion == "Cargo Moratorio")	
						 classPago = "text-danger";	
					
					if (planPago.importeRegular != 0 )
					{
				 			
							var u = Meteor.users.findOne({_id: planPago.cliente_id});
							var c = Creditos.findOne({_id: planPago.credito_id});

				 			//planPago.cliente = u.profile.nombreCompleto;
				 			planPago.cliente = Meteor.users.findOne({_id: planPago.cliente_id});
				 			planPago.credito = Creditos.findOne({_id: planPago.credito_id});
				 			
				 			planPago.imprimir = false;
				 			planPago.classPago = classPago;
				 			planPago.numeroPagos = c.numeroPagos;
				 						
					}
					
			});
			
			return planPagos;						
			
	},
	gethistorialPago: function (credito_id) {
			var arreglo = [];
			
			var saldoPago = 0;
			var saldoActual = 0; 
			var saldoMultas=0;
			
			//console.log(credito_id);			
			
			var credito = Creditos.findOne({_id: credito_id});
			var planPagos = PlanPagos.find({credito_id:credito_id},{sort:{numeroPago:1,descripcion:-1}}).fetch();
			
			//console.log(planPagos);
			
			var saldo =0;
			//try{ saldo = credito.numeroPago*pagos[0].cargo;} catch(ex){console.log("aqui",pagos)}
			//console.log("credito",credito);
			_.each(planPagos, function(planPago){
				if(planPago.descripcion=="Recibo")
					saldo+=planPago.cargo;
				if(planPago.descripcion=="Cargo Moratorio")
					saldoMultas+=planPago.importeRegular;
			});
			_.each(planPagos, function(planPago, index){

				
				if(planPago.descripcion=="Cargo Moratorio")
					saldo+=planPago.cargo
				
				fechaini= planPago.fechaPago? planPago.fechaPago:planPago.fechaLimite
				//console.log(fechaini,planPago.fechaPago,planPago.fechaLimite)
				arreglo.push({saldo:saldo,
					numeroPago : planPago.numeroPago,
					cantidad : credito.numeroPagos,
					fechaSolicito : credito.fechaSolicito,
					fecha : fechaini,
					pago : 0, 
					cargo : planPago.cargo,
					movimiento : planPago.movimiento,
					planPago_id : planPago._id,
					credito_id : planPago.credito_id,
					descripcion : planPago.descripcion,
					importe : planPago.importeRegular,
					pagos : planPago.pagos,
					iva : planPago.iva,
					interes : planPago.interes,
					abono : planPago.abono,
			  	});
					
				
				if(planPago.pagos.length>0)
					_.each(planPago.pagos,function (pago) {
						saldo-=pago.totalPago
						arreglo.push({saldo:saldo,
							numeroPago : planPago.numeroPago,
							cantidad : credito.numeroPagos,
							fechaSolicito : credito.fechaSolicito,
							fecha : pago.fechaPago,
							pago : pago.totalPago, 
							cargo : 0,
							movimiento : planPago.descripcion=="Cargo Moratorio"? "Abono de Multa":"Abono",
							planPago_id : planPago._id,
							credito_id : planPago.credito_id,
							descripcion : planPago.descripcion=="Cargo Moratorio"? "Abono de Multa":"Abono",
							importe : planPago.importeRegular,
							pagos : planPago.pagos,

					  	});
					})
				//console.log(rc.saldo)
			});

			
			return arreglo;
		
	},	
	getreportesPagos: function (credito_id) {
			var arreglo = [];
			
			var saldoPago = 0;
			var saldoActual = 0; 
			var saldoMultas=0;
			
			//console.log(credito_id);			
			
			var credito = Creditos.findOne({_id: credito_id});
			var planPagos = PlanPagos.find({credito_id:credito_id},{sort:{numeroPago:1,descripcion:-1}}).fetch();
			
			//console.log(planPagos);
			
			var saldo =0;
			//try{ saldo = credito.numeroPago*pagos[0].cargo;} catch(ex){console.log("aqui",pagos)}
			//console.log("credito",credito);
			_.each(planPagos, function(planPago){
				if(planPago.descripcion=="Recibo")
					saldo+=planPago.cargo;
				if(planPago.descripcion=="Cargo Moratorio")
					saldoMultas+=planPago.importeRegular;
			});
			_.each(planPagos, function(planPago, index){

				
				if(planPago.descripcion=="Cargo Moratorio")
					saldo+=planPago.cargo
				
				fechaini= planPago.fechaPago? planPago.fechaPago:planPago.fechaLimite
				//console.log(fechaini,planPago.fechaPago,planPago.fechaLimite)
				arreglo.push({saldo:saldo,
					numeroPago : planPago.numeroPago,
					cantidad : credito.numeroPagos,
					fechaSolicito : credito.fechaSolicito,
					fecha : fechaini,
					pago : 0, 
					cargo : planPago.cargo,
					movimiento : planPago.movimiento,
					planPago_id : planPago._id,
					credito_id : planPago.credito_id,
					descripcion : planPago.descripcion,
					importe : planPago.importeRegular,
					pagos : planPago.pagos,
					iva : planPago.iva,
					interes : planPago.interes,
					abono : planPago.abono,
			  	});

			
					

			});

			
			return arreglo;
		
	},
	getClienteInformacion: function (cliente) {
		
			 var persona = cliente
			 	
			 	if (persona.profile.estadoCivil_id != undefined)
 	 				persona.profile.estadoCivil = EstadoCivil.findOne(persona.profile.estadoCivil_id);
 	 			else
 	 				persona.profile.estadoCivil = "";
 	 				
 	 			if (persona.profile.nacionalidad_id != undefined)	
 	 				 persona.profile.nacionalidad = Nacionalidades.findOne(persona.profile.nacionalidad_id);
 	 			else
 	 				 persona.profile.nacionalidad = "";
 	 				 
 	 			if (persona.profile.colonia_id != undefined)	
 	 				 persona.profile.colonia = Colonias.findOne(persona.profile.colonia_id);
 	 			else
 	 				 persona.profile.colonia = "";
 	 			
 	 			if (persona.profile.estado_id != undefined)	
 	 				 persona.profile.estado = Estados.findOne(persona.profile.estado_id);
 	 			else
 	 				 persona.profile.estado = "";	 	
 	 			
 	 			if (persona.profile.municipio_id != undefined)	
 	 				 persona.profile.municipio = Municipios.findOne(persona.profile.municipio_id);
 	 			else
 	 				 persona.profile.municipio = "";
 	 				 
 	 			if (persona.profile.ocupacion_id != undefined)	
 	 				 persona.profile.ocupacion = Ocupaciones.findOne(persona.profile.ocupacion_id);
 	 			else
 	 				 persona.profile.ocupacion = "";	 	 	 
				
				if (persona.profile.estado_id != undefined)	
 	 				 persona.profile.estado = Estados.findOne(persona.profile.estado_id);
 	 			else
 	 				 persona.profile.estado = "";
				
				if (persona.profile.ciudad_id != undefined)	
 	 				 persona.profile.ciudad = Ciudades.findOne(persona.profile.ciudad_id);
 	 			else
 	 				 persona.profile.ciudad = "";
 	 				 
 	 			if (persona.profile.pais_id != undefined)	
 	 				 persona.profile.pais = Paises.findOne(persona.profile.pais_id);
 	 			else
 	 				 persona.profile.pais = "";	 
				
				if (persona.profile.empresa_id != undefined)	
 	 				 persona.profile.empresa = Empresas.findOne(persona.profile.empresa_id);
 	 			else
 	 				 persona.profile.empresa = "";	 
				
				if (persona.profile.empresa.colonia_id != undefined) 
						persona.profile.empresa.coloniaEmpresa = Colonias.findOne(persona.profile.empresa.colonia_id).nombre;
				else
						persona.profile.empresa.coloniaEmpresa = "";
							
				if (persona.profile.empresa.estado_id != undefined) 
						persona.profile.empresa.estadoEmpresa = Estados.findOne(persona.profile.empresa.estado_id).nombre;
				else
						persona.profile.empresa.estadoEmpresa = "";
						
				if (persona.profile.empresa.municipio_id != undefined) 
						persona.profile.empresa.municipioEmpresa = Municipios.findOne(persona.profile.empresa.municipio_id).nombre;
				else
						persona.profile.empresa.municipioEmpresa = "";
						
				if (persona.profile.empresa.ciudad_id != undefined) 
						persona.profile.empresa.ciudadEmpresa = Ciudades.findOne(persona.profile.empresa.ciudad_id).nombre;
				else
						persona.profile.empresa.ciudadEmpresa = "";
						
				if (persona.profile.empresa.pais_id != undefined) 
						persona.profile.empresa.paisEmpresa = Paises.findOne(persona.profile.empresa.pais_id).nombre;
				else
						persona.profile.empresa.paisEmpresa = "";	
				
			    
				//persona.profile.estadoCivil = EstadoCivil.findOne(persona.profile.estadoCivil_id);

			return persona;
			
	},	
	getEmpresaInfo: function (empresa) {
		
		 	var emp = Empresas.findOne(empresa);
 
 			if (emp != undefined)
			{ 
			
					if (emp.colonia_id != undefined) 
							emp.coloniaEmpresa = Colonias.findOne(emp.colonia_id).nombre;
					else
							emp.coloniaEmpresa = "";
							
					if (emp.estado_id != undefined) 
							emp.estadoEmpresa = Estados.findOne(emp.estado_id).nombre;
					else
							emp.estadoEmpresa = "";
							
					if (emp.municipio_id != undefined) 
							emp.municipioEmpresa = Municipios.findOne(emp.municipio_id).nombre;
					else
							emp.municipioEmpresa = "";
							
					if (emp.ciudad_id != undefined) 
							emp.ciudadEmpresa = Ciudades.findOne(emp.ciudad_id).nombre;
					else
							emp.ciudadEmpresa = "";
							
					if (emp.pais_id != undefined) 
							emp.paisEmpresa = Paises.findOne(emp.pais_id).nombre;
					else
							emp.paisEmpresa = "";						
					
							
			    return emp;
			}
			
			    
			return "";
	},
	
	/////////////////////////////////////////////////////////////////////////////////////////
	getNotificacionJudicial: function (objeto, cliente) {
		//console.log(objeto,"recordatori")
   // var produccion = "/home/cremio/archivos/";
		
		function formatDate(date) {
		  	  date = new Date(date);
				  var monthNames = [
				    "ENERO", "FEBRERO", "MARZO",
				    "ABRIL", "MAYO", "JUNIO", "JULIO",
				    "AGOSTO", "SEPTIEMBRE", "OCTUBRE",
				    "NOVIEMBRE", "DICIEMBRE"
				  ];
				  var day = date.getDate();
				  var monthIndex = date.getMonth();
				  var year = date.getFullYear();
			
				  return day + ' ' + 'DE ' + monthNames[monthIndex] + ' DE'  + ' ' + year;
			}
		
		
		var fs = require('fs') ;
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		const formatCurrency = require('format-currency');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		////var produccion = "/home/cremio/archivos/";
		//var produccion = "/home/cremio/archivos/";
		
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }
		
		var content = fs.readFileSync(produccion+"REQUERIMIENTO.docx", "binary");

	  
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip)
		
		var fecha = new Date();
		fecha = formatDate(fecha);
		
		
    
    var valores = (parseFloat(objeto.saldoActual).toFixed(2)).toString().split('.');
		var enteroActual = valores[0];
		var centavosActual = valores[1];
		
		//var enteroActual= formatCurrency(enteroActual);
		var saldoActual = formatCurrency(objeto.saldoActual);
		var intereses		= formatCurrency(objeto.saldoMultas);
		var suma			  = formatCurrency(Number( objeto.saldoActual + objeto.saldoMultas) ); 
    
		var colonia			= Colonias.findOne(cliente.colonia_id).nombre;
		
		doc.setData({	fecha						: fecha,
									nombreCompleto	: cliente.nombreCompleto,
									calle						: cliente.calle,
									numero					: cliente.numero,
									codigoPostal		: cliente.codigoPostal,
									colonia					: colonia,
									enteroActual		: enteroActual,
									centavosActual	: centavosActual,
									saldoActual			: saldoActual,
									intereses				: intereses,
									suma						: suma
								});
									
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 
		fs.writeFileSync(produccionSalida+"REQUERIMIENTOSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccionSalida+"REQUERIMIENTOSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
		
  },
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getcitatorio: function (objeto, cliente) {

		function formatDate(date) {
		  	  date = new Date(date);
				  var monthNames = [
				    "ENERO", "FEBRERO", "MARZO",
				    "ABRIL", "MAYO", "JUNIO", "JULIO",
				    "AGOSTO", "SEPTIEMBRE", "OCTUBRE",
				    "NOVIEMBRE", "DICIEMBRE"
				  ];
				  var day = date.getDate();
				  var monthIndex = date.getMonth();
				  var year = date.getFullYear();
			
				  return day + ' ' + 'DE ' + monthNames[monthIndex] + ' DE'  + ' ' + year;
			}
		
		
		var fs = require('fs');
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		const formatCurrency = require('format-currency');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		////var produccion = "/home/cremio/archivos/";
		//var produccion = "/home/cremio/archivos/";
		
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }
		
		var content = fs.readFileSync(produccion+"CITATORIOEXTRAJUDICIAL.docx", "binary");

	  
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip)
		
				
		var fecha = new Date();
		
		var siguiente = moment(fecha);
		var fechaSiguiente = formatDate(new Date(siguiente.add(1, 'days')));
		
		fecha = formatDate(fecha);
		
		
    
    var valores = (parseFloat(objeto.saldoActual).toFixed(2)).toString().split('.');
		var enteroActual = valores[0];
		var centavosActual = valores[1];
		
		//var enteroActual= formatCurrency(enteroActual);
		var saldoActual = formatCurrency(objeto.saldoActual);
		var intereses		= formatCurrency(objeto.saldoMultas);
		var suma			  = formatCurrency(Number( objeto.saldoActual + objeto.saldoMultas) ); 
    
		var colonia			= Colonias.findOne(cliente.colonia_id).nombre;
		
		doc.setData({	fecha						: fecha,
									fechaSiguiente	: fechaSiguiente,
									nombreCompleto	: cliente.nombreCompleto,
									calle						: cliente.calle,
									numero					: cliente.numero,
									codigoPostal		: cliente.codigoPostal,
									colonia					: colonia,
									enteroActual		: enteroActual,
									centavosActual	: centavosActual,
									saldoActual			: saldoActual,
									intereses				: intereses,
									suma						: suma
								});
									
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 
		fs.writeFileSync(produccionSalida+"CITATORIOEXTRAJUDICIALSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccionSalida+"CITATORIOEXTRAJUDICIALSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
		
  },
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////5
  getcartaCertificacionPatrimonial: function (objeto, cliente) {
	//console.log(objeto,"certificacionPatrimonial")
		
		function formatDate(date) {
		  	  date = new Date(date);
				  var monthNames = [
				    "ENERO", "FEBRERO", "MARZO",
				    "ABRIL", "MAYO", "JUNIO", "JULIO",
				    "AGOSTO", "SEPTIEMBRE", "OCTUBRE",
				    "NOVIEMBRE", "DICIEMBRE"
				  ];
				  var day = date.getDate();
				  var monthIndex = date.getMonth();
				  var year = date.getFullYear();
			
				  return day + ' ' + 'DE ' + monthNames[monthIndex] + ' DE'  + ' ' + year;
			}
		
		
		var fs = require('fs');
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		const formatCurrency = require('format-currency');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		if(Meteor.isDevelopment){
      var path = require('path');
      var publicPath = path.resolve('.').split('.meteor')[0];
      var produccion = publicPath + "public/plantillas/";
      var produccionSalida = publicPath + "public/generados/";
    }else{						 
      var publicPath = '/var/www/cremio/bundle/programs/web.browser/app/';
      var produccion = publicPath + "/plantillas/";
      var produccionSalida = "/home/cremio/archivos/";
    }
		
		
		var content = fs.readFileSync(produccion+"CERTIFICACIONPATRIMONIAL.docx", "binary");

	  
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip)
		
	
		
		var fecha = new Date();
		
		var siguiente = moment(fecha);
		var fechaSiguiente = formatDate(new Date(siguiente.add(1, 'days')));
		
		fecha = formatDate(fecha);
		
		
    
    var valores = (parseFloat(objeto.saldoActual).toFixed(2)).toString().split('.');
		var enteroActual = valores[0];
		var centavosActual = valores[1];
		
		var saldoActual = formatCurrency(objeto.saldoActual);
		var intereses		= formatCurrency(objeto.saldoMultas);
		var suma			  = formatCurrency(Number( objeto.saldoActual + objeto.saldoMultas) ); 
    
		var colonia			= Colonias.findOne(cliente.colonia_id).nombre;						
		
		var respaldos	= [];
		
		_.each(objeto.garantias, function(garantia) {
				respaldos.push({nombre: garantia.descripcion, caracteristicas: garantia.caracteristicas});
		});

		
		doc.setData({	fecha						: fecha,
									fechaSiguiente	: fechaSiguiente,
									nombreCompleto	: cliente.nombreCompleto,
									calle						: cliente.calle,
									numero					: cliente.numero,
									codigoPostal		: cliente.codigoPostal,
									colonia					: colonia,
									enteroActual		: enteroActual,
									centavosActual	: centavosActual,
									saldoActual			: saldoActual,
									intereses				: intereses,
									suma						: suma,
									respaldos				:	respaldos});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 
		fs.writeFileSync(produccionSalida+"CERTIFICACIONPATRIMONIALSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccionSalida+"CERTIFICACIONPATRIMONIALSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	
	
});	