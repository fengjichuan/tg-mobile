/** OpenAPI / JSON Schema for POST /v1/users/login only. */

export const postV1UsersLoginBodySchema = {
  $id: 'PostV1UsersLoginBody',
  type: 'object',
  required: ['username', 'password'],
  additionalProperties: false,
  properties: {
    username: { type: 'string', minLength: 1 },
    password: { type: 'string', minLength: 1 },
  },
} as const;
