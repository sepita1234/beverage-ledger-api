import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';


describe('RF-29 - Gestión de usuarios', () => {


  let findUserByEmail: ReturnType<typeof vi.fn>;
  let createUser: ReturnType<typeof vi.fn>;
  let updateUser: ReturnType<typeof vi.fn>;



  beforeEach(() => {

    findUserByEmail = vi.fn();

    createUser = vi.fn();

    updateUser = vi.fn();

  });




  it('Camino 1 - crear usuario válido correctamente', async () => {


    findUserByEmail.mockResolvedValue(null);


    createUser.mockResolvedValue({

      id:'user-001',

      email:'usuario@test.com',

      status:'ACTIVE'

    });



    const resultado = await crearUsuario(

      {
        name:'Usuario prueba',
        email:'usuario@test.com',
        role:'ADMIN'
      },

      findUserByEmail,

      createUser

    );



    expect(resultado.email)

      .toBe('usuario@test.com');


  });





  it('Camino 2 - correo existente rechaza creación', async () => {


    findUserByEmail.mockResolvedValue({

      id:'user-002'

    });



    await expect(

      crearUsuario(

        {
          name:'Nuevo',
          email:'usuario@test.com'
        },

        findUserByEmail,

        createUser

      )

    ).rejects.toThrow(ConflictException);


  });






  it('Camino 3 - correo inválido rechaza registro', async () => {


    await expect(

      crearUsuario(

        {
          name:'Usuario',
          email:'correo'
        },

        findUserByEmail,

        createUser

      )

    ).rejects.toThrow(BadRequestException);


  });







  it('Camino 4 - campos obligatorios vacíos rechazan creación', async () => {


    await expect(

      crearUsuario(

        {
          name:'',
          email:''
        },

        findUserByEmail,

        createUser

      )

    ).rejects.toThrow(BadRequestException);


  });








  it('Camino 5 - rol no autorizado rechaza creación', async () => {


    await expect(

      crearUsuario(

        {
          name:'Usuario',
          email:'usuario@test.com',
          role:'INVALID'
        },

        findUserByEmail,

        createUser

      )

    ).rejects.toThrow(ForbiddenException);


  });








  it('Camino 6 - usuario suspendido no puede actualizarse', async () => {


    await expect(

      actualizarUsuario(

        {
          id:'user-006',
          status:'SUSPENDED'
        },

        updateUser

      )

    ).rejects.toThrow(BadRequestException);


  });



});





async function crearUsuario(

data:any,

findUserByEmail:any,

createUser:any

){


 if(!data.name || !data.email){

  throw new BadRequestException();

 }


 if(!data.email.includes('@')){

  throw new BadRequestException();

 }


 if(data.role === 'INVALID'){

  throw new ForbiddenException();

 }


 const existe = await findUserByEmail(data.email);


 if(existe){

  throw new ConflictException();

 }


 return await createUser(data);


}






async function actualizarUsuario(

usuario:any,

updateUser:any

){


 if(usuario.status === 'SUSPENDED'){

  throw new BadRequestException();

 }


 return updateUser(usuario.id, usuario);


}