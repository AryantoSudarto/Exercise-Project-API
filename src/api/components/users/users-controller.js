const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { password } = require('../../../models/users-schame');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  try {
    const users = await usersService.getUsers();
    return response.status(200).json(users);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Failed to create user, password is not same'
      );
    }

    const user = await usersService.getUserByEmail(email);
    if (user !== null) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Failed to create user, email is already taken'
      );
    }


    const success = await usersService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updatePassword(request, response, next) {
  try {
    const password_old = request.body.password_old;
    const password_new = request.body.password_new;
    const password_new_confirm = request.body.password_new_confirm;

    if (password_new !== password_new_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Failed to update password, new password is not same'
      );
    }

    const user = await usersService.getUser(request.params.id);
    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    const isPasswordMatched = passwordMatched(password_old, user.password);

    if (!isPasswordMatched) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Failed to update password, wrong password'
      );
    }

    const isUpdatePasswordSuccess = await usersService.updatePassword(
      request.params.id,
      password_new
    );

    if (!isUpdatePasswordSuccess) {
      throw errorResponder(
        errorTypes.SERVER,
        'password is not updated, Something is wrong'
      );
    }

    return response.status(200).json({
      id: request.params.id,
      password_new,
      message: 'password was succesfully updated',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
};
