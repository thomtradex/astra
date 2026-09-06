import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { of, throwError } from 'rxjs';

import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { AuditService } from '../audit.service';

import { AuditInterceptor } from './audit.interceptor';

type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};

describe('AuditInterceptor', () => {
  const auditService = {
    log: jest.fn(),
    mapHttpMethodToAction: jest.fn(),
  } satisfies Pick<AuditService, 'log' | 'mapHttpMethodToAction'>;

  const reflector = {
    getAllAndOverride: jest.fn(),
  } satisfies Pick<Reflector, 'getAllAndOverride'>;

  const interceptor = new AuditInterceptor(
    auditService as unknown as AuditService,
    reflector as unknown as Reflector,
  );

  const makeContext = ({
    method = 'GET',
    path = '/api/v1/assets',
    url = '/api/v1/assets',
    user,
    params,
    statusCode = 200,
  }: {
    method?: string;
    path?: string;
    url?: string;
    user?: AuthenticatedUser;
    statusCode?: number;
    params?: Record<string, string | undefined>;
  } = {}): ExecutionContext => {
    const request = {
      method,
      path,
      url,
      ip: '127.0.0.1',
      headers: { 'user-agent': 'jest' },
      user,
      params,
    } as RequestWithUser;

    const response = {
      statusCode,
    } as Response;

    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext;
  };

  const next: CallHandler = {
    handle: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    auditService.mapHttpMethodToAction.mockReturnValue('READ');
    next.handle = jest.fn().mockReturnValue(of(undefined));
  });

  it('skips audit when SKIP_AUDIT metadata is enabled', () => {
    reflector.getAllAndOverride.mockReturnValueOnce(true);

    const result = interceptor.intercept(makeContext(), next);

    expect(jest.spyOn(next, 'handle')).toHaveBeenCalled();
    expect(jest.spyOn(auditService, 'log')).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('skips public GET requests', () => {
    reflector.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(true);

    const result = interceptor.intercept(makeContext({ method: 'GET' }), next);

    expect(jest.spyOn(next, 'handle')).toHaveBeenCalled();
    expect(jest.spyOn(auditService, 'log')).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('skips requests without an organization', () => {
    reflector.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(false);

    interceptor.intercept(
      makeContext({
        method: 'POST',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          roles: [],
          organizationId: '',
          permissions: [],
        },
      }),
      next,
    );

    expect(jest.spyOn(next, 'handle')).toHaveBeenCalled();
    expect(jest.spyOn(auditService, 'log')).not.toHaveBeenCalled();
  });

  it('writes an audit record after a successful request', () => {
    reflector.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(false);

    next.handle = jest.fn().mockReturnValueOnce(of({ ok: true }));

    const result = interceptor.intercept(
      makeContext({
        method: 'POST',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          roles: [],
          organizationId: 'org-1',
          permissions: [],
        },
      }),
      next,
    );

    result.subscribe();

    expect(jest.spyOn(auditService, 'log')).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 'org-1',
        actorId: 'user-1',
        method: 'POST',
        path: '/api/v1/assets',
        statusCode: 200,
        resource: 'assets',
      }),
    );
  });

  it('writes an audit record after a failed request', () => {
    reflector.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(false);

    next.handle = jest.fn().mockReturnValueOnce(
      throwError(() => ({
        status: 404,
        message: 'Not found',
      })),
    );

    const result = interceptor.intercept(
      makeContext({
        method: 'GET',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          roles: [],
          organizationId: 'org-1',
          permissions: [],
        },
      }),
      next,
    );

    result.subscribe({
      error: () => undefined,
    });

    expect(jest.spyOn(auditService, 'log')).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 'org-1',
        actorId: 'user-1',
        method: 'GET',
        statusCode: 404,
        metadata: {
          error: 'Not found',
        },
      }),
    );
  });

  it('uses 500 when an error has no status', () => {
    reflector.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(false);

    next.handle = jest.fn().mockReturnValueOnce(
      throwError(() => ({
        message: 'Unexpected failure',
      })),
    );

    interceptor
      .intercept(
        makeContext({
          method: 'POST',
          user: {
            id: 'user-1',
            email: 'test@example.com',
            roles: [],
            organizationId: 'org-1',
            permissions: [],
          },
        }),
        next,
      )
      .subscribe({
        error: () => undefined,
      });

    expect(jest.spyOn(auditService, 'log')).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
      }),
    );
  });

    it('includes route resource id when available', () => {
      reflector.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(false);

      next.handle = jest.fn().mockReturnValueOnce(of({ ok: true }));

      const result = interceptor.intercept(
        makeContext({
          method: 'PATCH',
          path: '/api/v1/work-orders/work-order-1',
          url: '/api/v1/work-orders/work-order-1',
          params: {
            id: 'work-order-1',
          },
          user: {
            id: 'user-1',
            email: 'test@example.com',
            roles: [],
            organizationId: 'org-1',
            permissions: [],
          },
        }),
        next,
      );

      result.subscribe();

      expect(jest.spyOn(auditService, 'log')).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: 'org-1',
          actorId: 'user-1',
          resource: 'work-orders',
          resourceId: 'work-order-1',
          method: 'PATCH',
          path: '/api/v1/work-orders/work-order-1',
          statusCode: 200,
        }),
      );
    });

});
