import { describe, expect, it, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';


describe('RF-01 - Inicio de sesión con credenciales', () => {

  let findByEmail: ReturnType<typeof vi.fn>;
  let verifyPassword: ReturnType<typeof vi.fn>;


  beforeEach(() => {

    // Arrange - Mock de dependencias

    findByEmail = vi.fn();
    verifyPassword = vi.fn();

  });


  it('Camino 1 - usuario registrado con credenciales válidas puede autenticarse', async () => {

    // Arrange

    findByEmail.mockResolvedValue({
      id: 'user-001',
      email: 'usuario@test.com',
      passwordHash: 'hash',
      status: 'ACTIVE'
    });


    verifyPassword.mockResolvedValue(true);


    // Act

    const usuario = await validarCredenciales(
      'usuario@test.com',
      '123456',
      findByEmail,
      verifyPassword
    );


    // Assert

    expect(usuario.email)
      .toBe('usuario@test.com');


    expect(verifyPassword)
      .toHaveBeenCalledWith(
        '123456',
        'hash'
      );

  });



  it('Camino 2 - usuario inexistente rechaza autenticación', async () => {

    // Arrange

    findByEmail.mockResolvedValue(null);


    // Act

    const resultado = validarCredenciales(
      'noexiste@test.com',
      '123456',
      findByEmail,
      verifyPassword
    );


    // Assert

    await expect(resultado)
      .rejects
      .toThrow(UnauthorizedException);


  });



  it('Camino 3 - contraseña incorrecta rechaza autenticación', async () => {

    // Arrange

    findByEmail.mockResolvedValue({
      id:'user-002',
      email:'usuario@test.com',
      passwordHash:'hash',
      status:'ACTIVE'
    });


    verifyPassword.mockResolvedValue(false);


    // Act

    const resultado = validarCredenciales(
      'usuario@test.com',
      'claveIncorrecta',
      findByEmail,
      verifyPassword
    );


    // Assert

    await expect(resultado)
      .rejects
      .toThrow(UnauthorizedException);


  });



});



// Simulación de la lógica del caso de uso

async function validarCredenciales(
  email:string,
  password:string,
  findByEmail:any,
  verifyPassword:any
){

  const usuario = await findByEmail(email);


  if(!usuario){
    throw new UnauthorizedException(
      'Credenciales inválidas'
    );
  }


  const valido = await verifyPassword(
    password,
    usuario.passwordHash
  );


  if(!valido){
    throw new UnauthorizedException(
      'Credenciales inválidas'
    );
  }


  return usuario;

}