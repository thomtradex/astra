import { HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();

  const createHost = () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });

    return {
      host: {
        switchToHttp: () => ({
          getResponse: () => ({ status }),
          getRequest: () => ({ method: 'GET', url: '/api/test' }),
        }),
      } as never,
      status,
      json,
    };
  };

  it('handles HttpException with string response', () => {
    const { host, status, json } = createHost();

    filter.catch(new HttpException('Not found', HttpStatus.NOT_FOUND), host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Not found',
        error: 'HttpException',
        path: '/api/test',
      }),
    );
  });

  it('handles HttpException with message array', () => {
    const { host, json } = createHost();

    filter.catch(
      new HttpException({ message: ['Invalid email', 'Invalid name'] }, HttpStatus.BAD_REQUEST),
      host,
    );

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Invalid email, Invalid name',
      }),
    );
  });

  it('handles unknown exceptions as internal server errors', () => {
    const { host, status, json } = createHost();

    filter.catch(new Error('boom'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
        error: 'InternalServerError',
        path: '/api/test',
      }),
    );
  });
});
