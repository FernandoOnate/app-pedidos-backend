import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Persona} from '../models';
import {PersonaRepository} from '../repositories';
import {Llaves} from '../config/llaves';

const generador = require("password-generator");
const cryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');

@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(
    @repository(PersonaRepository)
    public personaR: PersonaRepository

  ) { }

  /*
   * Add service methods here
   */
  generarClave() {
    let clave = generador(8, false);
    return clave;
  }
  cifrarClave(clave: string) {
    let claveCifrada = cryptoJS.MD5(clave).toString();
    return claveCifrada;
  }
  identificarPersona(usuario: string, clave: string) {
    try {
      let p = this.personaR.findOne({where: {correo: usuario, clave: clave}});
      if (p) {
        return p;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error + "error al encontrar");
      return false;
    }
  }
  generarTokenJWT(persona: Persona) {
    let token = jwt.sign({
      data: {
        id: persona.id,
        correo: persona.correo,
        nombre: persona.nombres + " " + persona.apellidos
      }
    }, Llaves.claveJWT);
    return token;
  }
  validarToken(token: string) {
    try {
      let datos = jwt.verify(token, Llaves.claveJWT);
      return datos;

    } catch (error) {
      return false;
    }
  }
}
