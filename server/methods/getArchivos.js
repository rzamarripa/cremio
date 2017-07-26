Meteor.methods({
		getcartaRecordatorio: function (objeto) {
	console.log(objeto,"recordatori")
   // var produccion = "/home/cremio/archivos/";

		
		
		var fs = require('fs') ;
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		////var produccion = "/home/cremio/archivos/";
		var produccion = "/home/cremio/archivos/";
				 
		
		
		var content = fs
    							.readFileSync(produccion+"RECORDATORIOS.docx", "binary");

	  
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip)
		
		var fecha = new Date();
		var f = fecha;
    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
    var cliente =objeto.cliente.profile.nombreCompleto
    var nombreCliente  = cliente.toUpperCase();
    var calle = objeto.cliente.profile.calle
    var calleCLiente = calle.toUpperCase();
    var colonia = objeto.cliente.profile.colonia
    var coloniaCliente = colonia.toUpperCase();
    var ciudad = objeto.cliente.profile.ciudad
    var ciudadCliente = ciudad.toUpperCase();
    var estado = objeto.cliente.profile.estado
    var estadoCliente = estado.toUpperCase();
    var pais = objeto.cliente.profile.pais
    var paisCliente = pais.toUpperCase();

		doc.setData({		        nombreCompleto: 		nombreCliente, 
									calle: 					calleCLiente,
									numero: 				objeto.cliente.profile.numero,
									colonia: 				coloniaCliente,
									codigoPostal: 	        objeto.cliente.profile.codigoPostal,
									ciudad: 				ciudadCliente,
									estado: 				estadoCliente,
									pais: 					paisCliente,
									folio: 					objeto.credito.folio,
									saldoTotal: 		    objeto.credito.saldoTotal,
									pagosVencidos: 	        objeto.credito.pagosVencidos,
									letra: 					objeto.credito.letra,
									saldoActualizado:       objeto.credito.saldoActualizado,
									pagosVencidos:          objeto.credito.pagosVencidos,
									fechaEmision: 	        fecha});
									
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 
		fs.writeFileSync(produccion+"RECORDATORIOSSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"RECORDATORIOSSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
		
  },
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getcartaUrgente: function (objeto) {
	console.log(objeto,"URGENTE")
		
		
		var fs = require('fs');
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var produccion = "/home/cremio/archivos/";
		//var produccion = "/home/cremio/archivos/";
				 
		
		
		var content = fs
    							.readFileSync(produccion+"URGENTE.docx", "binary");

	  
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip)
		
		var fecha = new Date();
		var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    var cliente =objeto.cliente.profile.nombreCompleto
	    var nombreCliente  = cliente.toUpperCase();
	    var calle = objeto.cliente.profile.calle
	    var calleCLiente = calle.toUpperCase();
	    var colonia = objeto.cliente.profile.colonia
	    var coloniaCliente = colonia.toUpperCase();
	    var ciudad = objeto.cliente.profile.ciudad
	    var ciudadCliente = ciudad.toUpperCase();
	    var estado = objeto.cliente.profile.estado
	    var estadoCliente = estado.toUpperCase();
	    var pais = objeto.cliente.profile.pais
	    var paisCliente = pais.toUpperCase();
		
		doc.setData({				nombreCompleto: 		nombreCliente, 
									calle: 					calleCLiente,
									numero: 				objeto.cliente.profile.numero,
									colonia: 				coloniaCliente,
									codigoPostal: 	        objeto.cliente.profile.codigoPostal,
									ciudad: 				ciudadCliente,
									estado: 				estadoCliente,
									pais: 					paisCliente,
									folio: 					objeto.credito.folio,
									saldoTotal: 		    objeto.credito.saldoTotal,
									pagosVencidos: 	        objeto.credito.pagosVencidos,
									letra: 					objeto.credito.letra,
									saldoActualizado:       objeto.credito.saldoActualizado,
									avales:		   			objeto.credito.avales,
									pagosVencidos:          objeto.credito.pagosVencidos,
									fechaEmision: 	        fecha});
									
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 
		fs.writeFileSync(produccion+"URGENTESSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"URGENTESSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
		
  },


 ////////////////////////////////////////////////////////////////////////////////////////////////////////////


  getcartaCertificado: function (objeto,objeto_id) {
	console.log(objeto,"certificacionPatrimonial")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var produccion = "/home/cremio/archivos/";
		//var produccion = "/home/cremio/archivos/";
				 
		
		
		var content = fs
    	   .readFileSync(produccion+"certificacionPatrimonial.docx", "binary");

	  
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip)
		
		var fecha = new Date();
		var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    var cliente =objeto.cliente.profile.nombreCompleto
	    var nombreCliente  = cliente.toUpperCase();
	    var calle = objeto.cliente.profile.calle
	    var calleCLiente = calle.toUpperCase();
	    var colonia = objeto.cliente.profile.colonia
	    var coloniaCliente = colonia.toUpperCase();
	    var ciudad = objeto.cliente.profile.ciudad
	    var ciudadCliente = ciudad.toUpperCase();
	    var estado = objeto.cliente.profile.estado
	    var estadoCliente = estado.toUpperCase();
	    var pais = objeto.cliente.profile.pais
	    var paisCliente = pais.toUpperCase();


		
		doc.setData({				nombreCompleto: 		nombreCliente, 
									calle: 					calleCLiente,
									numero: 				objeto.cliente.profile.numero,
									colonia: 				coloniaCliente,
									codigoPostal: 	        objeto.cliente.profile.codigoPostal,
									ciudad: 				ciudadCliente,
									estado: 				estadoCliente,
									pais: 					paisCliente,
									folio: 					objeto.credito.folio,
									saldoTotal: 		    objeto.credito.saldoTotal,
									pagosVencidos: 	        objeto.credito.pagosVencidos,
									letra: 					objeto.credito.letra,
									saldoActualizado:       objeto.credito.saldoActualizado,
									fechaEmision: 	        fecha,
									avales:		   			objeto.credito.avales});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 
		fs.writeFileSync(produccion+"certificacionPatrimonialSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"certificacionPatrimonialSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getReferencias: function (idReferencia) {
			var referencia = Personas.findOne(idReferencia);
			//console.log("esta es la referencia",referencia)
			return referencia;
	},
	 getDocs: function (idReferencia) {
			var referencia = Documentos.findOne(idReferencia);
			//console.log("esta es la referencia",referencia)
			return referencia;
	},
	getPeople: function (idReferencia) {
			var persona = Meteor.users.findOne(idReferencia);
				_.each(persona, function(objeto){
					objeto.nacionalidadCliente = Nacionalidades.findOne(objeto.nacionalidad_id);


				});
			//console.log("esta es la referencia",referencia)
			return persona;
	},
	// getEmpresas: function (idEmpresa) {
	// 		//console.log('hi');
	// 		Meteor.apply('findSomeShit',['Empresas', {_id: idEmpresa}, true], function(err, empresa){
	// 			Meteor.call('findSomeShit',['Ciudades', {_id: empresa.empresa_id}, true], function(err, ciudad){
	// 				Meteor.call('findSomeShit',['Municipios', {_id: empresa.municipio_id}, true], function(err, municipio){
	// 					Meteor.call('findSomeShit',['Estados', {_id: empresa.estado_id}, true], function(err, estado){
	// 						Meteor.call('findSomeShit',['Paises', {_id: empresa.pais_id}, true], function(err, pais){
	// 							Meteor.call('findSomeShit',['Colonias', {_id: empresa.colonia_id}, true], function(err, colonia){
	// 								empresa.ciudad = ciudad;
	// 								empresa.municipio = municipio;
	// 								empresa.estado = estado;
	// 								empresa.pais = pais;
	// 								empresa.colonia = colonia;
	// 								res['return'] = empresa;
	// 							});
	// 						});
	// 					});
	// 				});
	// 			});
	// 		});
	// 		// empresa.municipio = Municipios.findOne(empresa.municipio_id);
	// 		// empresa.estado = Estados.findOne(empresa.estado_id);
	// 		// empresa.colonia = Colonias.findOne(empresa.colonia_id);
	// 		// empresa.pais = Paises.findOne(empresa.pais_id);
	// 		// console.log("esta es la empresa",empresa)
	// 		return res.wait();
	// },

	findSomeShit: function (collection, find, findOne){
		return findOne ? eval(collection).findOne(find) : eval(collection).find(find);
	},
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getFicha: function (objeto,referencia) {
	console.log(referencia,"ficha")
		
		var fs = require('fs');
    var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		////var produccion = "/home/cremio/archivos/";
		var cmd = require('node-cmd');
		var ImageModule = require('docxtemplater-image-module');
	
		var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";


		var opts = {}
			opts.centered = false;
			opts.getImage=function(tagValue, tagName) {
					var binaryData =  fs.readFileSync(tagValue,'binary');
					return binaryData;
		}
		
		opts.getSize=function(img,tagValue, tagName) {
		    return [180,160];
		}
		
		var imageModule=new ImageModule(opts);

		var content = fs
    							.readFileSync(produccion+"FICHASOCIO.docx", "binary");

		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.attachModule(imageModule)
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});


		
		var fecha = new Date();
			    hora = fecha.getHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();

		fecha.setHours(0,0,0,0);
		var fechaNaci = objeto.profile.fechaNacimiento;
		
    	//var f = fecha;
    	
    	fechaAltaCliente = new Date(objeto.profile.fechaCreacion)
    	fechaAltaCliente.setHours(0,0,0,0)
    	fechaAlta = fechaAltaCliente.getUTCDate()+'-'+(fechaAltaCliente.getUTCMonth()+1)+'-'+fechaAltaCliente.getUTCFullYear();
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    fechaNacimiento = fechaNaci.getUTCDate()+'-'+(fechaNaci.getUTCMonth()+1)+'-'+fechaNaci.getUTCFullYear();
	    var cliente =objeto.nombreCompleto
	    var nombreCliente  = cliente.toUpperCase();
	    var calle = objeto.profile.calle
	    var calleCLiente = calle.toUpperCase();
	    var colonia = objeto.colonia.nombre
	    var coloniaCliente = colonia.toUpperCase();
	    var ciudad = objeto.ciudad.nombre
	    var ciudadCliente = ciudad.toUpperCase();
	    var estado = objeto.estado.nombre
	    var estadoCliente = estado.toUpperCase();
	    var pais = objeto.pais.nombre
	    var paisCliente = pais.toUpperCase();
		var sexoCliente = objeto.profile.sexo
	    var sexo  = sexoCliente.toUpperCase();
	    var nacionalidadCliente = objeto.nacionalidad.nombre
	    var nacionalidad  = nacionalidadCliente.toUpperCase();
	    var lugar = objeto.lugarNacimiento
	    var lugarNacimiento  = lugar.toUpperCase();
	    var ocupa = objeto.ocupacion.nombre
	    var ocupacion  = ocupa.toUpperCase();
	    var est = objeto.estadoCivil.nombre
	    var estadoCivil  = est.toUpperCase();
	    var anti = objeto.profile.tiempoResdencia
	    var antiguedad  = anti.toUpperCase(); 
	    var anti = objeto.profile.tiempoResdencia
	    var antiguedad  = anti.toUpperCase();
	    var sucu = objeto.sucursal.nombre;
	    var sucursal = sucu.toUpperCase();
	    var muni = objeto.municipio;
	    var municipio = muni.toUpperCase();
	    var empre = objeto.empresa.nombre;
	    var empresa = empre.toUpperCase();
	    var call = objeto.empresa.calle;
	    var calleEmpresa = call.toUpperCase();
	    var col = objeto.coloniaEmpresa;
	    var coloniaEmpresa = col.toUpperCase();
	    


diato;
		 // var jefe = jef.toUpperCase();
		 var cas = objeto.profile.casa;
		 var casa = cas.toUpperCase();


	    var f = String(objeto.profile.foto);
					objeto.profile.foto = f.replace('data:image/jpeg;base64,', '');

					var bitmap = new Buffer(objeto.profile.foto, 'base64');

					fs.writeFileSync(produccion+".jpeg", bitmap);
					objeto.profile.foto = produccion+".jpeg";
						_.each(referencia,function(relacion){
						 	if (relacion.apellidoMaterno == undefined) {
						 		relacion.apellidoMaterno = "";
						 	}
						 	relacion.nombreCompleto = relacion.nombre+' '+relacion.apellidoPaterno+' '+relacion.apellidoMaterno

						 });


		doc.setData({				nombreCompleto: 		nombreCliente,//bien
									sexo:                   sexo,//bien
									fechaEmision:           fecha,//bien
									nacionalidad:           nacionalidad,
									fechaNacimiento:        fechaNacimiento,
									lugarNacimiento:        lugarNacimiento,
									ocupacion:              ocupacion,
									estadoCivil:            estadoCivil,
									 calle: 			    calleCLiente,
									 no: 				    objeto.profile.numero,
									 antiguedad:            antiguedad,
									 colonia: 				coloniaCliente,
									 cp: 	        		objeto.profile.codigoPostal,
									 ciudad: 				ciudadCliente,
									 estado: 				estadoCliente,
									 pais: 					paisCliente,
									 fechaCreacion:         fechaAlta,
									 hora:                  hora,
									 foto:                  objeto.profile.foto,
									 sucursal:              sucursal,
									 municipio:             municipio,
									 telefonoContacto:      objeto.profile.telefono,
									 telefonoAlternativo:   objeto.profile.otroTelefono,
									 telefonoMovilContacto: objeto.profile.celular,
									 correo:                objeto.profile.correo,
									 casa:                  casa,
									 renta:                 objeto.profile.rentaMes,


									 //////////////////// REFERENCIAS PERSONALES //////////////////////
									 ingresosPersonales:    objeto.profile.ingresosPersonales,
									 ingresosConyuge:       objeto.profile.ingresosConyuge,
									 gastosFijos:           objeto.profile.gastosFijos,
									 gastoEventuales:       objeto.profile.gastosEventuales,
									 otrosIngresos:         objeto.otrosIngresos,
									 referencias: 			    referencia,


									 /////////////////// CONTACTO //////////////////////
									 
									 telefonoOficina:      objeto.profile.telefonoOficina,


									//////////////////// EMPRESA //////////////////////
									empresa:               empresa, 
									calleEmpresa:          calleEmpresa,
									coloniaEmpresa:        coloniaEmpresa,
									telefonoEmpresa:       objeto.empresa.telefono,
									//departamento:          departamento,
									//puesto:                puesto,
									//antiguedad:            antiguedad,
									numeroEmpresa:         objeto.empresa.numero,
									cpEmpresa:             objeto.empresa.codigoPostal,
									paisEmpresa:           objeto.paisEmpresa,
									municipioEmpresa:      objeto.municipioEmpresa,
									estadoEmpresa:         objeto.estadoEmpresa,
									//jefe:                  jefeEmpresa,
									//antiguedadEmpresa:      antiguedadEmpresa,      

								

									//////////////////// CONYUGE //////////////////////
									telefonoConyuge:       objeto.profile.telefonoConyuge,//bien
									ocupacionConyuge:      objeto.profile.ocupacionConyuge,
									nombreConyu:           objeto.profile.nombreConyuge,
									telefonoConyugeTrabajo: objeto.profile.telefonoConyugeTrabajo,
									direccionConyugeTrabajo: objeto.profile.direccionConyugeTrabajo,

								}) 
									
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
 
		fs.writeFileSync(produccion+"FICHASOCIOSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"FICHASOCIOSalida.docx");

   // cmd.run('unoconv -f pdf '+ produccion+'cedulaSalida.docx');
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
		
  },

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getRecibos: function (objeto) {
	
		console.log(objeto,"planPagos")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		////var produccion = "/home/cremio/archivos/";
		var produccion = "/home/cremio/archivos/";
				 
				var content = fs
    	   .readFileSync(produccion+"RECIBOS.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		
		var fecha = new Date();
		var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    
	 _.each(objeto,function(item){
      item.fechaLimite =moment(item.fechaLimite).format("DD-MM-YYYY")
      
      if (item.proximoPago== "No hay proximo pago") {
      	item.proximoPago = "No hay próximo pago" 
      }else{
      	item.proximoPago =moment(item.proximoPago).format("DD-MM-YYYY")
      }
      

	 });

	  //console.log(objeto.planPagos);
		
		doc.setData({				items: 		objeto,
									fecha:     fecha,
									

				  });
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"RECIBOSSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"RECIBOSSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },

    getCreditoReporte: function (objeto,credito,avales,total) {
    	console.log(total,"total")
	
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		//var produccion = "/home/cremio/archivos/";
		var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
				 
				var content = fs
    	   .readFileSync(produccion+"ReporteCredito.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		
		var fecha = new Date();
		var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	 	 	_.each(objeto,function(item){
	 	 		//console.log(item,"Credito")
	 	 		item.fechaLimite = item.fechaLimite.getUTCDate()+'-'+(item.fechaLimite.getUTCMonth()+1)+'-'+item.fechaLimite.getUTCFullYear();
	 	 		 if (item.fechaLimite.length < 2) item.fechaLimite = '0' + item.fechaLimite;
	 	 		   item.cargo = parseFloat(item.cargo.toFixed(2))
	 	 		   item.liquidar = parseFloat(item.liquidar.toFixed(2))
	 	 		    item.capital = parseFloat(item.capital.toFixed(2))
	 	 		// item.liquidar =              
	 	 		if (item.estatus = 5) {
	 	 			item.formaPago = item.tipoIngreso.nombre

	 	 		}
	 	 	});

		
		doc.setData({				planPagos: 	  objeto,
									length:       objeto.length,
									fecha:        fecha,
									cliente:      credito.nombre,
									periodo:      credito.periodoPago,
									duracion:     credito.duracionMeses,
									capital:      credito.capitalSolicitado,
									total:        total.sumatoria,
									//tipoCredito:

				  });
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"ReporteCreditoSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"ReporteCreditoSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },
   ReporteCobranza: function (objeto,inicial,final) {
	
		console.log(objeto,"creditos ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		//var produccion = "/home/cremio/archivos/";
		var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
				 
				var content = fs
    	   .readFileSync(produccion+"reporteDiarioCobranza.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		
			var fecha = new Date();
			var f = fecha;
			var fechaInicial = inicial
			var fechaFinal = final
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    fInicial = fechaInicial.getUTCDate()+'-'+(fechaInicial.getUTCMonth()+1)+'-'+fechaInicial.getUTCFullYear(); 
	    fFinal = fechaFinal.getUTCDate()+'-'+(fechaFinal.getUTCMonth()+1)+'-'+fechaFinal.getUTCFullYear(); 
	    var suma = 0
		var sumaInter = 0
		var sumaIva = 0
		totalcobranza = 0
	    _.each(objeto,function(item){
	    	item.fechaPago = moment(item.fechaPago).format("DD-MM-YYYY")
	    	moment(item.fechaInicial).format("DD-MM-YYYY")
	      moment(item.fechaFinal).format("DD-MM-YYYY")
	      item.folio = item.credito.folio
	      if (item.movimiento == "Recibo") {
	      	item.movimiento = "R"
	      }else{
	      	item.movimiento = "C"
	      }
	    
	  
	       suma = item.sumaCapital
	       sumaInter = item.sumaInteres
	       sumaIva = item.sumaIva

	       totalcobranza = suma + sumaIva + sumaInter

	        item.cargo = parseFloat(item.cargo.toFixed(2))
	        item.interes = parseFloat(item.interes.toFixed(2))
	        item.iva = parseFloat(item.iva.toFixed(2))
	        item

	    });
	    
	
	    console.log(objeto.planPagos);
		
		      doc.setData({				
      	            items: 		      objeto,
										fecha:          fecha,
										inicial:        fInicial,
										final:          fFinal,
										sumaCapital:    parseFloat(suma.toFixed(2)),
										sumaIntereses:  parseFloat(sumaInter.toFixed(2)),
										sumaIva:        parseFloat(sumaIva.toFixed(2)),
										totalCobranza:  parseFloat(totalcobranza.toFixed(2)),
		
				  });
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"reporteDiarioCobranzaSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"reporteDiarioCobranzaSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },

     ReporteCreditos: function (objeto,inicial,final) {
	
		console.log(objeto,"fwfe ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		
		var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
				 
				var content = fs
    	   .readFileSync(produccion+"ReporteDiarioCreditos.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		
			var fecha = new Date();
			var f = fecha;
			var fechaInicial = inicial
			var fechaFinal = final
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    fInicial = fechaInicial.getUTCDate()+'-'+(fechaInicial.getUTCMonth()+1)+'-'+fechaInicial.getUTCFullYear(); 
	    fFinal = fechaFinal.getUTCDate()+'-'+(fechaFinal.getUTCMonth()+1)+'-'+fechaFinal.getUTCFullYear(); 
	   
          var suma = 0
          var sumaSol = 0
	    _.each(objeto,function(item){
	    	item.fechaEntrega = moment(item.fechaEntrega).format("DD-MM-YYYY")
	    	suma = item.sumaCapital
	    	sumaSol = item.sumaAPagar
	    	item.numeroCliente = item.numeroCliente + "";
	    	item.adeudoInicial = parseFloat(item.adeudoInicial.toFixed(2))
	    	item.saldoActual = parseFloat(item.saldoActual.toFixed(2))

	    });

	    // console.log(objeto.planPagos);
		
		doc.setData({				
						items: 		 objeto,
						fecha:     fecha,
						inicial:    fInicial,
						final:      fFinal,
						sumaCapital : suma,
						sumaAPagar: sumaSol,
													
				
				  });
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"ReporteDiarioCreditosSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"ReporteDiarioCreditosSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },



  ReporteMovimientoCuenta: function (objeto,inicial,final) {
	
		console.log(objeto,"creditos ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
				 
				var content = fs
    	   .readFileSync(produccion+"ReporteMovimientoCuentas.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		
			var fecha = new Date();
			var f = fecha;
			var fechaInicial = inicial
			var fechaFinal = final
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    fInicial = fechaInicial.getUTCDate()+'-'+(fechaInicial.getUTCMonth()+1)+'-'+fechaInicial.getUTCFullYear(); 
	    fFinal = fechaFinal.getUTCDate()+'-'+(fechaFinal.getUTCMonth()+1)+'-'+fechaFinal.getUTCFullYear(); 
	    _.each(objeto,function(item){
	    	moment(item.fechaPago).format("DD-MM-YYYY")
	    	
	    });
	    
	    console.log(objeto.planPagos);
		
		doc.setData({				items: 		 objeto,
												fecha:     fecha,
												inicial:    fInicial,
												final:      fFinal,
													
				});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"ReporteMovimientoCuentasSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"ReporteMovimientoCuentasSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },
   ReportesBanco: function (objeto,inicial,final) {
	
		console.log(objeto,"creditos ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
				 
		var content = fs
    	   .readFileSync(produccion+"ReporteBancos.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		
			var fecha = new Date();
			var f = fecha;
			var fechaInicial = inicial
			var fechaFinal = final
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    fInicial = fechaInicial.getUTCDate()+'-'+(fechaInicial.getUTCMonth()+1)+'-'+fechaInicial.getUTCFullYear(); 
	    fFinal = fechaFinal.getUTCDate()+'-'+(fechaFinal.getUTCMonth()+1)+'-'+fechaFinal.getUTCFullYear(); 
	    _.each(objeto,function(item){
	    	moment(item.fechaPago).format("DD-MM-YYYY")
	    	
	    });
	    
	    console.log(objeto.planPagos);
		
		doc.setData({				
			            item: 		 objeto,
						fecha:       fecha,
						inicial:     fInicial,
						final:       fFinal,
													
				});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"ReporteBancosSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"ReporteBancosSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  },
  contratos: function (contrato,credito,cliente) {
  
  	_.each(cliente,function(c)
    	{
    		if (cliente.nacionalidadCliente) {
    			c.nacionalidad = c.nacionalidadCliente.nombre
    		}
    		
    	});
  		console.log(cliente,"cliente")
  	if (_.isEmpty(contrato.garantias) && _.isEmpty(contrato.avales_ids)) {
	
		//
		//console.log(contrato,"contratos ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		//var produccion = "/home/cremio/archivos/";
		var produccion = meteor_root+"/web.browser/app/plantillas/";
				var content = fs
					.readFileSync(produccion+"CONTRATOINTERES.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		
			var fecha = new Date();
			var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	 
	    
	  		doc.setData({			items: 	   contrato,
	  								cliente:  cliente,
									fecha:     fecha,
											
													
				});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"CONTRATOINTERESSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"CONTRATOINTERESSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
   }
   	if (contrato.avales_ids && _.isEmpty(contrato.garantias)) {
   	console.log(contrato,"contratos ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		//var produccion = "/home/cremio/archivos/";
		var produccion = meteor_root+"/web.browser/app/plantillas/";
				var content = fs
					.readFileSync(produccion+"CONTRATOOBLIGADOSOLIDARIO.docx", "binary");
    	   
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
			var fecha = new Date();
			var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	  
	    
	  		doc.setData({				items: 		 contrato,
									    fecha:     fecha,
											
													
				});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"CONTRATOOBLIGADOSOLIDARIOSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"CONTRATOOBLIGADOSOLIDARIOSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
   }
  if (contrato.garantias && contrato.tipoGarantia == "general") {
   	console.log(contrato,"contratos ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		//var produccion = "/home/cremio/archivos/";
		var produccion = meteor_root+"/web.browser/app/plantillas/";
				var content = fs
					.readFileSync(produccion+"CONTRATOHIPOTECARIO.docx", "binary");
    	   
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		
			var fecha = new Date();
			var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	
	    
	  		doc.setData({		    items: 	   contrato,
									fecha:     fecha,
													
				});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"CONTRATOHIPOTECARIOSalida.docx",buf);		
				
		//Pasar a base64
		// read binary data
    var bitmap = fs.readFileSync(produccion+"CONTRATOHIPOTECARIOSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');

   }
   if (contrato.garantias && contrato.tipoGarantia == "mobiliaria") {
   		console.log(contrato,"contratos ")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		//var produccion = "/home/cremio/archivos/";
		//var produccion = "/home/cremio/archivos/";
		var produccion = meteor_root+"/web.browser/app/plantillas/";
				var content = fs				
					.readFileSync(produccion+"CONTRATOGARANTIAPRENDARIA.docx", "binary");
    	   
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		
			var fecha = new Date();
			var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    
	  		doc.setData({				items: 	   contrato,
									    fecha:     fecha,
				});
								
		doc.render();
 
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"CONTRATOGARANTIAPRENDARIASalida.docx",buf);		

    var bitmap = fs.readFileSync(produccion+"CONTRATOGARANTIAPRENDARIASalida.docx");
    
    return new Buffer(bitmap).toString('base64');

   }
},
getListaCobranza: function (objeto) {
	
		console.log(objeto,"planPagos")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		////var produccion = "/home/cremio/archivos/";
		var produccion = "/home/cremio/archivos/";
				 
				var content = fs
    	   .readFileSync(produccion+"LISTACOBRANZA.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		

		var fecha = new Date();
		var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    
	 _.each(objeto,function(item){
      item.fechaLimite =moment(item.fechaLimite).format("DD-MM-YYYY")
     
	 });
		
			doc.setData({				items: 		objeto,
										fecha:     fecha,
									

				  });
								
		doc.render();
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"LISTACOBRANZASalida.docx",buf);		
		// read binary data
    var bitmap = fs.readFileSync(produccion+"LISTACOBRANZASalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  }, 

  imprimirHistorial: function (objeto,cliente,credito) {
	
		console.log(credito,"cre")
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var ImageModule = require('docxtemplater-image-module');
		////var produccion = "/home/cremio/archivos/";
		var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
		var opts = {}
			opts.centered = false;
			opts.getImage=function(tagValue, tagName) {
					var binaryData =  fs.readFileSync(tagValue,'binary');
					return binaryData;
		}
		
		opts.getSize=function(img,tagValue, tagName) {
		    return [180,160];
		}

		var imageModule=new ImageModule(opts);
				 
		var content = fs
    	   .readFileSync(produccion+"HISTORIALCREDITICIO.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
						.attachModule(imageModule)
						.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});

		var pic = String(cliente.foto);
		cliente.foto = pic.replace('data:image/jpeg;base64,', '');
		var bitmap = new Buffer(cliente.foto, 'base64');
		fs.writeFileSync(produccion+".jpeg", bitmap);
		cliente.foto = produccion+".jpeg";
		
		var fecha = new Date();
		var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	    
      objeto.fechaLimite =moment(objeto.fechaLimite).format("DD-MM-YYYY")
      cliente.fechaCreacion =moment(cliente.fechaCreacion).format("DD-MM-YYYY")
      cliente.fechaNa =moment(cliente.fechaNa).format("DD-MM-YYYY")
      credito.fechaEntrega =moment(credito.fechaEntrega).format("DD-MM-YYYY")
      credito.adeudoInicial = parseFloat(credito.adeudoInicial.toFixed(2))
      credito.saldoActual = parseFloat(credito.saldoActual.toFixed(2))
      credito.saldoMultas = parseFloat(credito.saldoMultas.toFixed(2))

      var totalCargos = 0
      var totalAbonos = 0 
      _.each(objeto,function(item){
      item.fechaSolicito =moment(item.fechaSolicito).format("DD-MM-YYYY")
      item.saldo = parseFloat(item.saldo.toFixed(2))
      item.cargo = parseFloat(item.cargo.toFixed(2))
      totalAbonos = parseFloat(item.sumaAbonos.toFixed(2))
      totalCargos = parseFloat(item.sumaCargos.toFixed(2))
      totalSaldo =  parseFloat(item.ultimoSaldo.toFixed(2))
	 });
		
		doc.setData({				
						items:   objeto,
						fecha:   fecha,
						cliente: cliente,
						foto:    cliente.foto,
						sucursal: cliente.sucursal,
						fechaCreacion : cliente.fechaCreacion,
						nombreCompleto :  cliente.profile.nombreCompleto,
						sexo : cliente.profile.sexo,
						nacionalidad : cliente.clienteNacionalidad.nombre,
						ocupacion : cliente.ocupacion,
						fechaNacimiento : cliente.fechaNa,
						lugarNacimiento : cliente.lugarNacimiento,
						capitalSolicitado : credito.capitalSolicitado,
						numeroPagos : credito.numeroPagos,
						adeudoInicial : credito.adeudoInicial,
						saldoActual : credito.saldoActual,
						fechaEntrega : credito.fechaEntrega,
						saldoMultas : credito.saldoMultas,
						totalCargos : totalCargos,
						totalAbonos : totalAbonos,
						totalSaldo : totalSaldo,
				  });
								
		doc.render();
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"HISTORIALCREDITICIOSalida.docx",buf);		
		// read binary data
    var bitmap = fs.readFileSync(produccion+"HISTORIALCREDITICIOSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  }, 

  formaSolicitud: function () {
		var fs = require('fs');
    	var Docxtemplater = require('docxtemplater');
		var JSZip = require('jszip');
		var meteor_root = require('fs').realpathSync( process.cwd() + '/../' );
		var produccion = "/home/cremio/archivos/";
		//var produccion = meteor_root+"/web.browser/app/plantillas/";
				 
				var content = fs
    	   .readFileSync(produccion+"FormatoSol.docx", "binary");
		var zip = new JSZip(content);
		var doc=new Docxtemplater()
								.loadZip(zip).setOptions({nullGetter: function(part) {
			if (!part.module) {
			return "";
			}
			if (part.module === "rawxml") {
			return "";
			}
			return "";
		}});
		
		var fecha = new Date();
		var f = fecha;
	    fecha = fecha.getUTCDate()+'-'+(fecha.getUTCMonth()+1)+'-'+fecha.getUTCFullYear();//+', Hora:'+fecha.getUTCHours()+':'+fecha.getMinutes()+':'+fecha.getSeconds();
	   
			doc.setData({				

				  });
								
		doc.render();
		var buf = doc.getZip()
             		 .generate({type:"nodebuffer"});
		fs.writeFileSync(produccion+"FormatuSolSalida.docx",buf);		
		// read binary data
    var bitmap = fs.readFileSync(produccion+"FormatuSolSalida.docx");
    
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
		
  }, 
	
});