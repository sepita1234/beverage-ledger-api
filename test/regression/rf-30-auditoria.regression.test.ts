import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { beforeEach, describe, expect, it, vi } from 'vitest';



describe('RF-30 - Auditoría del sistema', () => {


  let saveAudit: ReturnType<typeof vi.fn>;
  let findAudit: ReturnType<typeof vi.fn>;



  beforeEach(() => {


    // =========================
    // MOCKS
    // =========================


    saveAudit = vi.fn();

    findAudit = vi.fn();


  });





  it('Camino 1 - registrar evento correctamente', async () => {


    // ARRANGE

    saveAudit.mockResolvedValue({

      id: 'audit-001',

      action: 'CREATE',

      entity: 'USER'

    });



    // ACT

    const resultado = await registrarAuditoria(

      {
        action: 'CREATE',

        entity: 'USER'
      },

      saveAudit

    );



    // ASSERT

    expect(resultado.action)

      .toBe('CREATE');


    expect(saveAudit)

      .toHaveBeenCalled();



  });








  it('Camino 2 - usuario autenticado registra auditoría', async () => {


    // ARRANGE


    saveAudit.mockResolvedValue({

      id: 'audit-002',

      userId: 'user-001',

      action: 'LOGIN',

      entity: 'USER'

    });



    // ACT


    const resultado = registrarAuditoria(

      {
        userId: 'user-001',

        action: 'LOGIN',

        entity: 'USER'
      },

      saveAudit

    );



    // ASSERT


    await expect(resultado)

      .resolves

      .toBeDefined();



    expect(saveAudit)

      .toHaveBeenCalled();



  });








  it('Camino 3 - usuario inexistente rechaza auditoría', async () => {


    // ARRANGE


    const resultado = registrarAuditoria(

      {
        userId: null,

        action: 'LOGIN',

        entity: 'USER'
      },

      saveAudit

    );



    // ASSERT


    await expect(resultado)

      .rejects

      .toThrow(NotFoundException);



  });








  it('Camino 4 - acción vacía rechaza registro', async () => {


    const resultado = registrarAuditoria(

      {
        action: '',

        entity: 'USER'
      },

      saveAudit

    );



    await expect(resultado)

      .rejects

      .toThrow(BadRequestException);



  });








  it('Camino 5 - entidad inválida rechaza registro', async () => {


    const resultado = registrarAuditoria(

      {
        action: 'UPDATE',

        entity: ''
      },

      saveAudit

    );



    await expect(resultado)

      .rejects

      .toThrow(BadRequestException);



  });








  it('Camino 6 - consultar auditorías devuelve información', async () => {


    // ARRANGE


    findAudit.mockResolvedValue([

      {
        id: 'audit-001',

        action: 'LOGIN'

      }

    ]);



    // ACT


    const resultado = await consultarAuditoria(

      findAudit

    );



    // ASSERT


    expect(resultado.length)

      .toBe(1);



  });








  it('Camino 7 - auditoría duplicada bloqueada', async () => {


    // ARRANGE


    saveAudit.mockRejectedValue(

      new BadRequestException()

    );



    const resultado = registrarAuditoria(

      {
        action: 'LOGIN',

        entity: 'USER'
      },

      saveAudit

    );



    // ASSERT


    await expect(resultado)

      .rejects

      .toThrow(BadRequestException);



  });








  it('Camino 8 - error interno del servicio', async () => {


    // ARRANGE


    saveAudit.mockRejectedValue(

      new InternalServerErrorException()

    );



    const resultado = registrarAuditoria(

      {
        action: 'DELETE',

        entity: 'USER'
      },

      saveAudit

    );



    // ASSERT


    await expect(resultado)

      .rejects

      .toThrow(InternalServerErrorException);



  });



});






// =====================================
// SIMULACIÓN DEL CASO DE USO
// =====================================


async function registrarAuditoria(

  data: any,

  saveAudit: any

) {


  if (!data.action || !data.entity) {

    throw new BadRequestException();

  }



  if (data.userId === null) {

    throw new NotFoundException();

  }



  return await saveAudit(data);


}






async function consultarAuditoria(

  findAudit: any

) {


  return await findAudit();


}