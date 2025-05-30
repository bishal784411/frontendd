import Joi from 'joi';

export const loginValidator = Joi.object({
    email: Joi.string().email({ tlds: { allow: ['com', 'net', 'org'] } }).required(),
    password: Joi.string().min(8).required(),
}).options({ abortEarly: false });