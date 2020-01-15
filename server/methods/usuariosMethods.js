Meteor.methods({
	createUsuario: function (usuario, rol, grupo) {

		_.each(usuario.profile.documentos, function (documento) {
			delete documento.$$hashKey;
		});

		var sucursal;
		if (rol == "Cliente") {
			sucursal = Sucursales.findOne(usuario.profile.sucursal_id);
			//var numero = parseInt(usuario.profile.numeroCliente);

			//se desactivo para que ellos empiecena capturar el numero-----------------
			if (sucursal.folioCliente != undefined)
				numero = sucursal.folioCliente + 1;
			else {
				sucursal.folioCliente = 0;
				numero = sucursal.folioCliente + 1;
			}


			if (numero < 10)
				usuario.username = sucursal.clave + '-C000' + numero.toString();
			else if (numero < 100)
				usuario.username = sucursal.clave + '-C00' + numero.toString();
			else if (numero < 1000)
				usuario.username = sucursal.clave + '-C0' + numero.toString();
			else
				usuario.username = sucursal.clave + '-C' + numero.toString();

			//usuario.contrasena = Math.random().toString(36).substring(2,7);
			usuario.password = '123';
			sucursal.folioCliente = numero;
			usuario.profile.numeroCliente = usuario.username;

		}
		else if (rol == "Distribuidor") {
			sucursal = Sucursales.findOne(usuario.profile.sucursal_id);

			var numero;// = usuario.profile.numeroDistribuidor;

			numero = sucursal.folioDistribuidor + 1;

			if (numero < 10)
				usuario.username = sucursal.clave + '-D000' + numero;
			else if (numero < 100)
				usuario.username = sucursal.clave + '-D00' + numero;
			else if (numero < 1000)
				usuario.username = sucursal.clave + '-D0' + numero;
			else
				usuario.username = sucursal.clave + '-D' + numero;

			//usuario.contrasena = Math.random().toString(36).substring(2,7);

			var dia = usuario.profile.fechaNacimiento.getDate();
			var anio = usuario.profile.fechaNacimiento.getFullYear();

			if (dia < 10)
				dia = "0" + dia;

			var pwd = dia.toString().trim() + anio.toString().trim();
			usuario.password = pwd.toString();
			sucursal.folioDistribuidor = numero;
			usuario.profile.numeroCliente = usuario.username;

		}
		else if (rol == "Promotora") {
			sucursal = Sucursales.findOne(usuario.profile.sucursal_id);


			var numero;// = usuario.profile.numeroDistribuidor;

			numero = sucursal.folioPromotora + 1;

			if (numero < 10)
				usuario.username = sucursal.clave + '-P000' + numero;
			else if (numero < 100)
				usuario.username = sucursal.clave + '-P00' + numero;
			else if (numero < 1000)
				usuario.username = sucursal.clave + '-P0' + numero;
			else
				usuario.username = sucursal.clave + '-P' + numero;

			//usuario.contrasena = Math.random().toString(36).substring(2,7);
			var dia = usuario.profile.fechaNacimiento.getDate();
			var anio = usuario.profile.fechaNacimiento.getFullYear();

			if (dia < 10)
				dia = "0" + dia;

			var pwd = dia.toString().trim() + anio.toString().trim();
			usuario.password = pwd.toString();
			usuario.password = pwd;
			sucursal.folioPromotora = numero;
			usuario.profile.numeroCliente = usuario.username;

			//console.log(pwd);
			//console.log(usuario.username);
		}

		//Crea al Usuario
		var usuario_id = Accounts.createUser({
			username: usuario.username,
			password: usuario.password,
			profile: usuario.profile
		});

		Roles.addUsersToRoles(usuario_id, rol, grupo);

		if (rol == "Cliente" || rol == "Distribuidor" || rol == "Promotora") {
			Sucursales.update({ _id: sucursal._id },
				{
					$set: {
						folioCliente: sucursal.folioCliente,
						folioDistribuidor: sucursal.folioDistribuidor,
						folioPromotora: sucursal.folioPromotora
					}
				});

			/*
			Meteor.call('sendEmail',
				usuario.profile.correo,
				'sistema@corazonvioleta.mx',
				'Bienvenido a Crédito Mio',
				'Usuario: '+ usuario.username + ' contraseña: ' + usuario.password
			);
*/
		}

		if (rol == "Distribuidor") {
			BitacoraLimitesCredito.insert({
				distribuidor_id: usuario_id,
				limiteCredito: usuario.profile.limiteCredito,
				movimiento: "Inicio",
				fecha: new Date(),
				usuario_id: Meteor.userId()
			});
		}

		var user = Meteor.users.findOne({ _id: usuario_id });
		user.profile.referenciasPersonales_ids = [];

		_.each(usuario.profile.referenciasPersonales, function (referenciaPersonal) {
			if (referenciaPersonal.estatus == "N")
				referenciaPersonal.estatus = "G";

			user.profile.referenciasPersonales_ids.push({
				num: referenciaPersonal.num,
				numeroCliente: user.profile.numeroCliente,
				referenciaPersonal_id: referenciaPersonal._id,
				//_id										: referenciaPersonal._id, 
				nombreCompleto: referenciaPersonal.nombreCompleto,
				parentesco: referenciaPersonal.parentesco,
				tiempoConocerlo: referenciaPersonal.tiempoConocerlo,
				estatus: referenciaPersonal.estatus
			});

			//Agregar un arrar de la info del cliente en el AVAl
			var RP = ReferenciasPersonales.findOne(referenciaPersonal._id);
			RP.clientes.push({
				cliente_id: usuario_id,
				nombreCompleto: user.profile.nombreCompleto,
				parentesco: referenciaPersonal.parentesco,
				tiempoConocerlo: referenciaPersonal.tiempoConocerlo,
				tipo: rol,
				estatus: referenciaPersonal.estatus
			});

			var idTemp = RP._id;
			delete RP._id;
			ReferenciasPersonales.update({ _id: idTemp }, { $set: RP })

		});

		delete user.profile['referenciasPersonales'];

		//actualizar el user para poner solo los ids
		Meteor.users.update({ _id: usuario_id }, { $set: user })

		return user._id;
	},
	cambiaEstatusUsuario: function (id, estatus) {

		Meteor.users.update({ _id: id }, { $set: { "profile.estatus": estatus } });

		return true;
	},
	validarCliente: function (nombreCompleto) {
		var user = Meteor.users.find({ "profile.nombreCompleto": nombreCompleto, roles: ["Cliente"] }).fetch();

		if (user.length > 0)
			return true;

		return false;
	},
	validarDistribuidor: function (nombreCompleto) {
		var user = Meteor.users.find({ "profile.nombreCompleto": nombreCompleto, roles: ["Distribuidor"] }).fetch();

		if (user.length > 0)
			return true;

		return false;
	},
	userIsInRole: function (usuario, rol, grupo, vista) {
		if (!Roles.userIsInRole(usuario, rol, grupo)) {
			throw new Meteor.Error(403, "Usted no tiene permiso para entrar a " + vista);
		}
	},
	createGerenteSucursal: function (usuario, rol) {

		var usuario_id = Accounts.createUser({
			username: usuario.username,
			password: usuario.password,
			profile: usuario.profile
		});

		Roles.addUsersToRoles(usuario_id, rol);

	},
	updateUsuario: function (usuario, referenciasPersonales, rol, cambiarPassword) {

		var user = Meteor.users.findOne({ _id: usuario._id });
		user.profile = usuario.profile;

		_.each(referenciasPersonales, function (referenciaPersonal) {

			if (referenciaPersonal.estatus == "N") {
				referenciaPersonal.estatus = "G";
				user.profile.referenciasPersonales_ids.push({
					num: referenciaPersonal.num,
					numeroCliente: user.profile.numeroCliente,
					referenciaPersonal_id: referenciaPersonal._id,
					// _id										: referenciaPersonal._id, 
					nombreCompleto: referenciaPersonal.nombreCompleto,
					parentesco: referenciaPersonal.parentesco,
					tiempoConocerlo: referenciaPersonal.tiempoConocerlo,
					estatus: referenciaPersonal.estatus
				});

				var RP = ReferenciasPersonales.findOne(referenciaPersonal._id);
				RP.clientes.push({
					cliente_id: usuario._id,
					nombreCompleto: user.profile.nombreCompleto,
					parentesco: referenciaPersonal.parentesco,
					tiempoConocerlo: referenciaPersonal.tiempoConocerlo,
					tipo: rol,
					estatus: referenciaPersonal.estatus
				});

				var idTemp = RP._id;
				delete RP._id;
				ReferenciasPersonales.update({ _id: idTemp }, { $set: RP });

			}
			else if (referenciaPersonal.estatus == "A") {
				//Buscar referenciasPersonales_ids y actualizarlo						
				_.each(user.profile.referenciasPersonales_ids, function (referenciaPersonal_ids) {
					if (referenciaPersonal_ids.num == referenciaPersonal.num) {

						referenciaPersonal_ids.parentesco = referenciaPersonal.parentesco;
						referenciaPersonal_ids.tiempoConocerlo = referenciaPersonal.tiempoConocerlo;
						referenciaPersonal_ids.estatus = "G";

						var RP = ReferenciasPersonales.findOne(referenciaPersonal_ids.referenciaPersonal_id);

						RP.telefono = referenciaPersonal.telefono;
						RP.direccion = referenciaPersonal.direccion;
						RP.celular = referenciaPersonal.celular;
						RP.ciudad = referenciaPersonal.ciudad;
						RP.estado = referenciaPersonal.estado;

						_.each(RP.clientes, function (cliente) {
							if (cliente.cliente_id == user._id) {
								cliente.parentesco = referenciaPersonal.parentesco;
								cliente.tiempoConocerlo = referenciaPersonal.tiempoConocerlo;
							}
						});
						var idTemp = RP._id;
						delete RP._id;
						ReferenciasPersonales.update({ _id: idTemp }, { $set: RP });
					}
				});
			}

			/*
if (referenciaPersonal.buscarPersona_id)
				{
						//console.log(referenciaPersonal.buscarPersona_id);
						var p = Personas.findOne({_id:referenciaPersonal.buscarPersona_id});
						
						//console.log("P:",p)	
						
						p.nombre = referenciaPersonal.nombre;
						p.apellidoPaterno = referenciaPersonal.apellidoPaterno;
						p.apellidoMaterno = referenciaPersonal.apellidoMaterno;
													
						_.each(p.relaciones, function(relacion){
								if (relacion.cliente_id == user._id){

										relacion.cliente_id 		 = user._id;
										relacion.cliente 				 = user.profile.nombreCompleto;
										relacion.nombre					 = referenciaPersonal.nombre;
										relacion.apellidoPaterno = referenciaPersonal.apellidoPaterno;
										relacion.apellidoMaterno = referenciaPersonal.apellidoMaterno;
										relacion.parentezco			 = referenciaPersonal.parentezco;
										relacion.direccion			 = referenciaPersonal.direccion;
										relacion.telefono				 = referenciaPersonal.telefono;
										relacion.tiempo					 = referenciaPersonal.tiempo;
										relacion.num						 = referenciaPersonal.num;
										relacion.tipoPersona		 = "Referencia"; 
										relacion.estatus				 = 0;
								}
						});
						
						//console.log("Actualizar cliente_id:",p);
						
						Personas.update({_id: referenciaPersonal.buscarPersona_id},{$set:p});
				}
				else if (referenciaPersonal.persona_id)
				{
						
						var p = Personas.findOne({_id:referenciaPersonal.persona_id});
						

						p.relaciones.push({cliente_id	 		 : user._id, 
															 cliente		 		 : user.profile.nombreCompleto,
															 nombre					 : referenciaPersonal.nombre,
															 apellidoPaterno : referenciaPersonal.apellidoPaterno,
															 apellidoMaterno : referenciaPersonal.apellidoMaterno,
															 parentezco	 		 : referenciaPersonal.parentezco,
															 direccion	 		 : referenciaPersonal.direccion,
															 telefono	   		 : referenciaPersonal.telefono,
															 tiempo			 		 : referenciaPersonal.tiempo,
															 num				 		 : referenciaPersonal.num,
															 tipoPersona 		 : "Referencia", 
															 estatus				 : 0});
															 
						//console.log("Actualizar persona_id:",p);
						
						Personas.update({_id: referenciaPersonal.persona_id},{$set:p});
						usuario.profile.referenciasPersonales_ids.push(referenciaPersonal.persona_id);
				}
				else //(referenciaPersonal.persona_id != undefined && referenciaPersonal.cliente_id != undefined)
				{

						var relacion = {nombre					: referenciaPersonal.nombre,
													  apellidoPaterno : referenciaPersonal.apellidoPaterno,
													  apellidoMaterno : referenciaPersonal.apellidoMaterno,
													  nombreCompleto  : referenciaPersonal.nombre + " " + referenciaPersonal.apellidoPaterno + " " + referenciaPersonal.apellidoMaterno
													  };		
						
						relacion.relaciones = [];
						relacion.relaciones.push({cliente_id			: user._id, 
																			cliente					: usuario.profile.nombreCompleto, 
																			nombre					: referenciaPersonal.nombre,
																			apellidoPaterno : referenciaPersonal.apellidoPaterno,
																			apellidoMaterno : referenciaPersonal.apellidoMaterno,
																			parentezco			: referenciaPersonal.parentezco,
																			direccion				:	referenciaPersonal.direccion,
																			telefono				: referenciaPersonal.telefono,
																			tiempo					: referenciaPersonal.tiempo,
																			num							: referenciaPersonal.num,
																			tipoPersona			: "Referencia", 
																			estatus					: 0});
						
						//console.log("Actualizar sin nada:",relacion);
																								
						var result = Personas.insert(relacion);
						usuario.profile.referenciasPersonales_ids.push(result);

						}
*/

		});


		Meteor.users.update({ _id: user._id }, {
			$set: {
				username: usuario.username,
				roles: [rol],
				profile: user.profile
			}
		});

		if (cambiarPassword == false)
			Accounts.setPassword(user._id, usuario.password, { logout: false });


		return true;

	},
	updateReferenciasPersonales: function (usuario_id, numeroCliente, referenciasPersonales_ids) {

		var referenciasPersonales = [];

		_.each(referenciasPersonales_ids, function (referenciaPersonal) {

			referenciaPersonal.estatus = "G";
			referenciasPersonales.push({
				num: referenciaPersonal.num,
				numeroCliente: numeroCliente,
				referenciaPersonal_id: referenciaPersonal._id,
				nombreCompleto: referenciaPersonal.nombreCompleto,
				parentesco: referenciaPersonal.parentesco,
				tiempoConocerlo: referenciaPersonal.tiempoConocerlo
			});

		});


		Meteor.users.update({ _id: usuario_id },
			{ $set: { "profile.referenciasPersonales_ids": referenciasPersonales } });

		return true;

	},
	updateGerenteSucursal: function (usuario, rol) {
		//console.log(usuario)
		var user = Meteor.users.findOne({ username: usuario.username });
		user.profile = usuario.profile;

		Meteor.users.update({ username: user.username }, {
			$set: {
				username: user.username,
				roles: [rol],
				profile: user.profile
			}
		});

		Accounts.setPassword(user._id, usuario.password, { logout: false });

	},
	getUsuario: function (usuario) {

		if (usuario != undefined) {
			var user = Meteor.users.findOne({ "_id": usuario }, { fields: { "profile.nombreCompleto": 1, "profile.nombre": 1, "profile.numeroCliente": 1 } });
			//console.log(user);
			if (user != undefined)
				return user.profile;
		}

	},
	getUsuarioVerificacion: function (usuario) {

		if (usuario != undefined || usuario != "") {
			var user = Meteor.users.findOne({ "_id": usuario }, {
				fields: {
					"profile.nombreCompleto": 1,
					"profile.calle": 1,
					"profile.numero": 1,
					"profile.codigoPostal": 1,
					"profile.colonia_id": 1,
					"profile.ciudad_id": 1,
					"profile.particular": 1,
					"profile.celular": 1,
					"profile.tiempoResidencia": 1,
					"profile.foto": 1,
					"profile.senasParticulares": 1

				}
			});
			if (user != undefined) {
				if (user.profile.colonia_id != undefined) {
					var colonia = Colonias.findOne({ _id: user.profile.colonia_id });
					user.profile.colonia = colonia.nombre;
				}

				if (user.profile.ciudad_id != undefined) {
					var ciudad = Ciudades.findOne({ _id: user.profile.ciudad_id });
					user.profile.ciudad = ciudad.nombre;
				}

				return user.profile;
			}

		}

	},
	getAvalVerificacion: function (usuario) {
		if (usuario != undefined) {
			var user = Avales.findOne({ "_id": usuario }, {
				fields: {
					"profile.nombreCompleto": 1,
					"profile.calle": 1,
					"profile.numero": 1,
					"profile.codigoPostal": 1,
					"profile.colonia_id": 1,
					"profile.ciudad_id": 1,
					"profile.particular": 1,
					"profile.celular": 1,
					"profile.foto": 1,
					"profile.senasParticulares": 1,
					"profile.tiempoResidencia": 1
				}
			});

			var colonia = Colonias.findOne({ _id: user.profile.colonia_id });
			user.profile.colonia = colonia.nombre;
			var ciudad = Ciudades.findOne({ _id: user.profile.ciudad_id });
			user.profile.ciudad = ciudad.nombre;

			if (user != undefined)
				return user.profile;
		}

	},
	getClienteDistribuidor: function (id) {
		var user = Meteor.users.findOne({ "_id": id });

		return user;
	},
	getAvalCompleto: function (usuario) {
		var aval = Avales.findOne({ "_id": usuario._id });

		return aval;
	},
	getAval: function (aval_id) {
		var a = Avales.findOne({ "_id": aval_id });

		var ocupacion = Ocupaciones.findOne(a.profile.ocupacion_id);
		a.profile.ocupacion = "";
		if (ocupacion != undefined)
			a.profile.ocupacion = ocupacion.nombre;

		var estadoCivil = EstadoCivil.findOne(a.profile.estadoCivil_id);
		a.profile.estadoCivil = "";
		if (estadoCivil != undefined)
			a.profile.estadoCivil = estadoCivil.nombre;

		var empresa = Empresas.findOne(a.profile.empresa_id);
		a.profile.empresa = {};
		if (empresa != undefined)
			a.profile.empresa = empresa;

		return a.profile;
	},
	getReferenciaPersonal: function (id) {
		var RP = ReferenciasPersonales.findOne({ _id: id });
		return RP;
	},
	getReferenciaPersonales: function (referenciasPersonales_ids, cliente_id) {

		var referenciasPersonales = [];

		_.each(referenciasPersonales_ids, function (referenciaPersonal) {

			var RP = ReferenciasPersonales.findOne({ _id: referenciaPersonal.referenciaPersonal_id });
			//console.log(RP);
			if (RP.apellidoMaterno == undefined || RP.apellidoMaterno == "") {
				RP.apellidoMaterno = ""
			}
			//Recorrer las relaciones                     
			referenciasPersonales.push({
				_id: RP._id,
				nombre: RP.nombre,
				apellidoPaterno: RP.apellidoPaterno,
				apellidoMaterno: RP.apellidoMaterno,
				parentesco: referenciaPersonal.parentesco,
				direccion: RP.direccion,
				telefono: RP.telefono,
				celular: RP.celular,
				ciudad: RP.ciudad,
				estado: RP.estado,
				tiempoConocerlo: referenciaPersonal.tiempoConocerlo,
				num: referenciaPersonal.num,
				nombreCompleto: RP.nombreCompleto,
				cliente_id: cliente_id,
				estatus: referenciaPersonal.estatus
			});
		});

		return referenciasPersonales;
	},
	getPersonas: function (nombre) {	//Se hizo para la validacion de Clientes, Avales y Referencias Personales
		var personas = {};
		personas.clientes = [];
		personas.distribuidores = [];
		personas.avales = [];
		personas.referenciasPersonales = [];
		personas.clientes = Meteor.users.find({ "profile.nombreCompleto": { '$regex': '.*' + nombre || '' + '.*', '$options': 'i' }, roles: ["Cliente"] },
			{ fields: { "profile.nombreCompleto": 1, "profile.sexo": 1, "profile.foto": 1, "profile.referenciasPersonales_ids": 1, roles: 1 } },
			{ sort: { "profile.nombreCompleto": 1 } }, { "profile.nombreCompleto": 1, "profile.referenciasPersonales_ids": 1 }).fetch();

		personas.distribuidores = Meteor.users.find({ "profile.nombreCompleto": { '$regex': '.*' + nombre || '' + '.*', '$options': 'i' }, roles: ["Distribuidor"] },
			{ fields: { "profile.nombreCompleto": 1, "profile.sexo": 1, "profile.foto": 1, "profile.referenciasPersonales_ids": 1, roles: 1 } },
			{ sort: { "profile.nombreCompleto": 1 } }, { "profile.nombreCompleto": 1, "profile.referenciasPersonales_ids": 1 }).fetch();

		personas.avales = Avales.find({ "profile.nombreCompleto": { '$regex': '.*' + nombre || '' + '.*', '$options': 'i' } },
			{ fields: { "profile.nombreCompleto": 1, "profile.sexo": 1, "profile.foto": 1, "profile.creditos": 1 } },
			{ sort: { "profile.nombreCompleto": 1 } }).fetch();

		personas.referenciasPersonales = ReferenciasPersonales.find({ nombreCompleto: { '$regex': '.*' + nombre || '' + '.*', '$options': 'i' } },
			{ fields: { nombreCompleto: 1, clientes: 1 } },
			{ sort: { nombreCompleto: 1 } }).fetch();
		return personas;
	},
	getPersonasDeudas: function (nombre) {	//Se hizo para la validacion de Clientes, Avales y Referencias Personales
		var personas = {};
		personas = [];
		//personas.Beneficiados	= [];

		var buscarClientes = Meteor.users.find({ "profile.nombreCompleto": { '$regex': '.*' + nombre || '' + '.*', '$options': 'i' }, roles: ["Cliente"] },
			{ fields: { "profile.nombreCompleto": 1, "profile.sexo": 1, "profile.foto": 1, roles: 1 } },
			{ sort: { "profile.nombreCompleto": 1 } }, { "profile.nombreCompleto": 1, "profile.referenciasPersonales_ids": 1 }).fetch();



		_.each(buscarClientes, function (cliente) {

			var creditos = Creditos.find({ $and: [{ cliente_id: cliente._id, saldoActual: { $gt: 0 }, estatus: 4 }] }).fetch();

			var deuda = 0;
			_.each(creditos, function (credito) {
				deuda += Number(parseFloat(credito.saldoActual).toFixed(2));
			})

			personas.push({
				_id: cliente._id,
				nombre: cliente.profile.nombreCompleto,
				tipo: "Cliente",
				deuda: deuda,
				creditos: creditos
			});

		});

		var buscarDistribuidores = Meteor.users.find({ "profile.nombreCompleto": { '$regex': '.*' + nombre || '' + '.*', '$options': 'i' }, roles: ["Distribuidor"] },
			{ fields: { "profile.nombreCompleto": 1, "profile.sexo": 1, "profile.foto": 1, roles: 1 } },
			{ sort: { "profile.nombreCompleto": 1 } }, { "profile.nombreCompleto": 1, "profile.referenciasPersonales_ids": 1 }).fetch();



		_.each(buscarDistribuidores, function (cliente) {

			var creditos = Creditos.find({ $and: [{ cliente_id: cliente._id, saldoActual: { $gt: 0 }, estatus: 4 }] }).fetch();

			var deuda = 0;
			_.each(creditos, function (credito) {
				deuda += Number(parseFloat(credito.saldoActual).toFixed(2));
			})

			personas.push({
				_id: cliente._id,
				nombre: cliente.profile.nombreCompleto,
				tipo: "Distribuidor",
				deuda: deuda,
				creditos: creditos
			});

		});


		var buscarValesBeneficiados = Beneficiarios.find({ "nombreCompleto": { '$regex': '.*' + nombre || '' + '.*', '$options': 'i' } },
			{ sort: { "nombreCompleto": 1 } }).fetch();


		_.each(buscarValesBeneficiados, function (beneficiario) {

			personas.push({
				_id: beneficiario._id,
				nombre: beneficiario.nombreCompleto,
				tipo: "Beneficiario",
				deuda: beneficiario.saldoActualVales,
				creditos: []
			});

		});




		return personas;
	},
	validarCredenciales: function (usuario) {

		var u = Meteor.users.findOne({ username: usuario.username, roles: { $in: ['Gerente', 'Supervisor'] } });

		ban = false;
		if (u != undefined)
			if (u.profile.passwordDesbloqueo == usuario.password)
				ban = true;

		return ban;

	},
	//Lo use para la importacion
	getUsuarioNumeroCliente: function (numeroCliente) {

		var user = Meteor.users.findOne({ "profile.numeroCliente": numeroCliente }, { fields: { "profile.nombreCompleto": 1, "profile.nombre": 1, "profile.numeroCliente": 1 } });

		return user;
	},
	getUsuarioId: function (id) {

		var user = Meteor.users.findOne({ _id: id }, {
			fields: {
				"profile.nombreCompleto": 1, "profile.nombre": 1, "profile.numeroCliente": 1,
				"profile.calle": 1, "profile.colonia_id": 1, "profile.ciudad_id": 1
			}
		});


		var colonia = Colonias.findOne(user.profile.colonia_id);
		var ciudad = Ciudades.findOne(user.profile.ciudad_id);

		user.profile.colonia = colonia != undefined ? colonia.nombre : "";
		user.profile.ciudad = ciudad.nombre;

		return user;
	},
	getDocumentosSinImagenCliente: function (_id) {

		var user = Meteor.users.findOne({ _id: _id }, { fields: { "profile.documentos": 1 } });
		var documentos = [];

		var con = 0;
		_.each(user.profile.documentos, function (documento) {

			documentos.push({ pos: con, nombre: documento.nombre });
			con = con + 1;
		});

		return documentos;
	},
	getImagenDocumentoCliente: function (_id, pos) {

		var user = Meteor.users.findOne({ _id: _id }, { fields: { "profile.documentos": 1 } });
		var imagen = "";

		var con = 0;
		_.each(user.profile.documentos, function (documento) {
			if (pos == con) {
				imagen = documento.imagen;
				//console.log(documento.pos);
			}
			con = con + 1;
		});

		return imagen;
	},
	setDocumentosCliente: function (cliente_id, documento_id, imagen) {

		var documento = {};

		documento.cliente_id = cliente_id;
		documento.documento_id = documento_id;
		documento.imagen = imagen;
		documento.fechaCreacion = new Date();

		DocumentosClientes.insert(documento)


		//Devolver los documentos que tenga
		var documentos = DocumentosClientes.find({ cliente_id: cliente_id }, { fields: { "imagen": 0 } }).fetch();
		_.each(documentos, function (documento) {
			var doc = Documentos.findOne(documento.documento_id);
			documento.nombre = doc.nombre;
		});
		return documentos;
	},
	getDocumentosClientes: function (cliente_id) {

		var documentos = DocumentosClientes.find({ cliente_id: cliente_id }, { fields: { "imagen": 0 } }).fetch();

		_.each(documentos, function (documento) {
			var doc = Documentos.findOne({ _id: documento.documento_id });
			if (doc != undefined) {
				documento.nombre = doc.nombre;
			}
		});

		return documentos;

	},
	borrarDocumentoCliente: function (cliente_id, id) {

		DocumentosClientes.remove({ _id: id });

		var documentos = DocumentosClientes.find({ cliente_id: cliente_id }, { fields: { "imagen": 0 } }).fetch();

		_.each(documentos, function (documento) {
			var doc = Documentos.findOne(documento.documento_id);
			documento.nombre = doc.nombre;
		});

		return documentos;

	},
	getDocumentoCliente: function (id) {
		var doc = DocumentosClientes.findOne({ _id: id });
		return doc.imagen;
	},
	updateSucursal: function (usuario_id, sucursal_id) {
		Meteor.users.update({ _id: usuario_id }, {
			$set: {
				"profile.sucursal_id": sucursal_id
			}
		});

	},
	getPeople: function (idReferencia) {

		var persona = Meteor.users.findOne({ _id: idReferencia }, { fields: { "profile.documentos": 0 } });
		_.each(persona, function (objeto) {
			objeto.nacionalidadCliente = Nacionalidades.findOne(objeto.nacionalidad_id);
			objeto.coloniaCliente = Colonias.findOne(objeto.colonia_id);
			objeto.estadoCliente = Estados.findOne(objeto.estado_id);
			objeto.municipioCliente = Municipios.findOne(objeto.municipio_id);
			objeto.paisCliente = Paises.findOne(objeto.pais_id);
			objeto.ocupacionCliente = Ocupaciones.findOne(objeto.ocupacion_id);
			objeto.ciudadCliente = Ciudades.findOne(objeto.ciudad_id);
			objeto.sucursales = Sucursales.findOne(objeto.sucursal_id);
			objeto.estadoCivilCliente = EstadoCivil.findOne(objeto.estadoCivil_id);
			objeto.empresa = Empresas.findOne(objeto.empresa_id);


			if (objeto.empresa != undefined) {
				objeto.paisEmpresa = Paises.findOne(objeto.empresa.pais_id);
				objeto.estadoEmpresa = Estados.findOne(objeto.empresa.estado_id);
				objeto.municipioEmpresa = Municipios.findOne(objeto.empresa.municipio_id);
				objeto.ciudadEmpresa = Ciudades.findOne(objeto.empresa.ciudad_id);
				objeto.coloniaEmpresa = Colonias.findOne(objeto.empresa.colonia_id);
			}

			_.each(objeto.referenciasPersonales_ids, function (r) {

				var ref = ReferenciasPersonales.findOne(r.referenciaPersonal_id);
				r.telefono = ref.telefono;
			});

		});
		//console.log(persona,"termina")				
		//console.log("esta es la referencia",referencia)
		return persona;
	},
});
