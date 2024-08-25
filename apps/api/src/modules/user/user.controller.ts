import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { IOptions, RoleType, UserDeleteResponse, UserListResponse, UserProfileResponse, UserResponse } from '@shared';

import { catchAsync } from '@/utils/catchAsync';
import { pick } from '@/utils/pick';
import { ApiError } from '@/common/errors/ApiError';

import { permissionService } from '../permissions/permission.service';
import * as userService from './user.service';

export const createUser = catchAsync(async (req: Request, res: Response<UserResponse>) => {
  const isAllowed = permissionService.checkPermissions(req.user.role, 'create', 'users');
  if (!isAllowed) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to create users');
  }

  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

export const getUsers = catchAsync(async (req: Request, res: Response<UserListResponse>) => {
  const filter = pick(req.query, ['name', 'roles']);
  const options: IOptions = pick(req.query, ['sortBy', 'limit', 'offset', 'projectBy']);
  const isAllowed = permissionService.checkPermissions(req.user.role, 'list', 'users');
  if (!isAllowed) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to list users');
  }

  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

export const getMe = catchAsync(async (req: Request, res: Response<UserProfileResponse>) => {
  const user = await userService.getMe(req.user['id']);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (req.user['id'] !== user['id']) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only get your own profile');
  }

  res.send(user);
});

export const getUser = catchAsync(async (req: Request, res: Response<UserResponse>) => {
  if (typeof req.params['userId'] === 'string') {
    const user = await userService.getUserById(req.params['userId']);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    res.send(user);
  }
});

export const updateUser = catchAsync(async (req: Request, res: Response<UserResponse>) => {
  if (typeof req.params['userId'] === 'string') {
    const userId = req.params['userId'];
    const currentUser = req.user;

    const isAllowed = permissionService.checkPermissions(currentUser.role, 'update', 'users');
    if (!isAllowed) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to update users');
    }

    if (userId !== currentUser['id'] && currentUser.role !== RoleType.Admin) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You can only update your own profile');
    }

    const user = await userService.updateUserById(userId, req.body);
    res.send(user);
  }
});

export const deleteUser = catchAsync(async (req: Request, res: Response<UserDeleteResponse>) => {
  if (typeof req.params['userId'] === 'string') {
    await userService.deleteUserById(req.params['userId']);
    res.status(httpStatus.NO_CONTENT).send();
  }
});
